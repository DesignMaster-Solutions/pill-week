---
status: approved
---

# Design brief: Pill Week

<!-- Filled in by plan-lens from the interview. Values the team didn't choose are marked (default). -->

## The one spatial moment
I'm at the kitchen table filling my father's weekly pill box, seven days by morning and evening. One hand holds the open bottle, the other drops a tablet into a compartment. Over the box I see one medicine at a time ("Losartan 50 mg: every morning") and only the compartments where it goes are lit. Each time a tablet drops in, I pinch that compartment and it is checked off. If I jump past a day, the one I skipped turns amber before I move on, and if I reach for a compartment where this medicine doesn't go, the Lens tells me right away.

## Why it belongs on glasses
- Uses: draws in the world (the week grid and the lit compartments sit on the pill box itself), leaves your body free (both hands stay on the bottle and the box, eyes stay on the compartments).
- Why it's better than the phone or laptop version: today it's a paper prescription list next to the box, read line by line, and the mistakes are a skipped day or a tablet in the wrong slot. A phone checklist means putting the bottle down and looking away from the box for every tablet. Here the answer to "where does this one go?" is lit on the box, and the check happens on the compartment I just filled.

## Product or overlay
- Type: overlay: it responds to a real pill box on a real table.
- What the real version would sense: the pill box on the table (position and the 7 x 2 compartment grid).
- Stand-in for the preview: a virtual weekly pill box at real size on a virtual table, with one big "The box is here" button on the table edge in front of it that marks it as found. Everything after that is real logic. The Lens never reads the prescription and never recognizes tablets: the regimen is a hard-coded sample.

## Where things live
- Where the user is looking during the main task: down at the pill box on the table, about 45 cm ahead and 40 cm below eye level (default; seated at a kitchen table).
- Table (stand-in): 80 x 50 cm top, light wood color (default), its near edge 25 cm in front of the user.
- Pill box (stand-in): 7 columns (Mon to Sun) by 2 rows (morning row in back, evening row in front), each compartment 4 x 4 cm (default; a large-print organizer size), box about 32 x 10 cm, lying on the table with its center 45 cm in front of the user. Light translucent lids so the additive display shows them.
- Day labels (Mon ... Sun) along the back edge of the box, and "AM" / "PM" at the left end of each row, lying on the box.
- Medicine card: one card standing just behind the box, 24 x 12 cm, tilted toward the user, showing the medicine name and dose, the schedule in words, "Medicine 1 of 4", and a counter ("3 of 7 placed"). Each medicine has its own light tint (default) that repeats on the lit compartments.
- Compartment marks: a check and a small dot in the medicine's tint inside each filled compartment; dots stack, one per medicine placed there, so the box shows what is already inside.
- Buttons: "Next medicine" on the right end of the table edge in front of the box, about 12 x 6 cm, and "Start over" on the left end (default). Everything sits within 60 cm of the user.
- Summary: replaces the medicine card after the last medicine.

## Hands and input
- Tell the Lens where the box is: pinch "The box is here".
- Mark a compartment as filled: pinch the compartment (a lit compartment gets the check). Pinch a checked one again to undo.
- Move to the next medicine: pinch "Next medicine".
- Start again: pinch "Start over".
- Targets are big and highlight when aimed at. Each compartment is a 4 x 4 cm target.
- Voice (if any) and the button that does the same job: in real use "done" or "next" could be said aloud with both hands busy; voice is not built in this version, the compartment pinch and "Next medicine" do the job.

## When things show
- "The box is here": shows at start, hides once pinched.
- Grid labels, medicine card, lit compartments, buttons: show after "The box is here".
- Lit compartments: only the compartments where the current medicine goes are lit, in its tint. The next one to fill (the earliest unfilled lit compartment in week order) pulses gently.
- Skipped: if I check a compartment while an earlier lit compartment of the same medicine is still empty, that earlier one turns amber and reads "skipped". Checking it clears the amber. Pinching "Next medicine" with lit compartments still empty leaves them amber and counted as skipped.
- Wrong compartment: pinching a compartment where the current medicine does not go does not check it; it flashes amber-red for a moment, the card reads "Not here: Losartan goes in mornings only", and a short low tone plays.
- After the 4th medicine, "Next medicine" becomes "Finish". The summary shows on the card: "Morning 15 of 15 · Evening 11 of 11 · 0 skipped", or with skips, which ones ("1 skipped: Thu PM Metformin"). Skipped compartments stay amber on the box. A soft chime plays.
- If something needs attention out of view: the whole box fits in view at this distance (32 cm wide at 45 cm), so no arrow is needed; the wrong-compartment tone plays from the compartment.

## Sample regimen (hard-coded, not medical advice)
1. Losartan 50 mg: every morning (7).
2. Metformin 500 mg: morning and evening (14).
3. Calcium 600 mg + vitamin D: every other day, evening: Mon, Wed, Fri, Sun (4).
4. Vitamin B12 1000 mcg: Sunday morning only (1).
Totals: morning 15 tablets, evening 11 tablets. This is a made-up sample to show the flow. It is not a prescription and not medical guidance.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. Pinching "The box is here" shows the medicine card for Losartan 50 mg ("Medicine 1 of 4", "0 of 7 placed") and lights exactly the 7 morning compartments.
2. Pinching a lit compartment checks it and the counter goes up by one; pinching it again unchecks it and the counter goes back.
3. Pinching a compartment where the current medicine doesn't go leaves it unchecked and the card shows the "Not here" warning.
4. Checking Wednesday morning while Tuesday morning is still empty turns Tuesday morning amber ("skipped"); checking Tuesday morning clears it.
5. "Next medicine" moves through the four medicines and lights the right compartments for each: 14 for Metformin, Mon/Wed/Fri/Sun evening for Calcium, only Sunday morning for B12.
6. Filling every lit compartment and pinching "Finish" shows "Morning 15 of 15 · Evening 11 of 11 · 0 skipped"; leaving one empty shows "1 skipped" naming that compartment, and it stays amber.
7. Every control and compartment is within arm's reach of a seated user (LEAF IK reach check).

## Out of scope
- Reading a prescription, recognizing tablets or bottles, or checking doses. The regimen is a fixed sample.
- Reminders to take the pills, refill tracking, more than one person, saving between sessions.
- Any medical advice.

## Risks and open questions
- Tablet-sized precision: the real version needs the box registered within about 1 cm so the lit compartment is the real one. Feel unproven without glasses.
- 4 cm compartments are the large-print size; on a standard 2.5 cm organizer the targets would be small for a pinch.
- Tints are light so they show on the additive display; how they read over a real translucent lid in kitchen light is unproven.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
