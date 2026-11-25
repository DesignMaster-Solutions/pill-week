# Pill Week

A SPECS Lens for filling a weekly pill box (7 days, morning and evening) with both hands busy. It shows one medicine at a time over the box, lights only the compartments where that medicine goes, and lets you pinch each compartment as the tablet drops in. A compartment you jump past turns amber, a pinch on a compartment where the medicine does not go is refused with a warning, and at the end you get a count per row and a list of anything skipped.

Built for [Learn AR with SPECS](https://learn-specs.devpost.com/) Round 2 by Design Master Solutions LLC. Planned with the Devpost Learn `plan-lens` skill pack and built by Snap's CLAD agents through the Lens Studio MCP.

## Open it

1. Install Lens Studio 5.25 or later.
2. Clone this repo and open `PillWeek.esproj`.
3. In the Preview panel, pick Interactive Preview with the SPECS device. Click "The box is here", then click the lit compartments. Clicking acts as a pinch.

## What is a sample, and the honest limits

- The regimen is a made-up sample of four medicines (every morning, twice a day, every other day, Sunday only). It is hard-coded. It is not a prescription and not medical advice.
- The Lens does not read prescriptions, does not recognize tablets or bottles, and does not check doses.
- The pill box and the table are virtual stand-ins at real size. Pinching "The box is here" runs one World Query hit test from your head toward the spot in front of you where the box goes. If it hits a level surface facing up, the whole layout (box, card, buttons) moves onto that point, turned to face you, and the stand-in table is hidden. If nothing is hit, the stand-in stays where it was. This places the layout on your table. It does not find or recognize a real pill box.
- The compartment you should pinch next has a pinch target 1.5 times wider and taller than its 4 cm pitch, so it overlaps half of each neighbour and a hand near the shared edge picks it first (a judge saw the hand land on the next day). Every other compartment keeps the 4 cm target, so a pinch in the middle of a wrong compartment is still refused. Unit-tested (`node tests/PillWeekState.test.ts`) and type-checked; not yet tried on glasses.
- In the Lens Studio preview the hit test returns no hit, so the stand-in stays. Placement on a hit is proven only by feeding a hit into the same code path in a LEAF test (dc8). It has not been seen working on a real surface.
- It runs in the Lens Studio preview only. Nothing here has been tried on SPECS glasses, so comfort, registration on a real box and hand tracking are unproven.

- Design brief: [devpost/design-brief.md](devpost/design-brief.md)
- Planning notes: [devpost/planning-notes.md](devpost/planning-notes.md)

License: MIT

Demo video (screen recording of the Lens Studio preview, narrated in my own voice): https://youtu.be/478zSbzUDFQ
