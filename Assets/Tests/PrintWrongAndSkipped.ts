import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {PillWeekLeaf} from "./PillWeekLeaf"

// Not a done criterion: poses the Lens with real SIK pinches for docs/prints/03.
// Losartan: Wed morning checked over an empty Tue morning (amber, skipped), then Tue evening refused.
@component
export class PrintWrongAndSkipped extends Scenario {
  async run(): Promise<void> {
    const t = new PillWeekLeaf()
    await t.freshStart()
    await t.cell("Mon_AM")
    await t.cell("Wed_AM")
    await t.cell("Tue_PM")
    expect(t.ctrl.amberKeys.join(",")).toBe("Tue_AM")
    expect(t.cardShows("Not here: Losartan goes in mornings only")).toBe(true)
  }
}
