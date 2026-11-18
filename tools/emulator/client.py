"""Project-local IWSDK transport. All paths are derived from this file."""
import json
import math
from pathlib import Path
import subprocess
import time

ROOT = Path(__file__).resolve().parents[2]
CLI = ROOT / 'node_modules/@iwsdk/cli/dist/cli.js'


def decode(stdout, stderr='', returncode=0):
    try:
        envelope = json.loads(stdout or stderr)
    except (ValueError, TypeError) as exc:
        raise RuntimeError('IWSDK returned no valid JSON: ' + (stderr or stdout)[-1200:]) from exc
    if returncode or not envelope.get('ok'):
        raise RuntimeError(str(envelope.get('error', stderr or 'IWSDK command failed')))
    return envelope.get('data', {}).get('result', envelope.get('data', {}))


def wrist(x, y, z, metrics):
    scale = metrics['worldScale']
    center = -.42 if scale < .7 else -.55
    return {'x': x * scale, 'y': metrics['bridgeHeight'] + (y - 1.02) * scale,
            'z': center + (z + .62) * scale + .035}


class Client:
    def __init__(self, evidence, hands_only=False):
        self.evidence = Path(evidence)
        self.evidence.mkdir(parents=True, exist_ok=True)
        self.events = []
        self.hands_only = hands_only

    def run(self, group, action, data=None, flags=()):
        if self.hands_only and data and (data.get('mode') == 'controller' or str(data.get('device', '')).startswith('controller')):
            raise RuntimeError('Hands-only audit rejected controller input.')
        args = ['node', str(CLI), group, action]
        if data is not None:
            args += ['--input-json', json.dumps(data)]
        proc = subprocess.run(args + list(flags), cwd=ROOT, capture_output=True,
                              text=True, timeout=90)
        try:
            return decode(proc.stdout, proc.stderr, proc.returncode)
        except RuntimeError as exc:
            (self.evidence / 'failed-command.txt').write_text(proc.stdout + '\nSTDERR:\n' + proc.stderr)
            raise RuntimeError(group + '.' + action + ': ' + str(exc)) from exc

    def metrics(self):
        entities = self.run('ecs', 'find', {'namePattern': 'runtime-metrics'})['entities']
        if not entities:
            raise RuntimeError('RuntimeMetrics is unavailable; the game has not initialized.')
        return self.run('ecs', 'query', {'entityIndex': entities[0]['entityIndex'],
                        'components': ['RuntimeMetrics']})['components'][0]['values']

    def report(self, name):
        m = self.metrics()
        keys = ['habitatResponse', 'habitatRestored', 'habitatPathLight', 'habitatRustles', 'habitatWaterGain', 'chapter', 'encounter', 'progress', 'completed', 'challengeDone',
                'homeResidentElement', 'homeResidentModel', 'chapterRestored', 'welcomeLight', 'puzzleInvitations', 'giftOffered',
                'lastLightStage', 'lastLightAqueduct', 'memoryGrowth', 'memoryLesson',
                'planetLegacy', 'planetMemoryVisible']
        event = {'name': name, 'state': {k: m[k] for k in keys if k in m}}
        self.events.append(event)
        print(json.dumps(event), flush=True)
        return m

    def press(self, target):
        if self.hands_only:
            self.run('xr', 'set-input-mode', {'mode': 'hand'})
            result = self.run('xr', 'run-sequence', {'device': 'hand-right',
                'steps': [{'target': target, 'press': {}}]}, ('--timeout', '45000'))
            self.events.append({'name': 'hand-press', 'target': target, 'presses': result.get('presses', [])})
            if self.metrics().get('uiAction') != target:
                raise RuntimeError('Hand press did not activate: ' + target)
            return
        self.run('xr', 'set-input-mode', {'mode': 'controller'})
        try:
            self.run('xr', 'set-transform', {'device': 'controller-right',
                     'position': {'x': .15, 'y': 1.40, 'z': -.1}})
            targets = self.run('xr', 'list-targets')['targets']
            found = next((t for t in targets if t['name'] == target), None)
            if not found:
                raise RuntimeError('Visible UI target is missing: ' + target)
            self.run('xr', 'look-at', {'device': 'controller-right', 'target': found['position']})
            self.run('xr', 'select', {'device': 'controller-right', 'duration': .2})
        finally:
            self.run('xr', 'set-input-mode', {'mode': 'hand'})

    def point(self, x, y=1.02, z=-.54, seconds=.6):
        self.run('xr', 'set-transform', {'device': 'hand-right', 'anchor': 'wrist',
                 'position': wrist(x, y, z, self.metrics()),
                 'orientation': {'fingers': 'forward', 'palm': 'down'}})
        time.sleep(seconds)

    def wait(self, predicate, timeout=35):
        end = time.monotonic() + timeout
        while time.monotonic() < end:
            m = self.metrics()
            if predicate(m):
                return m
            time.sleep(.2)
        self.report('timeout')
        raise RuntimeError('Timed out waiting for the requested game state.')

    def circle(self, x=0, y=1.13, z=-.52, radius=.16):
        self.point(x + radius, y, z, .3)
        m = self.metrics()
        steps = []
        for i in range(41):
            a = i / 40 * math.pi * 2
            steps.append({'position': wrist(x + math.cos(a) * radius,
                          y + math.sin(a) * radius, z, m), 'anchor': 'wrist', 'duration': .15})
        self.run('xr', 'run-sequence', {'device': 'hand-right', 'body': 'fixed',
                 'gaze': 'fixed', 'idleHand': 'keep', 'steps': steps})

    def photo(self, name):
        self.run('xr', 'set-transform', {'device': 'headset',
                 'position': {'x': 0, 'y': 1.6, 'z': 0},
                 'orientation': {'x': -.24740396, 'y': 0, 'z': 0, 'w': .96891242}})
        self.run('browser', 'screenshot', {}, ('--output-file', str(self.evidence / (name + '.png'))))
