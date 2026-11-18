# The Space Between

A hands-first IWSDK / WebXR game about helping small elemental creatures find their way home. Four chapters—Grass, Water, Fire, and Earth—each introduce an elemental motion and build on it across three short encounters. Leaf is the traveler in the Grass region; all four regions share one planet.

Each region has its own terrain and plants beneath the same planetary sky. Creatures respond to support, pause safely when it disappears, and celebrate reaching home. Twelve saved homecomings track restoration across the four regions: flowers return to Grass, a pond to Water, a hearth to Fire, and a stone cairn to Earth. Leaf notices an offered hand, retreats when it is withdrawn, and reaches again. A nearby open palm or gentle lift can help Leaf's seed bloom. Fireflies gather around active puzzle targets. Each creature has its own pace, body language, and musical register. Restored roots, water, and warmth connect the regions. In the finale, the player combines the four learned abilities to make a safe route for the last seed, then withdraws a hand to let the companions carry it onward. The restored garden and seed bloom persist across visits.

## Play locally

The built preview is served at http://localhost:8082/ while its local server is running. On a first visit, a brief cosmic discovery leads to the planet menu; you can skip it. Return visits open the menu directly. Choose Play on your first visit; later, the same button continues or advances your journey. Your journey lists unlocked encounters.

Desktop practice uses draggable lights. Grass catches and spreads a thread; Water gathers then lifts; Fire traces a circle on a vertical drag plane; Earth presses downward. Use the wheel to adjust height; later Grass and Fire puzzles also permit height adjustment. Brief goal prompts accompany each task.

In an immersive session, tracked hand positions drive these motions. One-hand assist, reduced reach, world placement and height adjustment are available under Comfort & controls. Controllers provide an alternative. Moving away pauses safely; no creature falls because tracking is lost.

## Development

Use a supported Node version (Node 24 recommended), then npm ci and npm run dev. The CLI-managed development server uses https://localhost:8081/ with its browser-based immersive emulator. npm run dev:status reports its state.

- npm run setup:agent regenerates local Codex tool configuration after npm ci.
- npm run verify runs type checking, game tests, offline emulator-harness tests and the production build.
- npm run verify:emulator checks readiness without changing game state; add --replay and a suite name to exercise gameplay.
- `npm run verify:emulator -- --replay --suite menus --hands-only` checks fingertip navigation, comfort settings, play, pause and exit. Use `--suite leaf --hands-only` to include the three Leaf encounters. These replays use the managed development save.
- See [the verification guide](tools/emulator/README.md) for replay prerequisites, reports and primary-folder setup.
- npm run typecheck checks TypeScript.
- npm test runs 98 behavior tests.
- npm run build creates dist.
- Serve dist on a local static server for the desktop production preview.

Built with Meta IWSDK 1.1.0-rc.2. Preserve LICENSE for included starter code.

## A world that remembers

Leaf can test an offered palm with one foot, look up, and return safely to land. Withdrawing the hand retracts the foot; this meeting is optional. In A Seed of Trust, players may pause or offer a steady perch. Shelter a Spark accepts a hand above the flame or a cup below it. Both solutions earn the same progress. Saved choices shape the companions’ gestures and pauses during the finale.

Authored leaf pods, flowing droplets, flame silhouettes, moss stones and seed-pod homes replace the initial cone silhouettes in Grass. Four compatible musical phrases accompany trust and join in the remembered finale. Sound remains optional.

Development builds include live gameplay recording; production enables it only with ?capture=1. Captures use the game canvas and live game sound, without desktop or microphone capture. Recordings stop after 90 seconds. The first cosmic discovery now advances in about nine seconds and can be skipped immediately; return visits still bypass it.

## Responsive motions and regional awakenings

Each elemental gesture has a world-space invitation, a brightening formation contour and a soft completion ripple. Sound reinforces progress when enabled. Slow, supported movement builds a positive care response: Leaf grows more confident, Water settles, Fire brightens and Earth relaxes its carrying posture. Faster movement never subtracts progress; tracking recovery retains the existing safe pause.

After each chapter’s third homecoming, its region unfolds over several seconds: Grass opens a canopy, Water reveals a reflected constellation, warmth spreads through Fire’s basalt, and Earth’s terraces reveal a communal garden. Restored scenery remains visible on return visits. All events keep the camera, shared sky, fog and global lighting stable.

## Saves and progression

Browser storage retains discovery, current crossing, completed ritual/task checkpoints, homecoming, twelve milestones and preferences. Continue resumes an unfinished replay as well as a first crossing. Selecting another encounter replaces the active checkpoint but keeps earned milestones. Later puzzle phases, resources, lily growth and stone placements also persist. Partial dwell and incomplete base motions may need repeating after reload.

Saves belong to the same browser and site address; there is no cloud sync. Clearing site data removes them. Unavailable storage falls back to session-only play.

## Evidence and hosting

See [ELEMENTAL-JOURNEY.md](ELEMENTAL-JOURNEY.md) for chapter design, [JOURNEY-VALIDATION.md](JOURNEY-VALIDATION.md) for the twelve-encounter emulator run and test limits, and [GITHUB-PAGES-READINESS.md](GITHUB-PAGES-READINESS.md) for deployment status.

The GitHub repository is public and tracks this four-element build. GitHub Pages is not yet configured or published; the deployment workflow is manual and this source update does not publish the game site.

Developer tools are hidden during normal play. Add `?devtools=1` to the URL to reveal the performance check and gameplay capture controls; `?capture=1` enables gameplay capture without the performance panel. The performance check reports game-system logic time separately from draw counts and callback rate. The woven bridge uses one indexed draw per eye; see JOURNEY-VALIDATION.md for the measured comparison and limits.


## Later puzzles

Grass introduces a seed and a choice of direct or sheltered route. Water adds basin control and a cooperative encounter with Leaf: one lily makes a crossing, while the whole garden is optional. Fire uses lantern refuges and renewable warmth. Earth shifts a traveler’s weight between platforms, then invites reversible stone placement around a raised ledge. Alternative routes and optional extra care are saved without duplicating milestones.

One-hand play can complete every core solution. Lost tracking retains earned state; water can be recovered, warmth restored and stones rearranged. These mechanics have automated checks; their clarity and difficulty still require unaided human playtesting.


## The Last Light

After the final Earth homecoming, four familiar abilities form one cooperative garden puzzle. Earth routes Water to open Leaf’s roots; Leaf grows shelter; diverting the stream or lifting it onto an aqueduct protects Fire’s hearth so a familiar circle can wake the last seed. A deliberate hand withdrawal lets the creatures take over the crossing. Tracking loss does not count as that withdrawal. Earned help and the completed ending persist through Continue; replaying the final Earth encounter restarts the finale.

The two routing choices have short world labels, Roots and Garden. In desktop practice, move a light to the invitation and use the wheel to lift Water or press Earth; drag a circle for Fire. Core actions accept one-hand play.

## Creature and audio pass

Water and Fire now use continuous rounded surfaces; Earth’s moss and mineral seams follow its stone surface; Leaf has richer shading and attached branching veins. Face, arm and planted-foot anchors remain unchanged. Decorative veins and currents share meshes. No downloaded models or textures are required.

Sound on enables world-anchored elemental ambience and gesture cues, with the listening direction following the camera/head. Music, ambience, effects and interface cues have separate internal mix buses; important world cues briefly duck music. Sound off mutes the whole mix, hidden-page/hidden-immersive states fade it, and recordings include the complete game mix. Headphones make directional effects easier to hear. These are synthesized sounds rather than recorded nature effects; loudness and listening quality have not been certified.

Four additional skills are installed: puzzle, level-design, audio-design and performance-optimization. Their review led to reversible puzzle state, clearer routing choices, immediate directional feedback and measured asset costs. The puzzle skill is chiefly about discrete boards; its tile/grid examples are not a reason to change this spatial game.


## Habitat art revision

The four chapters now use authored island/habitat kits with irregular flat shorelines, eroded layered cliffs, clinging roots, rounded walls and carved doorways. Water uses scalloped roofs and a lagoon below the falls; Fire has chimney homes; Earth uses domed roofs and peripheral curved arches supported by rock islets. The distant skyline has smoother shared contours. Earth’s restored warmth still reaches the basalt.

All island decks retain the original contact height and bridge-side reach. Two small doorway lights remain; no additional shadow maps, SSAO, depth of field or motion blur were introduced. Contact shading beneath the homes is encoded in vertex colors and preserved through static batching. Each island is submitted as three surface meshes. The immediate play area stays clear of scenery that resembles movable puzzle pieces.


The discovery planet now has continuous raised continents, shallow seas, finer terrain variation, clouds and tiny inhabited regions. Close geography fades in with apparent size; the final zoom is larger and lingers a little longer. The title fades from the close view, leaving its surface unobscured. Existing skip, replay and return-visit bypass remain.


### Two ways to help the last seed

The Last Light now accepts both a ground diversion and a raised Earth aqueduct. After selecting Roots, resting low at its stone and lifting raises a channel above the hearth. Water can keep nourishing Leaf while Fire stays dry below. Pressing down lowers it again; choosing Garden diverts the stream around the hearth. Both routes earn the same ending and retain earlier help. The raised structure and water share a path profile and the saved arrangement persists through Continue. Desktop practice supports lifting/pressing with the wheel or dragging a selected channel vertically.


### Companions guide the cooperation

Chapter creatures now test support, offer a sharing pose, shelter their warmth and brace under weight. In The Last Light, companions face their work and each other: Water tends the roots, Leaf reaches toward the seed, Fire curls away from a wet hearth and opens when it is dry, and Earth supports the raised channel. They begin the ending from their working positions.

The finale starts with short observations and local affordances. Two unsuccessful approaches invite a moving visual demonstration; four reveal a direct instruction. Resting or losing tracking never escalates help. Earned and partial progress clear the approach count, and the hand carried over from Earth's chapter is ignored. Menu → Settings → Puzzle guidance offers immediate explicit directions; desktop practice has the same option under Comfort & controls. This preference lasts for the current session. Both water solutions, one-hand play and reversible help remain available.


### A world that remembers

After The Last Light, the aqueduct gains small dwellings beneath its arches; the diverted stream gains a flowering bank-side garden. A newcomer arrives beside a drooping seed on the right island. This optional, unspoken request accepts familiar gestures: lift water at the seed, circle warmth around it, and press the small stone beside Earth. Either hand can contribute sequentially. Water, Leaf, Fire and Earth help open a flower with a blue heart, living petals, warm veins and a mineral base. Leaf then offers the newcomer support, pauses with it and lets it walk onward. No additional milestone, deadline or penalty is attached. Explicit directions remain available in Puzzle guidance.

Revisit your planet from the menu (in immersive mode or desktop practice) to see the waterway's shape and new settlements on its surface. Revisiting is voluntary; the original one-time discovery behavior remains. The world archive retains the solution and flower independently of an unfinished chapter replay, using this browser's existing save. Another completed finale can change the landscape while preserving the flower you already grew.


### Chapter polish benchmark

Leaf's three encounters share a quiet arrival, readable active targets, reactions to the current task and a growing glade on the left shore. Resting, offering a perch and choosing a route keep their existing rules; completion grows one grounded fern patch per encounter. The same presentation standard carries into Water's reed pools, Fire's sheltered embers and Earth's settled stone flowers. New arrival thoughts yield immediately to started interactions, and completion observations reflect what the player helped make possible.

Local fireflies gather around valid puzzle targets, with equal attention to alternative solutions. Nearby targets brighten and respond in size; completed targets settle. Existing one-hand support, saved progress, optional requests and the shared sky remain. The tiny doorway lights now use a bounded output appropriate to the tabletop scale, preventing later progress from washing out destination surfaces. No shadows or post-processing were added.

The optional seed gift belongs to First Light and no longer interrupts later Leaf homecomings. Earth retains its three completed stone-garden patches into The Last Light.


Repository setup now keeps approved IWSDK skills and the game-specific `tsb-verify` skill versionable. Local machine configuration and generated verification artifacts remain ignored. A validation-only workflow is prepared locally; the separate Pages workflow is manual-only. No deployment or GitHub upload is part of these commands.

### Planet environment artwork

The four chapters now share a continuous, grounded valley beneath the same sky. Leaf uses woodland and undergrowth; Water uses riverbanks, willows and reeds; Fire uses dark basalt and a cooling fissure; Earth uses weathered stone and low planting. The two existing deck/contact planes remain unchanged. Background floating rocks, lanterns and repeated arches were removed. Huts retain their authored silhouettes, with window sills and chapter-specific garden, basin or foundation details.

Eight selected models from Kay Lousberg's CC0 KayKit Forest Nature Pack provide one consistent nature family. Atlas colors are baked into vertex colors for static batching: static ground is batched, while a bounded set of trees, hand-responsive plants and stream highlights remains independently animated. No lights, shadows or post-processing were added. See [third-party artwork and regeneration](THIRD_PARTY_ASSETS.md). Creatures remain custom, with smoother blinking and adjusted Water/Earth material roughness.

Validation: 92 deterministic game tests, seven harness tests, production build, material/clay asset diagnostics, all four chapter/resident emulator comparisons, and Leaf's three-encounter replay. These are desktop-emulator checks, not measured Quest frame rates.

### Living habitats and lasting kindness

Broad banks connect each hut to a winding trail; Leaf's exposed roots follow the ravine and vegetation grows in clusters. A small set of trees sways, river highlights change gently, and six nearby plants respond to either tracked hand. Brushing is optional scenery interaction and does not satisfy or advance a puzzle. It relaxes on tracking loss.

Each chapter's three earned milestones now also restore the wider habitat: a planted bank, a second garden, then grounded seed lanterns and a warm path. These use the existing saved completion count, so revisiting an earlier encounter retains earned ecological changes without introducing another save format. The original encounter-specific restoration patches remain.

A separate spatial stream source sits in the ravine. Brief, varied brush sounds use the existing effects bus and bounded voice limit. Both obey Sound off and focus muting. No extra real-time lights, camera movement, timers or failure pressure were added.

Use `npm run verify:emulator -- --replay --suite habitat` to check hand response, audio events, tracking loss, unchanged puzzle progress and restored scenery after reload. It requires twelve previously earned milestones; it does not fabricate unlocks.

Living-habitat validation also passed all four chapter brush/release checks, saved restoration after reload, Leaf’s three encounters, and the full-mix sound/mute check. Evidence is saved under `artifacts/living-habitat/` and the dated `artifacts/emulator/` runs.
