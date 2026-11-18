import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {PillWeekLeaf} from "./PillWeekLeaf"

// DC2: pinching a lit compartment checks it and the counter goes up by one;
// pinching it again unchecks it and the counter goes back.
@component
export class Dc2CheckAndUndo extends Scenario {
  async run(): Promise<void> {
    const t = new PillWeekLeaf()
    await t.freshStart()
    const before = t.ctrl.placedCount

    await t.cell("Mon_AM")
    expect(t.ctrl.getCellState("Mon_AM").kind).toBe("checked")
    expect(t.ctrl.placedCount).toBe(before + 1)
    expect(t.cardShows(`${before + 1} of 7 placed`)).toBe(true)

    await t.cell("Mon_AM")
    expect(t.ctrl.getCellState("Mon_AM").kind).toBe("lit")
    expect(t.ctrl.placedCount).toBe(before)
    expect(t.cardShows(`${before} of 7 placed`)).toBe(true)
  }
}
