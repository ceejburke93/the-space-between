# Official Meta skills review — The Space Between

Reviewed October 29, 2026 against the installed official `hz-iwsdk-webxr` and `hz-immersive-designer` skills, their performance and accessibility references, the project configuration, all active experience code, UI assets and desktop styling. This supersedes earlier review notes. It is a prototype assessment, not Meta certification or a competition rules audit.

## Follow-up implementation status

The first three priorities below now have prototype implementations: player-relative world placement with height and reduced reach controls; controller and one-hand assisted gameplay; spatial Explore/Skip buttons. Floating lights and static island geometry are batched, with development measurements added. Seated placement, height changes, two-controller completion, single-controller progress and one-hand completion were tested in the emulator. See PRIORITY-VALIDATION.md. The findings below record the pre-implementation review; remaining hardware and usability caveats still apply.

## Assessment

The stationary, small-world interaction is a good fit for comfortable VR. The project uses the right IWSDK foundation and its visual narrative is coherent. It is not yet ready for a claim of hardware performance, broad accessibility or complete headset usability. Avoid expanding the world until reach and alternative controls are resolved.

## Findings in priority order

| Priority | Finding and evidence | Required next action |
| --- | --- | --- |
| High | Fixed world height and reach: bridge Y=1.02 m, Z=-0.62 m, shores X=±0.23 m. This does not adapt to seated users, height or where someone stands. | Add a deliberate placement/calibration step and reduced-reach option. Keep the world stationary after placement. Test sitting and standing. |
| High | Two hands are mandatory for discovery and crossing. Only sources with `source.hand` are read. Controllers can point at UI but cannot operate the bridge. | Add controller gameplay and an assisted one-hand path; use input-specific instructions. Do not advertise controller support yet. |
| High | In-headset onboarding has no visible Skip Intro alternative. Desktop Skip exists, but DOM buttons are hidden in XR. Replay is desktop-only too. | Add a spatial Skip control and a consistent replay path. Preserve remembered discovery. |
| High | Performance is unproven. 85 motes are separate meshes/materials; repeated trees/flowers/rocks are unbatched; transparent layers and point lights add cost. Bridge and feet still allocate some temporary objects each frame. | Measure renderer calls, CPU/GPU frame times and sustained performance on Quest. Instance repeated objects and share materials. Do not infer 72/90 Hz from emulator appearance. |
| Medium | Main menu is 44 cm forward, designed for direct touch. Generic immersive-design guidance favors distant primary panels; the previously reviewed hands UI page gives specific near-touch guidance. Targets are about 58 mm tall, below the skill's conservative 64 mm suggestion. | Retain as a prototype touch panel, validate against current device-specific guidance and real reach/readability. Consider a farther ray-operated menu. Do not apply contradictory generic numbers blindly. |
| Medium | Restart replaces the saved crossing immediately, with no confirmation or undo. | Add a small confirmation or reversible restart before valuable progress grows. |
| Medium | Ambient sound is optional and cues have visible equivalents, but chimes use stereo panning rather than head-tracked source positioning. | Keep claims accurate; use a positional audio model if source location becomes meaningful. |
| Medium | Text size, contrast, reduced motion and reach are not adjustable. No one-hand assist. Planet grows from a tiny object to a large nearby object. | Add compact accessibility settings on the menu, not the play view; offer reduced-motion/skip paths. Validate planet size and eye comfort in hardware. |
| Medium | DOM/window listeners and generated geometry/audio do not have full lifecycle cleanup. Most behavior is in one large system. | Register listener cleanup and dispose owned GPU/audio resources; split responsibilities when adding features. Keep shared manifest resources separate from owned resources. |
| Low | Guide preview and some reset/replay actions exist only in desktop menus. Saved data is browser/origin-local, not cloud or cross-device. | Keep instructions and documentation explicit. Desktop preview is practice, not proof of VR support. |

## Fixes made during this review

- Removed the session-start reset that discarded an active crossing when entering VR. Entry now clears transient input smoothing and holds without replacing progress.
- Save progress when leaving an immersive session.
- Stop simulation while the immersive session is not visible; reset the steady hold so a focus change cannot count as continuous support.
- Replaced the VR multi-line instruction/progress card with one full-contrast prompt, positioned 1.1 m forward in world coordinates. This also avoids fading critical text during crossing. Its layout still needs height calibration and real headset readability testing.
- Reused one temporary bridge vector, eliminating 495 `Vector3` allocations per active update. Other allocations remain for a future measured optimization pass.

## What is sound in the current implementation

- `World.create` owns the renderer/session loop; configuration comes from `virtual:iwsdk-project` and `iwsdk.config.json`.
- Three objects are imported through `@iwsdk/core`, matching this installed project's single-instance requirement. Some generic skill examples import `three`; local version-specific instructions take precedence.
- Asset manifest is deterministic; UI uses registered UIKitML assets and scene nodes with ray/poke components.
- Locomotion, physics and room understanding are disabled rather than unnecessarily enabled. No artificial viewer movement is used. Discovery scales an object and fades the scene rather than flying the camera.
- Shore hysteresis, smoothing and a dwell reduce accidental catches. Losing either hand pauses walking. The deck remains under a creature already crossing.
- Feet and deck share a height profile; torso breathing does not move planted feet.
- Desktop play has a minimal instruction and Menu. VR now follows the same information hierarchy.
- Discovery is remembered; saved progress is clamped on read; storage errors fall back gracefully. There is no cloud sync.
- Sound is opt-in; the experience does not rely on speech, so there is no speech transcript requirement at present.

## Verification and limits

- TypeScript check and production build pass after changes. The build retains a large-bundle warning; it is not a hardware frame-time measurement.
- Active immersive emulator session was re-established. Hand-mode Play was tested and the revised one-line gameplay prompt visually inspected. A clean release and brief tap activated Play; an initial simulated tap did not, so menu input still deserves usability testing.
- Prior emulator tests established sound toggle and return-to-menu behavior. These are not physical hand-tracking reliability tests.
- Save-on-entry/focus changes were reviewed in code; a mid-crossing re-entry regression test remains outstanding.
- No physical Quest used. Stereo comfort, physical reach, tracking occlusion, controller gameplay, boundary behavior, sustained frame rate, thermal load and text readability are not verified.
- An attempt to refresh the current hands UI page during this review timed out. Its earlier reviewed touch placement guidance should be rechecked before release.
- No engine migration, unnecessary simulator installation, blanket refresh-rate changes or unverified performance APIs were introduced. Some skill examples target different SDK versions; validate APIs against installed types and current documentation first.

## Recommended next implementation order

1. Player-relative placement, seated calibration and a reduced-reach setting.
2. Controller and assisted one-hand gameplay, with spatial Skip Intro.
3. Renderer instrumentation and batching, followed by physical Quest performance/comfort tests.
4. Restart protection, lifecycle cleanup and accessibility refinements.

Official skills: https://github.com/meta-quest/agentic-tools/tree/main/skills/hz-iwsdk-webxr and https://github.com/meta-quest/agentic-tools/tree/main/skills/hz-immersive-designer
