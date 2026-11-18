import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {PillWeekLeaf} from "./PillWeekLeaf"

// DC6: filling every lit compartment and pinching "Finish" shows
// "Morning 15 of 15 · Evening 11 of 11 · 0 skipped"; leaving one empty shows "1 skipped"
// naming that compartment, and it stays amber.
@component
export class Dc6FinishSummary extends Scenario {
  async run(): Promise<void> {
    const t = new PillWeekLeaf()

    const fullWeek = async (leaveEmpty: string) => {
      await t.freshStart()
      for (let m = 0; m < 4; m++) {
        await t.fillLit(m === 1 ? [leaveEmpty] : [])
        await t.pinch("NextButton") // the 4th press is "Finish"
      }
    }

    await fullWeek("")
    expect(t.ctrl.finished).toBe(true)
    expect(t.cardShows("Morning 15 of 15 · Evening 11 of 11 · 0 skipped")).toBe(true)
    expect(t.ctrl.amberKeys.length).toBe(0)

    await fullWeek("Thu_PM") // Metformin, Thursday evening
    expect(t.ctrl.finished).toBe(true)
    expect(t.cardShows("Morning 15 of 15 · Evening 10 of 11 · 1 skipped")).toBe(true)
    expect(t.cardShows("1 skipped: Thu PM Metformin")).toBe(true)
    expect(t.ctrl.amberKeys.join(",")).toBe("Thu_PM")
    expect(t.enabled("NextButton")).toBe(false) // only "Start over" is left after Finish
    expect(t.enabled("StartOverButton")).toBe(true)
  }
}
