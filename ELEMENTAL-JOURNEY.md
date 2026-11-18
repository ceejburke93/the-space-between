# The Space Between — Elemental Journey

Four elemental chapters, three encounters each. This is a playable prototype of the full structure, with procedural art and emulator validation.

## Regions and gestures

| Element | Environment | Base motion | Encounter progression |
| --- | --- | --- | --- |
| Grass | Green glade, canopy and mossy islands | Meet and spread a thread; one hand can visit its anchors | **First Light:** support a hesitant traveler. **A Seed of Trust:** allow a pause or offer a perch, then bloom its seed. **A Sheltered Way:** choose a direct windy crossing or curved sheltered branch, help the seed and light its home. |
| Water | Blue lagoon, reeds and waterfalls | Gather and lift a stream | **A River Remembers:** hold the stream. **Still Waters:** fill a basin, then settle it; spills return safely to the pool. **Share the Rain:** rest Water, redirect its stream to Leaf, grow a lily and restore the crossing. A whole lily garden is optional. |
| Fire | Basalt needles, fissures and drifting sparks | Trace a forgiving circle, then follow the ember | **A Small, Brave Flame:** guide it home. **Shelter a Spark:** shelter above or cup below, then carry warmth to the next refuge. **Pass the Flame:** choose a refuge lantern, recharge and bring warmth home; lighting every refuge is optional. |
| Earth | Mountain terraces and stone arches | Press down to raise a path | **The First Stone:** hold the path. **A Gentle Weight:** counterbalance two platforms as the traveler's weight shifts. **A Place for Everyone:** rearrange wide, tall and flat stones around a raised ledge, then anchor the route. Two arrangements work; one hand can anchor sequentially. |

Grass names the first element and region; Leaf is the traveler players meet there. The four regions share one planet, so their local terrain changes while the sky and wider atmosphere stay consistent.

The safe interaction area stays familiar. Each region changes its nearby terrain, plants, and element-specific particles. The moon, starfield, mountain horizon, sky, fog, and global lighting stay consistent because all chapters take place on one planet. The camera remains still; the game adds no screen shake or flashing.

## Creature reactions and homecoming

The traveler notices nearby hands, hesitates, tests the path, leans when waiting, and becomes more confident under support. Grass and Earth retain planted feet; Water and Fire intentionally float. Body and arm reactions are separate from the planted-foot solver.

On arrival, the house warms, the resident welcomes the traveler, and the traveler turns toward the player with a small thankful gesture. Three small memory lights fill each elemental constellation. Completing Grass restores flowers, Water a pond, Fire a hearth, and Earth a stone cairn. Rewards remain visible across visits. After all twelve encounters, Visit your garden opens a peaceful completed world.

## Progress and navigation

- Version 3 saves track chapter, encounter, twelve completion milestones, crossing progress, formed ritual, completed midpoint task, and homecoming time.
- Awarding an already restored encounter never adds another milestone.
- Locked encounters cannot be selected. Your journey lets players revisit unlocked encounters, through both desktop and spatial menus.
- Pause during a crossing or homecoming and Continue resumes it. Incomplete base rituals may need repeating after a page reload. Later puzzle phases, lily growth, water, warmth, selected stones and placed pieces persist; partial dwell does not.
- Starting a different encounter intentionally replaces the active crossing checkpoint while keeping all completed milestones.
- No timers penalize the player. Releasing support or losing tracking does not send the creature falling.

## Desktop practice

Grass uses the existing draggable lights. Water and Earth use the scroll wheel for height. Fire uses a vertical drag plane so a light can trace an actual circle. In assisted mode, one light/hand can perform the elemental ritual; the idle tracked hand is ignored. Fire naturally permits one hand.

## Complexity and depth

Design reference: Justin Leingang, [Defining Complexity and Depth in Game Design](https://boardgamegeek.com/blog/6993/blogpost/108921/defining-complexity-and-depth-in-game-design), also available in the author's [blog index](https://boardgamegeek.com/blog/6993/an-alternate-perspective). The direct article request returned 403; its text was accessible through the index search result.

The useful distinction is between rules affecting one another and decisions opening later choices. Here, each chapter teaches one motion, then combines it with pausing, proximity, carrying or adjusting support. We do not equate a longer gesture list with depth. The later encounters now combine route choices, reusable water, lantern refuges, changing loads and reversible stone placement. Their core solutions are deliberately shorter than optional mastery routes. More actions alone do not establish puzzle depth; human playtesting must show whether players can predict and understand these consequences.

## Validation

See JOURNEY-VALIDATION.md for the actual checks and their limits. Competition development uses emulator validation as agreed. A physical headset test is not being treated as an entry prerequisite.


## Puzzle revision, October 31

The supplied puzzle-design advice guides this pass: reward experimentation, make correct attempts deterministic, allow planning and keep execution forgiving. A failed placement can be moved, spilled water is recoverable, a dim flame can recharge, and tracking loss preserves earned progress. The cooperative Water encounter needs one lily; the full garden is a voluntary extra kindness saved in the restored region. Fire also permits a shorter route home.

The final encounter in a chapter combines familiar rules with a short core solution and optional additional care. This is a pacing intention, not a claim that the difficulty curve has been proven. Unprompted human playtests should record hesitation, mistaken expectations and whether successful players can explain why their solution worked. Automated gesture scripts establish mechanics and recovery, not discoverability or enjoyment.
