# Priority implementation and validation

October 29, 2026. Applies to the IWSDK prototype after the official skills review.

## Implemented

- Stationary player-relative placement on VR entry, with explicit re-placement in Comfort & controls.
- Height adjustment in 5 cm steps, bounded to ±25 cm. Re-placement also recenters the spatial menus for the current seat height.
- Reduced reach: world scale 0.62, center 42 cm forward and 34 cm below head height. Normal mode: scale 0.8, 55 cm forward and 40 cm below head. These are initial defaults, not a guarantee of comfortable reach for every person.
- Controller grip poses and tracked palms both operate the bridge. The visual marker shows the interaction position. Controller triggers operate UI rays, not bridge support.
- One-hand assist: dwell 0.35 seconds at the left ring, then the right; keep the active hand/controller near either ring to support the crossing. Moving away or losing tracking pauses progress. Either tracked side can be used; the first selected side keeps ownership while tracked.
- Reduced reach and assisted mode persist in existing local saves. Calibration is session-specific and recalculated at next entry.
- Spatial Explore closer and Skip intro buttons. The enlarging planet is placed farther behind the buttons to avoid blocking them at later discovery stages.
- Larger spatial menu buttons and optional desktop comfort/performance details, with scrolling for short windows. Play remains uncluttered.
- One Points object replaces 85 mote meshes. Static island meshes are merged with per-vertex colors while preserving emissive lighting groups, trees, doors and roots.
- RuntimeMetrics component exposes progress, calibrated bridge height, draw calls, triangles, callback rate and input-to-shore distance in the official inspector. No tracking data is sent anywhere.

## Verified

- TypeScript check and production build pass. A large JavaScript bundle warning remains.
- Seated emulator head at 1.15 m produced bridge height 0.81 m in reduced reach mode. Raise produced 0.86 m; Lower restored 0.81 m.
- Controller ray activated Play and comfort buttons. Hand taps activated comfort controls earlier in the pass.
- Standard two-controller gesture caught the thread and completed a crossing, measured progress 1.0.
- Assisted controller interaction built the bridge and reached approximately 89% with the other controller disconnected. Moving support away paused near 92%; returning resumed it.
- Final one-hand test, with the other hand disconnected, completed a crossing at progress 1.0.
- Spatial Skip Intro activated with a controller ray and returned to title-menu targets. Explore and Skip both appeared as interactive targets.
- Rendered seated scene inspected after geometry batching; grounded creature feet, islands, houses, plants and roots remain present. A local/world coordinate error affecting legs during transformed placement was corrected during testing.
- Sampled menu render calls fell from about 354 to 158–160 in the stereo emulator after static batching. Full crossing samples were about 186–192 calls including both eye rendering and runtime input visuals. Desktop menu sample was 71 calls. Counts depend on visibility and view direction; these are not hardware timings.
- Emulator callback rate was approximately 60/s. This does not demonstrate 72 or 90 Hz on Quest.

## Still requires physical hardware

The runtime target inventory contains only the managed emulator, no paired Quest. Actual headset work remains incomplete:

1. Test seated and standing reach, wrist/palm offsets, occlusion, menu readability and 10–15 minutes of arm comfort. Check both left- and right-hand assisted play.
2. Test controller-to-hand transitions, tracking interruption, boundary/recenter behavior and repeated menu use in Quest Browser.
3. Measure GPU/CPU frame time at the device-selected refresh rate, including the planet reveal, bridge crossing and menus. Test sustained sessions and thermal behavior.
4. Test save/continue after browser restart and headset sleep in a physical session. Saves remain specific to the browser and origin.
5. Tune physical scale, touch distances, assisted dwell and hold tolerance from those results. Reduced reach and assist are options, not accessibility certification.

Further improvements from the review remain separate: restart confirmation/undo, reduced-motion and text settings, fully positional sound, and full listener/GPU lifecycle cleanup.
