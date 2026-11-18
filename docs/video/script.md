# Pill Week demo video: script

Written with the technical-video-script skill. The narration column is the exact text the macOS `say` voice (Samantha, rate 180) reads; it lives in `demo.json`, which `demo_slides.py` renders into `demo.mp4` (2:56, 1920x1080).

## Promise

For a family member who fills a parent's weekly pill box, this video shows Pill Week lighting where each medicine goes and catching skipped and wrong compartments, running end to end in the Lens Studio preview.

## Shape

Feature walkthrough (2 to 5 min, one path, the outcome working). Deleted: concept explainer and motion design explainer (no illustration work; the rule asks for a screen recording of the Lens). Viewer: hackathon judges and Spectacles developers, sound on, watching once.

## Beats

| # | Visual | On-screen action | Narration (summary; exact text in demo.json) | Starting state | Est. s | Core/cut |
|---|---|---|---|---|---|---|
| 1 | Title slide | none | The problem (weekly pill box, quiet mistakes), who it is for, the idea | none | 16 | core |
| 2 | Slide | none | Sample regimen, not medical advice, no prescription reading, preview only, nothing on glasses | none | 15 | core |
| 3 | Preview clip, 01-start | idle start | Box stand-in, 7 x 2, 4 cm, "The box is here" | fresh Lens, camera behind and above | 12 | core |
| 4 | Preview clip, LEAF dc1 | pinch "The box is here" | Losartan card, 0 of 7, 7 mornings lit | fresh Lens | 14 | core |
| 5 | Preview clip, LEAF dc2 | check, undo | Check and dot, counter up, pinch again to undo | box found, Losartan | 9 | core |
| 6 | Preview clip, LEAF dc3 | pinch Tue PM | Refused, tone, "Not here" | box found, Losartan | 13 | core |
| 7 | Preview clip, LEAF dc4 | Mon, Wed, then Tue | Tue amber "skipped", cleared when filled | box found, Losartan | 9 | core |
| 8 | Preview clip, LEAF dc5 | Next three times | Metformin 14, Calcium 4 evenings, B12 Sunday morning, dots stack | box found, Losartan | 15 | core |
| 9 | Preview clip, LEAF dc6 | two full fills, Finish | Full week 0 skipped; Thu PM left empty is named and stays amber | box found | 20 | core |
| 10 | Preview clip, LEAF dc7 | IK arm reaches all 17 | All in direct reach; the press can land on the neighbour | head at the start pose | 18 | cuttable |
| 11 | Terminal block from leaf-run.log | none | 7 scenarios, all pass, one broken on purpose | none | 12 | cuttable |
| 12 | Slide | none | Not proven yet, sample, not medical advice | none | 15 | core |

Cut plan if it runs long: beat 11, then beat 10 (the build report carries both).

## Chapters (from the rendered mp4)

Measured with ffmpeg scene detection on the title bar of `demo.mp4`:

00:00 Pill Week · 00:18 Sample, not medical advice · 00:35 The box is here · 00:47 One medicine at a time · 01:01 Check and undo · 01:10 Wrong compartment · 01:22 Skipped turns amber · 01:31 Next medicine · 01:47 Finish and the summary · 02:07 Within reach of a seated user · 02:25 Tested with LEAF · 02:39 Not proven yet

## Recording brief

- Every clip is a burst of real Preview panel grabs (`capture_preview.ts` through the MCP `ExecuteEditorCode`), taken while the named LEAF scenario ran. `clips.py` shows each frame for its real interval at 1.0x; nothing is interpolated.
- Camera: dc1 to dc6 from behind and above the user (0, 12, 28 looking at the box) so the whole table fits; dc7 from the user's head (origin, 38 degrees down), the pose the IK test uses.
- Off screen: nothing personal; only the Lens Studio Preview panel is grabbed.
- Runtime: 462 narration words at about 166 words per minute, plus 0.6 s per scene and the slide transitions, gives 2:56 against a 3:00 limit.
