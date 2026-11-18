import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {PillWeekLeaf} from "./PillWeekLeaf"

// Not a done criterion: poses the Lens with real SIK pinches for docs/prints/02.
// Losartan lit, Mon to Wed morning filled: "3 of 7 placed", Thu morning pulsing next.
@component
export class PrintSomeChecked extends Scenario {
  async run(): Promise<void> {
    const t = new PillWeekLeaf()
    await t.freshStart()
    for (const k of ["Mon_AM", "Tue_AM", "Wed_AM"]) await t.cell(k)
    expect(t.ctrl.placedCount).toBe(3)
  }
}
