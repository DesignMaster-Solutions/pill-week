# Pill Week

A SPECS Lens for filling a weekly pill box (7 days, morning and evening) with both hands busy. It shows one medicine at a time over the box, lights only the compartments where that medicine goes, and lets you pinch each compartment as the tablet drops in. A compartment you jump past turns amber, a pinch on a compartment where the medicine does not go is refused with a warning, and at the end you get a count per row and a list of anything skipped.

Built for [Learn AR with SPECS](https://learn-specs.devpost.com/) Round 2 by Design Master Solutions LLC. Planned with the Devpost Learn `plan-lens` skill pack and built by Snap's CLAD agents through the Lens Studio MCP.

## Open it

1. Install Lens Studio 5.24 or later.
2. Clone this repo and open `PillWeek.esproj`.
3. In the Preview panel, pick Interactive Preview with the SPECS device. Click "The box is here", then click the lit compartments. Clicking acts as a pinch.

## What is a sample, and the honest limits

- The regimen is a made-up sample of four medicines (every morning, twice a day, every other day, Sunday only). It is hard-coded. It is not a prescription and not medical advice.
- The Lens does not read prescriptions, does not recognize tablets or bottles, and does not check doses.
- The pill box and the table are virtual stand-ins at real size. The "The box is here" button stands in for finding a real box.
- It runs in the Lens Studio preview only. Nothing here has been tried on SPECS glasses, so comfort, registration on a real box and hand tracking are unproven.

- Design brief: [devpost/design-brief.md](devpost/design-brief.md)
- Planning notes: [devpost/planning-notes.md](devpost/planning-notes.md)

License: MIT

Demo video (screen recording of the Lens Studio preview): https://youtu.be/5JjF62Mjf48
