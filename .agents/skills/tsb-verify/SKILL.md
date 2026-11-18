---
name: tsb-verify
description: Verify The Space Between with deterministic checks and focused desktop-emulator replays after game or setup changes. Does not deploy or change providers.
---

Use the application repository as the working directory. Read its AGENTS.md.

Run `npm run verify` first. It checks TypeScript, game behaviors, harness safeguards and the production build without opening a browser.

For immersive changes, use `npm run verify:emulator` to inspect readiness. With an authorized gameplay test, run `npm run verify:emulator -- --start --replay --suite leaf` (or `chapters`, `finale`, `memory`, `audio`, `residents`, `habitat`, `menus`). `--start` starts a visible managed emulator only when stopped. Replay uses actual UI/hand inputs, replaces the active development-browser checkpoint and keeps earned milestones. Never clear browser storage or fabricate unlocks. Later suites require previously earned progress; report a prerequisite instead of overriding it. Do not run every suite for a narrow change. Add `--hands-only` to prohibit controller input and use fingertip presses for menus; a failed hand press is a failed audit, not permission to fall back to controllers.

The wrapper prints named state evidence and writes ignored reports/screenshots under `artifacts/emulator/`. Distinguish preflight, deterministic tests and actual replay passes. A screenshot alone does not prove an interaction. On failure, inspect the named state and matching IWSDK specialist; do not sweep coordinates or repeatedly restart. Preserve the failure report and rerun only the affected suite after a correction.

Use the existing `iwsdk-dev` router and its specialists for implementation. This skill adds game-specific checks, not a second development workflow. No headset is required. Do not infer headset performance or first-time player comprehension from emulator results. No publishing, GitHub writes, scheduled automation, installation of services, or routing/model changes are authorized by verification.
