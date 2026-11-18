import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {PillWeekLeaf} from "./PillWeekLeaf"

// DC4: checking Wednesday morning while Tuesday morning is still empty turns Tuesday morning
// amber ("skipped"); checking Tuesday morning clears it.
@component
export class Dc4SkippedTurnsAmber extends Scenario {
  async run(): Promise<void> {
    const t = new PillWeekLeaf()
    await t.freshStart()

    await t.cell("Mon_AM")
    await t.cell("Wed_AM")
    expect(t.ctrl.getCellState("Tue_AM").kind).toBe("amber")
    expect(t.ctrl.amberKeys.join(",")).toBe("Tue_AM")
    expect(t.cardShows("Skipped: Tue AM")).toBe(true)

    await t.cell("Tue_AM")
    expect(t.ctrl.getCellState("Tue_AM").kind).toBe("checked")
    expect(t.ctrl.amberKeys.length).toBe(0)
    expect(t.cardShows("Skipped")).toBe(false)
  }
}
