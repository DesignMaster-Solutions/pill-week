import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {PillWeekLeaf} from "./PillWeekLeaf"

// DC3: pinching a compartment where the current medicine does not go leaves it unchecked
// and the card shows the "Not here" warning.
@component
export class Dc3WrongCompartmentWarns extends Scenario {
  async run(): Promise<void> {
    const t = new PillWeekLeaf()
    await t.freshStart()
    const before = t.ctrl.placedCount

    await t.cell("Tue_PM") // Losartan goes in mornings only
    expect(t.ctrl.getCellState("Tue_PM").kind).toBe("empty")
    expect(t.ctrl.getCellState("Tue_PM").dots.length).toBe(0)
    expect(t.ctrl.placedCount).toBe(before)
    expect(t.cardShows("Not here: Losartan goes in mornings only")).toBe(true)
  }
}
