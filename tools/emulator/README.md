# Game verification

Run from the game repository with Node 24 and Python 3.9+:

```sh
npm ci
npm run setup:agent
npm run verify
```

`setup:agent` regenerates ignored, machine-specific Codex MCP configuration from the installed IWSDK packages. It preserves the game's AGENTS.md. Approved repository skills are checked in under `.agents/skills`; secrets and generated configuration remain ignored. New Codex sessions should start in this repository; the parent chat folder is not the application. If prompted by Codex, review the local project before trusting its configuration. No model or provider is changed.

`verify` checks TypeScript, the game behavior tests, the offline harness contract tests, and a production build. It does not open a browser, deploy or make model API calls. The workflow under `.github/workflows/validate.yml` runs the same command on pull requests/main pushes when the repository is used on GitHub. Deployment is manual-only and remains separate.

## Emulator

```sh
npm run verify:emulator
npm run verify:emulator -- --start
npm run verify:emulator -- --replay --suite leaf
```

The default command is a readiness preflight, not a gameplay test. It fails clearly if the emulator is stopped. `--start` checks TypeScript and starts a visible managed emulator only when stopped; it never restarts a running session. It waits for both `state.browserCommandReady` and `state.session.browser.commandReady`, as documented in Meta's AI workflows. Browser operations always target the SDK-managed desktop browser, never a paired physical device.

`--replay` authorizes normal UI and simulated-hand inputs in that managed development browser. It replaces the active checkpoint, sets one-hand assist/reduced reach for reproducible reach, and keeps earned milestones. It does not clear browser storage, edit save JSON or invent unlocks. Use a development save, not a browser checkpoint you want to keep active. The production preview and development origins have separate saves. Audio tests restore the sound preference they found.

| Suite | Coverage | Prerequisite |
| --- | --- | --- |
| `leaf` | All three Leaf encounters, two path invitations, gift scope, restoration and light cap | Leaf's first encounter; later encounters are earned during the run |
| `chapters` | All twelve encounters with one hand and three restoration patches per region | None beyond the normal first encounter |
| `finale` | Final Earth encounter, both water solutions, tracking-loss safety, deliberate handoff | Eleven earned milestones; never bypassed |
| `memory` | The optional flower and teaching moment, including already-restored state | Twelve milestones and a finished The Last Light checkpoint |
| `residents` | Visible hut resident follows all four chapters using the authored elemental models | Nine earned milestones |
| `habitat` | Brush response and spatial sounds in all four chapters; tracking-loss release, unchanged puzzles, saved garden/lantern restoration after reload | Twelve earned milestones |
| `audio` | Actual nonzero audio and full-mix mute; restores sound preference | An ordinary playable checkpoint; OS/browser audio availability |

Each invocation writes `report.json` and any screenshots to a timestamped ignored folder under `artifacts/emulator/`. A report explicitly distinguishes preflight, replay success and failure. The failure state is preserved for investigation; inputs are not blindly retried. Use `iwsdk-debug` or the matching SDK interaction skill to diagnose the measured state, then rerun only the affected suite.

These maintained modules consolidate the useful chapter, finale, world-memory and audio procedures from the earlier scratch scripts. Old scripts outside this repository remain historical evidence and are not part of the verification command. All maintained paths derive from `__file__`; no developer home directory or external work folder is required.

Emulator replays establish input/state behavior. They do not establish headset FPS or unaided human puzzle comprehension.

## Working directory

In the desktop app, add this repository as a local project folder and set it as primary. The app's own settings cannot be changed by our computer-use tools. For Codex CLI, from this repository use:

```sh
codex --cd .
```

The existing chat's parent folder has a short AGENTS.md routing note pointing here. That note is a fallback, not a claim that this chat's app-level working directory has changed.
