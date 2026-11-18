"""Offline harness contract checks: no browser, app launch or model API required."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import client
import scenarios
import verify


class HarnessTests(unittest.TestCase):
    def test_hands_only_cannot_fall_back_to_controllers(self):
        with tempfile.TemporaryDirectory() as folder:
            c = client.Client(folder, hands_only=True)
            with patch.object(client.subprocess, 'run') as run:
                for data in [{'mode': 'controller'}, {'device': 'controller-right'}]:
                    with self.assertRaisesRegex(RuntimeError, 'rejected controller'):
                        c.run('xr', 'set-transform', data)
                run.assert_not_called()

    def test_transport_rejects_errors_even_with_parseable_output(self):
        with self.assertRaisesRegex(RuntimeError, 'not ready'):
            client.decode(json.dumps({'ok': False, 'error': 'not ready'}))
        with self.assertRaisesRegex(RuntimeError, 'valid JSON'):
            client.decode('', 'startup failed', 1)
        self.assertEqual(client.decode('{"ok":true,"data":{"result":{"value":3}}}'), {'value': 3})
        with self.assertRaisesRegex(RuntimeError, 'unknown target'):
            client.decode('', '{"ok":false,"error":"unknown target"}', 1)

    def test_missing_runtime_does_not_start_or_replay_without_explicit_flags(self):
        class Stopped:
            def __init__(self): self.calls = []
            def run(self, group, action):
                self.calls.append((group, action))
                return {'state': {'running': False}}
        c = Stopped()
        with self.assertRaisesRegex(RuntimeError, 'stopped'):
            verify.ready(c)
        self.assertEqual(c.calls, [('dev', 'status')])
        self.assertFalse(verify.parse_args([]).replay)
        self.assertFalse(verify.parse_args([]).start)

    def test_ready_reads_the_managed_browser_state_not_a_top_level_guess(self):
        class Running:
            def run(self, group, action):
                return {'state': {'running': True, 'browserCommandReady': True, 'session': {'browser': {'commandReady': True}}}}
        with patch.object(verify.time, 'sleep', side_effect=AssertionError('No readiness polling needed')):
            self.assertTrue(verify.ready(Running())['state']['browserCommandReady'])

    def test_one_readiness_flag_is_not_enough(self):
        class HalfReady:
            def run(self, group, action):
                return {'state': {'running': True, 'browserCommandReady': True,
                                  'session': {'browser': {'commandReady': False}}}}
        with patch.object(verify.time, 'monotonic', side_effect=[0, 0, 51]), \
             patch.object(verify.time, 'sleep'):
            with self.assertRaisesRegex(RuntimeError, 'not command-ready'):
                verify.ready(HalfReady())

    def test_preflight_never_enters_the_gameplay_path(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            cli = root / 'cli.js'
            cli.touch()
            with patch.object(verify, 'ROOT', root), patch.object(verify, 'CLI', cli), \
                 patch.object(verify, 'ready', return_value={'state': {'browserCommandReady': True}}), \
                 patch.object(scenarios, 'prepare') as prepare:
                self.assertEqual(verify.main([]), 0)
                prepare.assert_not_called()
            report = json.loads(next(root.glob('artifacts/emulator/*/report.json')).read_text())
            self.assertEqual(report['result'], 'preflight-passed')

    def test_locked_encounters_cannot_be_fabricated(self):
        class Locked:
            def metrics(self): return {'completed': 0}
            def press(self, target): raise AssertionError('No input allowed before prerequisite check')
        with self.assertRaisesRegex(RuntimeError, 'locked'):
            scenarios.select(Locked(), 3, 2)

    def test_world_to_wrist_mapping_tracks_reduced_and_normal_reach(self):
        for scale, center in [(.62, -.42), (.8, -.55)]:
            p = client.wrist(0, 1.02, -.62, {'worldScale': scale, 'bridgeHeight': 1.26})
            self.assertAlmostEqual(p['y'], 1.26)
            self.assertAlmostEqual(p['z'], center + .035)
        self.assertEqual(client.ROOT, Path(__file__).resolve().parents[2])


if __name__ == '__main__':
    unittest.main()
