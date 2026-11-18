# Build report: Pill Week

Built from `devpost/design-brief.md` with Snap's CLAD agents (specs-experience-builder, then the LEAF skills) through the Lens Studio MCP. Lens Studio 5.24.1, Spectacles Interaction Kit 3.1.0, UI Kit 3.0.0, Leaf 3.0.0. Runs in the Lens Studio preview only; nothing has been tried on SPECS glasses. The regimen is a hard-coded sample, not a prescription and not medical advice.

## What works (logic proven in preview)

- Stand-in: an 80 x 50 cm light wood table top 40 cm below eye level, its near edge 25 cm in front of the user. On it, a 32 x 10 cm weekly pill box, 7 days by morning (back row) and evening (front row), 4 x 4 cm compartments, centered 45 cm in front of the user. At start the only control is "The box is here".
- Pinching it shows the day labels, AM / PM, the medicine card behind the box (tilted toward the user), and "Start over" / "Next medicine" on the table edge in front of the box.
- One medicine at a time: the card shows name and dose, the schedule in words, "Medicine 1 of 4" and "0 of 7 placed". Only the compartments where that medicine goes are lit, in its own light tint. The next one to fill pulses.
- Pinching a lit compartment checks it (a check and a dot in the medicine's tint) and the counter goes up; pinching it again undoes it. Dots stack, one per medicine placed there.
- A pinch on a compartment where the medicine does not go is refused: the compartment flashes, a short low tone plays, and the card reads "Not here: Losartan goes in mornings only" (one message per medicine).
- Filling a compartment while an earlier lit one of the same medicine is still empty turns the earlier one amber with "skipped"; filling it clears the amber.
- "Next medicine" walks the four sample medicines (Losartan 7 mornings, Metformin all 14, Calcium Mon/Wed/Fri/Sun evening, Vitamin B12 Sunday morning). On the fourth it reads "Finish". Empty lit compartments left behind are counted as skipped.
- Finish shows the summary on the card, "Morning 15 of 15 · Evening 11 of 11 · 0 skipped", or with a gap "1 skipped: Thu PM Metformin", and the skipped compartment stays amber. A soft chime plays. After Finish only "Start over" is left. Both sounds are WAVs synthesized locally by `scripts/gen_pillweek_sounds.py`; no paid API was used.
- "Start over" clears the week and goes back to the first medicine; the box stays found.
- Reach, from the build: every button 49 to 52 cm from the eye, evening compartments 57 to 58 cm, morning compartments 60 to 61 cm, every compartment within 51 cm of a shoulder.

## LEAF: 7/7 done criteria pass

Scenarios are in `Assets/Tests/` and registered in `LeafIndex.ts` (the `LeafIndex` object at the scene root). Each one drives the Lens with real SIK input: a trigger on the UIKit button or on the compartment's own Interactable. The controller is read for assertions, and the card is checked by reading the Text the user sees. Lens Studio reloads the Lens for every `run_leaf_scenario`, so each scenario starts fresh. The run on the final code, 18 Nov 2026, is in `docs/leaf-run.log`.

| # | Done criterion | Scenario | Result |
|---|---|---|---|
| 1 | "The box is here" shows Losartan, "Medicine 1 of 4", "0 of 7 placed", exactly the 7 mornings lit | dc1-box-here-lights-mornings | PASSED |
| 2 | Pinch checks, counter +1; pinch again unchecks, counter back | dc2-check-and-undo | PASSED |
| 3 | Wrong compartment stays unchecked, card shows "Not here" | dc3-wrong-compartment-warns | PASSED (Tue PM refused for Losartan) |
| 4 | Wed AM over an empty Tue AM turns Tue AM amber; filling it clears | dc4-skipped-turns-amber | PASSED |
| 5 | Next lights 14 for Metformin, Mon/Wed/Fri/Sun PM for Calcium, Sun AM for B12 | dc5-next-lights-each-medicine | PASSED |
| 6 | Full week "Morning 15 of 15 · Evening 11 of 11 · 0 skipped"; one gap names it and stays amber | dc6-finish-summary | PASSED ("1 skipped: Thu PM Metformin") |
| 7 | Every control and compartment within arm's reach (IK) | dc7-ik-arm-reaches-everything | PASSED (17 of 17 by direct touch) |

To check that the tests can fail, dc2 was run once with a wrong assertion. It failed with `FAILED: dc2-check-and-undo - AssertionError: Expected: "2" - Received: "1"`, and passed again once the assertion was restored.

dc7 uses the LEAF IK body with no SIK fallback and fail-fast diagnostics, head at the preview start pose (eye at the origin, looking 38 degrees down at the box). Any `unreachable_*`, `out_of_fov` or `reach_marginal` would fail it. All 17 targets (3 buttons, 14 compartments) were reached by a direct, in-arm touch with the pinch point 0.0 to 0.1 cm from the target's center. The left hand takes Mon to Wed and "Start over", the right hand the rest. Reach was a done criterion from the start, because our first project's reach test found controls out of reach; this layout passed on its first IK run.

Two other scenarios, `print-02-some-checked` and `print-03-wrong-and-skipped`, only pose the Lens for the prints below. They are not done criteria.

## What is missing or unproven

- Touch press on the compartments. The IK hand reaches each one, but in the preview SIK 3.1 never turns the IK hand into hover (`convergence_timeout`) on most targets, and on 6 of the 14 compartments it resolved the touch to the compartment just east of the one reached (`target_overlap`, for example Wed AM pressed Thu AM). Leaving a 0.8 cm gap between the colliders did not change it, so it was reverted to the brief's 4 x 4 cm targets. The one IK touch press that landed on the right target is "The box is here". All presses in done criteria 1 to 6 are proven with simulated SIK pinches, not with the IK hand. On real hands, 4 cm compartments side by side are the open risk for a pinch-to-mark design.
- "Not here" flash: the compartment flashes for a moment; LEAF checks the card text, not the flash.
- The tone and the chime play from the controller, not from the compartment (no spatial audio).
- When a later medicine lights a compartment that an earlier medicine skipped, that compartment shows the current medicine's state while it is lit, and turns amber again once that medicine is done.
- The medicine card is 30 x 15 cm, not the brief's 24 x 12, so the longest lines fit at about 1.2 cm text height.
- Feel unproven: registering a real pill box to about 1 cm so the lit compartment is the real one, pinch precision on real 4 cm compartments, how the light tints read over a real translucent lid in kitchen light, comfort over a full week's fill, and voice for "done" and "next" (buttons here).
- The preview does not simulate the additive display: the dark grey box and the orange table in the prints are the stand-in, not what the glasses would show.

## Demo video (preview only)

`docs/video/demo.mp4` is built by `demo_slides.py` from `docs/video/demo.json`. Its recorded scenes are clips (`docs/video/clips/`, built by `docs/video/clips.py`) from real grabs of the Preview panel taken through the Lens Studio MCP (`ExecuteEditorCode` running `docs/video/capture_preview.ts`) while each LEAF scenario ran, plus the idle start state. Each frame is shown for its real interval and the clips play at 1.0x, with no interpolated frames. dc1 to dc6 were filmed from a camera behind and above the user so the whole table fits; dc7 from the user's own head pose. The dc1 to dc5 clips were filmed before "Next" was hidden after Finish, a change that does not touch those flows; dc6 was filmed again on the final code. The frames stay local in `docs/video/frames/` (not in git). Narration is the macOS `say` voice. Nothing in it comes from Spectacles hardware.

## Prints (Interactive Preview, SPECS 27, Sunlit Room, camera behind and above the user)

- `docs/prints/01-start-the-box-is-here.png`: start, the box stand-in on the table with "The box is here"
- `docs/prints/02-first-medicine-some-checked.png`: Losartan, the 7 mornings lit, Mon to Wed checked, "3 of 7 placed"
- `docs/prints/03-wrong-compartment-and-skipped.png`: Tue AM amber "skipped" and "Not here: Losartan goes in mornings only"
- `docs/prints/04-summary.png`: "Morning 15 of 15 · Evening 10 of 11 · 1 skipped", "1 skipped: Thu PM Metformin", Thu PM amber
