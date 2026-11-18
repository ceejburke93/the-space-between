# Elemental journey validation

Historical validation below records earlier passes. See the October 31 puzzle revision at the end for the current mechanics and checks.

## Completed checks

- All twelve encounters completed in the live IWSDK emulator with one simulated tracked hand and the other disconnected.
- Grass replays kept the existing three milestones; Water advanced completion from 3 through 6, Fire through 9, and Earth through 12.
- Final Earth replay paused at progress 0.33158889412879944. Menu then Continue restored that exact progress; completing it again kept the milestone count at 12.
- Saved checkpoints, interrupted homecomings, locked encounters, corrupt input and legacy saves are covered by behavior tests.
- Gesture tests cover lifting, pressing, circles in both directions, all eight added midpoint tasks, and tracking loss. Missing tracking never earns a challenge.
- TypeScript check, 21 tests and production build passed after the final implementation changes.
- A separate production build using --base=/the-space-between/ succeeded. Its HTML, JavaScript and CSS served successfully under that local project path on resuming. This is an asset-path check, not evidence of a published GitHub Pages site.

## Fixes found during integration

Fire approach movement initially biased circle recognition. Recognition now measures the span of unwrapped arc, accepting either direction after an approach. Teleport-sized jumps do not count. Regression tests cover these cases.

Continue now preserves unfinished replays even after all twelve milestones are earned. Lantern lighting follows the actual midpoint task. Earth widening stays centered on the bridge. Static scenery, garden flowers and stepping stones are batched or instanced.

## Visual and performance limits

Local terrain and vegetation differ by element while sky, moon, stars, mountain horizon, fog and global lighting remain shared. The saved final Earth screenshot shows the widened path and completed garden ending.

One final Earth emulator sample reported 210 stereo render calls, 27,548 triangles and approximately 60 callbacks per second. These counters do not measure headset GPU frame time. No hardware-performance claim is made. Validation uses the emulator as agreed; hardware testing is not being treated as an entry prerequisite.

This remains procedural prototype art. The original twelve encounters established interaction progression. Branching and alternative solutions were added in the October 31 revision; their presence alone does not prove strategic depth.

## Emotional-world pass, October 30

- 26 behavior tests pass, including the optional meeting, seed receive/open/lift alternatives, tracking-loss recovery, saved bloom and completed-finale restoration.
- Live one-hand emulator input completed the leaf meeting (stage 3), Grass crossing, seed receive and bloom (stage 2). Existing milestones stayed at 12 during replay.
- Live Earth encounter three completed its widening task, then the cooperative finale reached time 24. Menu/Continue restored the final garden and bloomed seed; a runtime restart retained both.
- Water encounter two was replayed after the ending changes: gather/lift, lower-to-calm midpoint and homecoming passed with one simulated hand.
- Visual review corrected the companions’ final gathering positions to the right island. Grounded companions have stepping feet; Water and Fire intentionally float. The completed-garden instruction fades only in that final scene, preserving earlier replay prompts.
- Motion cues use one point cloud; flower propagation uses one instanced mesh. No camera movement, flashing, reward timer penalty or new gameplay dashboard was added.
- Fire encounter one passed its circle-and-follow input after the cue changes. The final Earth widening encounter passed again; companions land within the home island and their stepping lanes fit inside the shared deck.

## Gesture feel and awakenings, October 30

- All 30 behavior tests pass. Four new checks cover slow/fast motion quality, tracking reacquisition, one-shot completion feedback and the timing/persistence of all four region reveals.
- All four third encounters were completed through simulated one-hand input after these changes. Grass, Water, Fire and Earth each reached gestureProgress 1 and awakening 1, with completion count unchanged at 12 during replay. Grass lantern, Fire receive/carry and Earth widening checkpoints passed.
- Care quality and calm reached 1 under steady support. Quicker Water input reduced the positive quality response while progress stayed at 1 and milestones stayed at 12. No speed threshold was added to the base gesture or crossing support rules.
- Visual review covered the expanded canopy and the opened Earth garden. Water and Fire event captures are also saved beside the project. The Earth delivery capture uses a downward headset gaze toward the world; the camera is never animated by the game.
- The four transformations use local geometry/material animation only. The shared background, fog, lights, world placement, comfortable reach options and safe tracking-loss pause remain intact. Emulator callback counters are not headset GPU measurements.

## Signature interaction, authored art and remembered ending

- All 38 behavior tests and TypeScript pass. New checks cover optional hand contact, safe withdrawal, both Leaf and Fire solutions, deliberate choice dwell, memory normalization and the remembered pause together.
- Live one-hand emulator contact reached the palm target with measured root-local foot-to-target error approximately 1.9e-14 metres during the held pose. The foot then returned to land, and First Light completed safely. This establishes the authored emulator contact, not physical hand-surface accuracy on hardware.
- A Seed of Trust completed through continuous supported-perch input and saved leafChoice 2. Shelter a Spark completed with the hand below the flame and saved fireChoice 2. The existing pause and above-shelter paths remain covered by regression tests.
- Both choices survived the runtime reload and appeared in the final Earth replay. The remembered finale reached time 24; its completion control waits until all companions finish their crossing.
- The Leaf body passed refreshed isolated material/clay inspection after correcting the vein attachment. Final model diagnostics report 1,916 triangles and no geometry warnings. Shared eyes/arms and the planted-foot solver remain separate.
- Actual canvas recordings with live game sound were exported and a saved WebM was opened in Chrome to verify visible gameplay playback. The trailer edit uses those recorded frames and sound, with a persistent emulator label; no synthetic game footage or microphone/desktop capture.
- The first discovery automatically advances through its three stages, then fades to the planet menu in about nine seconds. Manual replay and immediate skip remain available.
- A fresh production origin automatically reached the planet menu with 0 of 12 milestones and saving enabled. The edited gameplay trailer was exported successfully as WebM with the recorded live game sound.
- Final presentation review moved the pause control above/right of the play area to clear Leaf’s sightline. Corrected hand-contact and finale takes were recorded again; the final Earth replay retained both saved choices and reached finale time 24.
- Final build after the sightline correction passed. Both alternative solutions remain saved as choice 2 in the recorded finale; no milestones were added during replay.

## Performance guide review

Reviewed [Meta’s PC/Rift guidelines](https://developers.meta.com/vr/documentation/native/pc/dg-performance-guidelines/) and applied the relevant batching/profiling advice using [Meta’s WebXR workflow](https://developers.meta.com/vr/documentation/web/webxr-perf-workflow/). PC-specific draw budgets, Rift Store refresh requirements and unsupported sample SpaceWarp APIs were not applied to this WebXR game.

Three steady three-second windows before and after, with the same completed Grass encounter, hand pose, headset pose and 0.62 world scale:

| Measurement | Before | After |
| --- | --- | --- |
| Stereo draw calls | 312 | 284 |
| Game-system logic, mean of window averages | 0.218 ms | 0.209 ms |
| Triangles | approximately 47.4k | approximately 47.4k |
| Emulator callbacks/s | approximately 60 | approximately 60 |

The fifteen bridge threads now share one indexed LineSegments draw, preserving 495 original vertices, 480 segments, colors, sag, and the deck samples used by planted feet. The bridge needs one draw per eye instead of fifteen, and hidden bridge geometry is no longer rebuilt. Total scene draw calls fell about 9%. CPU differences at this scale are too small to establish a meaningful timing improvement; renderer submission, GPU work and hardware FPS are not measured by the game-system timer.

The existing optional Performance check now includes mean/peak game-logic time, explicitly excluding renderer/GPU cost. No resolution, lighting, texture or art-quality reduction was made.

All 41 behavior tests and TypeScript pass, including segment connectivity, snapped foot/deck height and floating-thread contacts/sag. A live one-hand crossing completed after batching; a final visual review retained the woven appearance.


## Puzzle revision, October 31

TypeScript, the production build and all 56 behavior tests pass. Fifteen new tests cover all eight later encounters, both Grass routes, both shelter solutions, lantern order and recharge, optional lily-garden recovery, moving loads, alternative/reversible stone arrangements, tracking-loss dwell reset, partial puzzle save/resume and the bounded deck profile.

Live emulator checks use one simulated hand with assisted input. The Grass seed and sheltered-route encounters, Water basin and cooperative lily encounter, and Fire shelter transfer have reached home with completion milestones unchanged at 12 during replay. Menu/Continue retained the cooperative Water checkpoint: fill 0.4, reserve 0.6 and the earned lily. The live checkpoint had a fully grown lily; partially grown lily persistence is covered by the pure save/resume test.

The pause button remains above/right of the play area; its panel orientation now matches the other spatial controls. Some subsequent menu pokes succeeded, but simulated touches still intermittently missed journey selections. Controller-ray navigation was then verified and used for the remaining encounter selections; the puzzles themselves still use one simulated hand. The orientation adjustment does not establish a complete poke fix. The Water visual review retained the familiar shared sky and clear play area while showing Leaf, the lily and curved stream.

These checks validate programmed solutions and recovery. They do not establish that an unfamiliar player can infer the solution, explain its cause, enjoy the pacing or discover optional mastery. The existing trailer predates this puzzle revision.


The final Fire lantern replay reached home with lamp mask 5 (one refuge plus home) and restored warmth approximately 0.81. Earth’s changing-load encounter stopped at progress 0.32 and 0.66 before reaching home. Both retained 12 completion milestones on replay. Recent browser logs contained no errors. These remaining runs used controller-ray menus and simulated-hand puzzle input.


Earth’s final stone assembly and sequential one-hand widening also reached home (progress 1, challenge complete, 12 milestones retained). All eight revised later encounters have now completed through simulated-hand gameplay. Alternative solutions and optional full-garden/full-lantern routes are covered by behavior tests; the live route selection used the sheltered Grass branch, one Water lily, one Fire refuge and the standard Earth arrangement.


## The Last Light, skills, creature surfaces and audio

The four-element finale now has real dependencies: route Water to open roots, latch Leaf’s shelter, divert Water away from the hearth, trace Fire’s familiar circle, then deliberately withdraw a tracked hand. Tracking loss cannot trigger the handoff. The companions then build their bridge and carry the last seed home, retaining the earlier Leaf/Fire memory gestures. Partial help, routing, the handoff and the ending clock are saved.

All 64 behavior tests, TypeScript and the production build pass. Eight new finale tests cover starting order, a wet hearth, both circle directions, reversible routing, one-hand anchors, tracking loss, checkpoint normalization and saved handoff. A live run reached all stages, retained shelter through Menu/Continue and a runtime restart, rejected tracking loss as release, and reached finale time 24 with 12 milestones. The first live run exposed Fire tracing accidentally changing Earth’s channel; the controls were separated in depth and a regression test reproduces the former overlap with a generous input-depth offset.

The new skill review led to two short routing labels (Roots/Garden), immediate directional channel feedback and music ducking under world cues. The puzzle skill is primarily a discrete-board playbook; its applicable principles are deterministic resolution and reversible state. Level-design informed familiar-rule combinations, clear causes and a rest after the solution. No generic screen shake or camera movement was introduced.

All four creature model diagnostics report no geometry warnings. Current body triangles: Leaf 2,300, Water 1,904, Fire 2,772, Earth 1,480. Water and Fire use continuous volumes; moss and mineral lines follow Earth’s actual surface. Leaf’s branch veins are attached to the crown’s front surface. Branch veins were combined from six meshes to one; both Water currents also share one mesh. Final Leaf/Water asset mesh counts are 6/2, down from the initial art pass’s 11/3, with unchanged triangles. This is an asset draw-count improvement, not an FPS claim. Shared face, arm and planted-foot anchors are preserved.

World audio uses browser HRTF panners, a head/camera-following listener, distance attenuation, bounded world cues, separate music/effects/ambience/interface buses and a shared compressed output. It has no microphone, network audio or downloaded samples. The complete output feeds the existing gameplay recorder. Source loops have short smooth seams; source/listener positions interpolate to reduce abrupt changes. Hidden page or hidden immersive visibility fades output; sound remains optional.

The live Web Audio graph produced nonzero output with sound on, exact zero RMS/peak after sound off, and nonzero output after restoring sound. A simulated head move to X=0.12/Z=0.04 and yaw=0.4 produced listener X≈0.12/Z≈0.04 and forward X≈−0.3894, while the actual Water panner stayed at X=0/Z≈−0.5316. In sampled ambience windows, final mix peaks were approximately 0.016–0.024 (below full scale). This checks signal, muting and spatial wiring; it does not certify −18 LUFS, true peak, subjective sound quality, headset GPU performance or player comfort.

Three pre-audio completed-finale windows measured about 0.20–0.22 ms game-system logic. Subsequent audio-on live samples were about 0.49–0.65 ms. These are emulator game-system timings, excluding renderer/GPU and audio-thread processing; no hardware FPS improvement is claimed.


The final combined replay completed Earth’s stone assembly with the upgraded body, then reached finale stages 0→3 through Earth/Water/Leaf, warmed the seed at stage 4 without changing the channel, retained stage 4 through tracking loss, and deliberately handed off at stage 5. Companions reached home at finale time 24, with 12 milestones retained. Final browser logs contained no errors. The built preview remains available on port 8082.

A native recording of the actual rendered finale and complete live game mix is saved at `../the-last-light-gameplay.webm` (14,708,557 bytes). Its WebM header contains VP9 video and an Opus track with two channels. The recording starts during the cooperative finale; it is an emulator excerpt, not new competition trailer footage. A final emulator garden screenshot is saved at `../the-last-light-final.png`. The emulated viewer looks down toward the tabletop; the game never animates the camera.


## Habitat art revision

TypeScript, the production build and all 64 behavior checks pass. Four isolated habitat diagnostics reported three meshes each, approximately 8.1–9.1k triangles and no invalid geometry warnings after fixing the roof tips. A full First Light crossing reached home with one simulated hand in the new Grass habitat (progress 1, one earned milestone). The managed browser started with a fresh development save, so the regression used its unlocked first encounter; the attempted locked Earth replay was not counted as a pass. New biome variants were inspected as model assets; a full playthrough of all four revised regions has not been claimed.

The final rendered Grass scene is `../environment-final.png`. Shared deck height and puzzle anchors were retained. The world art uses local geometry/material changes, preserving the shared sky, camera behavior and sound systems. Static batching now preserves source vertex colors, including authored home contact shading. Live shadow maps remain disabled; local doorway lights do not cast shadows. No heavy post-processing was added.

Reviewed the GameAnalytics interview with Schell Games about immersive worlds: https://www.gameanalytics.com/blog/among-us-vr-dev-talks-about-how-to-create-immersive-worlds. Its applicable direction is to support the player fantasy with clear interaction expectations and to limit decorative clutter. Native-engine shadow cascade and distance-field advice was not copied into the WebXR renderer.


## Progressive discovery planet

TypeScript, the production build and all 65 behavior checks pass. A new check covers bounded, monotonic detail reveal driven by zoom scale. The continuous planet terrain, three batched close-detail surfaces, cloud instances and atmosphere use six mesh submissions; the model preview reports about 29.1k triangles, including instanced clouds. The atmosphere intentionally renders back faces and transparent effects are excluded from preview framing.

The existing Replay discovery control and two real Explore closer presses reached the close planet view. A further press returned to the menu, and reloading opened the menu with discovery controls hidden. The one-time introduction behavior is retained. The close title fades away rather than obscuring the enlarged surface. Manual replay remains user-controlled; the initial automatic sequence gives its final view a longer pause. The final close-up is saved at `../planet-close-discovery.png`. A stylesheet request was aborted during the deliberate reload; no application failure was observed.


## Two valid solutions for The Last Light

All 72 behavior checks, TypeScript and the production build pass. The finale accepts either diverting Water through Garden or lifting the Roots channel into an Earth aqueduct above Fire. Both retain earlier help and lead to the same ending. The stone bed and stream share a continuous sampled path; no additional live shadow lights or heavy post-processing were added.

A real one-hand emulator run completed the remaining eleven encounters through twelve earned milestones. Focused finale checks confirmed raising, lowering, re-raising, Garden diversion, Menu/Continue restoration and tracking-loss safety. The first run exposed a high hand over Earth's control accidentally counting as withdrawal. A regression check now covers that case, and a repeated live high hold stayed at the ready stage. Desktop pointer movement plus wheel input successfully raised, lowered and rebuilt the aqueduct. Browser automation must move the pointer before pressing; passing a point to pointerDown alone does not move it.

The raised-puzzle runtime view is saved at `../earth-aqueduct-puzzle.png`. These checks validate behavior and emulator input, not hardware frame rate or first-time player understanding.

The final raised-route replay reached ready stage 4, stayed ready while holding the raised control, accepted deliberate withdrawal at stage 5 and reached home at finale time 24 with all twelve milestones retained. Final browser logs contained no errors; immersive-session resizing emitted the renderer warning about changing size while presenting.


## Companion reactions and discovery-led finale

All 78 behavior tests, TypeScript and the production build pass. Chapter poses now distinguish Leaf testing support, Water sharing, Fire sheltering and Earth bracing. In the finale, companions stand or hover by their work, face its cause, and exchange glances when ready. Fire's body visibly contracts while the hearth is wet, then recovers when either water solution clears it. Earth lifts its arms with the aqueduct. Existing bodies, geometry, world anchors and camera behavior are retained. The ending begins at these working positions, retaining the shared pause and final destination.

Guidance begins with a short observation. Two unsuccessful approaches add local moving demonstrations; four reveal explicit instructions. Progress, including partial shelter anchors and Fire formation, clears the count. Time resting, brief entries and tracking loss cannot escalate guidance. A live run revealed the hand carried over from Earth was initially counted; a new regression and an outside-first approach gate exclude that transition. Menu Settings and desktop Comfort & controls offer immediate explicit guidance, retained for the current session.

The focused one-hand live run observed attempts 0→2→4 and guidance levels 0→1→2. Disconnecting the hand retained exactly two attempts. Real ray clicks switched explicit guidance on, continued with level 2, then switched back to gentle with level 0. Water, Roots and Leaf advanced normally. The wet-hearth reaction measured Fire body height ratio 0.65, then 1.0 after raising the channel; Earth's arm reached −0.9 radians. The ready state survived a high control hold, deliberate withdrawal started the ending and the companions reached home at time 24 with twelve milestones retained. The preceding full Earth encounter also reached home in the revised build.

Runtime captures: `../companions-wet-hearth.png` and `../companions-ready.png`. A compact comparison with the previous finale showed no blocking UI overlap or scene replacement. Final browser logs contained no errors; the existing Three.Clock deprecation warning remains. No first-time player comprehension or headset performance claim is made.


## A world that remembers

All 85 behavior tests pass, along with TypeScript and the production build. A separate world archive retains the final water solution and optional flower independently of a chapter replay. Old completed saves migrate without changing the twelve earned milestones. New tests cover sequential one-hand contributions, either hand, distant gestures, interrupted tracking, optional progression gating, both saved solutions, corrupt fields and archive retention during replay.

The optional post-ending encounter adds a newcomer and drooping seed on the right deck. A local Water lift, Fire circle and Earth press latch independently. Leaf contributes living petals to a flower with a blue heart, warm veins and mineral base. The saved lesson clock then animates Leaf offering support, waiting and allowing the newcomer to walk onward. This is authored behavior, not machine learning. There is no additional milestone or penalty. Default instructions remain hidden; explicit guidance is available in settings.

One real one-hand emulator run watered the seed, retained Water through Menu/Continue, pressed Earth's support stone, traced Fire's circle and reached growth 8/lesson 18. Menu/Continue and a full runtime restart retained the finished flower. Another live replay reset the current Earth finale while the planet archive retained its aqueduct route. Completing the alternate Garden solution reached home with the previously grown flower intact. Revisit your planet showed route 1 and then route 2, with the waterway visibly attached to the planet surface. Both routes retain twelve milestones.

The first model diagnostics found degenerate poles on tiny capsule details and unnamed batched surfaces. Replacing those capsules with closed cylinders and assigning stable batch names produced clean material and clay diagnostics. Planet-memory diagnostics were clean. The visual comparison revealed the former end button covering part of the new garden; the redundant finished-garden overlay was removed while retaining Menu access.

Final captures: `../a-world-that-remembers.png`, `../river-garden-remembers.png` and `../planet-remembers-your-waterway.png`. No additional live lights, shadows, post-processing or camera animation were added. Emulator checks do not establish first-time puzzle comprehension or headset performance.


## Leaf benchmark and four-chapter polish

All 87 behavior checks, TypeScript and the production build pass. The new bounded light check prevents the tabletop doorway from exceeding 0.012 even at full completion or corrupt input. The live maximum was 0.0111. Shared ambient/sun lighting was adjusted conservatively; the shared sky and fog remain. New grounded milestone patches use no lights or shadows: Leaf rosettes, Water reed pools, Fire sheltered embers and Earth stone flowers. Material and clay diagnostics reported no geometry warnings.

A full replay completed all twelve encounters with one simulated hand, using actual menus and gestures. Each chapter grew one, two and three patches as encounters finished. The first final-Earth presentation assertion exposed the finale hiding the new patch group; the focused post-fix check showed all three retained into The Last Light. This was a presentation failure, not a puzzle completion failure.

A focused Leaf replay verified the First Light gift remains visible and that later homecomings no longer offer it again. At the final encounter's fork, telemetry measured two equally active invitations after choosing to examine the paths. The sheltered route, perch and home lantern completed normally, ending with three glade patches and no duplicate gift. Menu/Continue returned the already-completed journey to its garden, preserving its earned presentation.

Arrival observations yield to started gestures. Creature poses reflect resting, sharing, sheltering and supporting. Existing fireflies focus on valid puzzle targets; nearby targets respond in brightness and size. No puzzle rules, reach targets, saves, optional world request or locomotion changed. Completion observations reinforce the encounter's consequence.

Final screenshots: `../leaf-arrival-polished.png`, `../leaf-choice-polished.png`, `../leaf-chapter-polished.png`, `../water-chapter-polished.png`, `../fire-chapter-polished.png`, `../earth-chapter-polished.png`. The comparison retained the original framing and showed no new blocking overlap. These are emulator replays and visual reviews, not first-time human playtests or hardware performance certification.
