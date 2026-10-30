# The Space Between — First Light

A first playable IWSDK / WebXR prototype: bring two hand markers together to catch a thread, spread them to the glowing shores, and hold the bridge while a leaf creature crosses.

## Play locally

The built desktop version is served at http://localhost:8082/ during this session.

Drag either glowing marker toward the other until a thread appears. Then place one marker on each golden shore ring. The traveler crosses automatically after a short steady hold. Moving away pauses the crossing without losing progress. Begin again resets the scene. Sound is optional.

## Development

Requires Node 24 or another Node version supported by IWSDK. Run `npm install`, then `npm run dev:runtime`. The official development server uses https://localhost:8081 and supplies the Meta Quest 3 emulator. Its local certificate may need to be trusted by the person using the browser.

`npm run typecheck` checks TypeScript. `npm run build` creates dist. To preview the built desktop version without the emulator, run `python3 -m http.server 8082 --bind 127.0.0.1` inside dist.

## Current scope

Procedural floating islands, leaf creature with simple animation, woven bridge, desktop pointer controls, optional synthesized chimes, and WebXR wrist position input. No external art assets required. Fonts have system fallbacks.

The production build and desktop crossing have been checked. Physical Quest hand tracking, seated reach, scale, tracking-loss behavior, and hardware performance still require testing. Desktop mode is practice input, not a substitute for those checks. Shelter, handoff, and the longer story are future milestones.

Built with Meta's official IWSDK starter (1.1.0-rc.2). Preserve the starter's LICENSE for its included code.

## Discovery, menu, and local saves

First visit starts with a three-step cosmic discovery. In desktop mode, select Explore closer or scroll upward. With tracked hands, bring them near each other and spread them apart for each reveal. Discovery leads to a title menu with Play, Continue crossing when applicable, and Replay the discovery.

Crossing progress and sound preference are saved in browser localStorage, periodically and on Save & menu / page exit. Return visits bypass discovery. Saves are specific to the same browser and site address; clearing browser data removes them. There is no cross-device/cloud sync. Blocked storage falls back to session-only play. The planet art and transition are a first prototype; hand-driven discovery and spatial menu still need physical headset validation. In VR, use the UIKitML touch menu for Play/Continue, sound and exit; a small Menu button returns from the crossing. Brief fingertip taps for Play, sound and Menu have been verified in the XR emulator.

## Comfort and alternative controls

In VR, open Menu → Comfort & controls. Place world in front of me sets a stationary world relative to your current head height and forward direction; Raise/Lower adjusts it in 5 cm steps. Reduced reach brings a smaller world closer. Re-place it after changing seats or position. Height adjustment lasts for the session; reduced reach and assist preferences are saved on this browser.

Standard play accepts two tracked hands or controller grip positions: bring them near to catch the thread, then move them to the shore rings. No trigger is needed for the bridge; triggers activate menu rays. One-hand assist supports either hand or controller: dwell at the left ring, then the right ring, and rest near either ring to keep the crossing moving. Moving away pauses safely. Discovery has spatial Explore closer and Skip intro buttons, so the two-hand gesture is optional.

Performance check is collapsed inside the desktop title menu. It reports callback rate, peak render calls and triangles, not measured headset GPU time. RuntimeMetrics exposes the same development telemetry to the IWSDK inspector. Floating lights use one Points object and static island meshes are merged by lighting properties. See PRIORITY-VALIDATION.md for test evidence and remaining hardware checks.
