#!/usr/bin/env python3
"""Read-only preflight by default; explicit replay uses normal game inputs."""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import subprocess
import sys
import time

from client import CLI, ROOT, Client
import scenarios


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--suite', choices=['leaf', 'chapters', 'finale', 'memory', 'audio', 'residents', 'habitat', 'menus', 'invitations'], default='leaf')
    parser.add_argument('--hands-only', action='store_true', help='Use hand presses for menus and prohibit controller input.')
    parser.add_argument('--replay', action='store_true', help='Authorize replacing the active managed-browser checkpoint by replaying encounters.')
    parser.add_argument('--start', action='store_true', help='Start a visible managed emulator if it is stopped. Does not restart a running one.')
    return parser.parse_args(argv)


def ready(client, start=False):
    status = client.run('dev', 'status')
    if not status['state']['running'] and not status['state'].get('starting'):
        if not start:
            raise RuntimeError('Emulator is stopped. Run npm run dev, or add --start. No game replay was performed.')
        check = subprocess.run(['npm', 'run', 'typecheck'], cwd=ROOT)
        if check.returncode:
            raise RuntimeError('TypeScript failed; the emulator was not started.')
        client.run('dev', 'up', flags=['--timeout', '45000'])
    end = time.monotonic() + 50
    while time.monotonic() < end:
        status = client.run('dev', 'status')
        if (status.get('state', {}).get('browserCommandReady') and
                status.get('state', {}).get('session', {}).get('browser', {}).get('commandReady')):
            return status
        time.sleep(1)
    raise RuntimeError('The managed browser is not command-ready. No automatic restart/recovery was attempted.')


def main(argv=None):
    args = parse_args(argv)
    if not CLI.is_file():
        print('Run npm ci in the game repository before verification.', file=sys.stderr)
        return 1
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    evidence = ROOT / 'artifacts/emulator' / (stamp + '-' + args.suite)
    c = Client(evidence, hands_only=args.hands_only)
    report = {'handsOnly': args.hands_only, 'suite': args.suite, 'mode': 'replay' if args.replay else 'preflight',
              'result': 'failed', 'events': c.events}
    try:
        status = ready(c, args.start)
        report['runtimeReady'] = bool(status['state']['browserCommandReady'])
        if args.replay:
            scenarios.prepare(c)
            getattr(scenarios, args.suite)(c)
            errors = [e.get('message') for e in c.run('browser', 'logs', {'count': 30})
                      if e.get('level') == 'error' and 'net::ERR_ABORTED' not in e.get('message', '')]
            if errors:
                raise RuntimeError('Browser errors: ' + '; '.join(errors))
            report['result'] = 'replay-passed'
        else:
            report['result'] = 'preflight-passed'
            print('Managed emulator ready. No input, settings or save data changed; this is not a gameplay pass.')
        print('PASS:', report['result'])
        return 0
    except Exception as exc:
        report['error'] = str(exc)
        print('FAIL:', exc, file=sys.stderr)
        return 1
    finally:
        # Leave failed state observable; do not reset saves or silently rerun mutations.
        (evidence / 'report.json').write_text(json.dumps(report, indent=2) + '\n')
        print('Evidence:', evidence, flush=True)


if __name__ == '__main__':
    sys.exit(main())
