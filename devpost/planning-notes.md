# Planning notes: Pill Week

Why this idea: in our families, someone fills a weekly pill box for an older parent every Sunday. It is a seated, two-handed job: an open bottle in one hand, the box lid in the other, and a paper list of what goes where. The mistakes are quiet ones: a day skipped, or a tablet in the evening row that belongs in the morning. The eyes need to stay on the box, which is what glasses are for.

This is our second project for Round 2 (planned 18 Nov 2026). Our first, Measure Twice, is a stone-shop layout tool (drag a template, read distances). Pill Week is a different domain and a different mechanic: a guided sequence over a fixed grid, with state per compartment and detection of skips and wrong slots. It shares no code with Measure Twice.

Decisions taken while planning with the plan-lens skill:
- One spatial moment: one medicine at a time, with only its compartments lit on the box. Showing the whole week's plan at once was dropped because it turns the box into a spreadsheet.
- The box is a stand-in with a "The box is here" button, because the preview can't detect a real object. The Lens does not read prescriptions or recognize tablets, and says so.
- The regimen is a hard-coded sample of four medicines with different schedules (every morning, twice a day, every other day, once a week), chosen to exercise every rule. It is not medical advice.
- Marking is a pinch on the compartment itself, not a button, so the check lands where the tablet went. Pinching again undoes it.
- Skip detection is by week order: filling a later compartment while an earlier one of the same medicine is empty turns the earlier one amber. Moving on with empty ones counts them as skipped in the summary.
- A wrong compartment is refused, not silently accepted, with a message naming the rule and a short tone.
- Large-print organizer size (4 cm compartments) so each compartment is a fair pinch target, and everything within 60 cm of a seated user. Our first project's reach test found controls out of reach, so reach is a done criterion here from the start.
- Light tints and light lids: the display is additive, so dark content would vanish.
