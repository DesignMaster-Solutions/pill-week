import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {MORNINGS, PillWeekLeaf} from "./PillWeekLeaf"

// DC1: pinching "The box is here" shows the Losartan card (Medicine 1 of 4, 0 of 7 placed)
// and lights exactly the 7 morning compartments. "Start over" keeps the box as found, so this
// scenario runs first after a preview refresh (a fresh Lens, as when the user puts the glasses on).
@component
export class Dc1BoxHereLightsMornings extends Scenario {
  async run(): Promise<void> {
    const t = new PillWeekLeaf()
    await sleep(800)
    t.ctrl.reset()
    await sleep(300)
    expect(t.enabled("BoxHereButton")).toBe(true)
    expect(t.enabled("MedicineCard")).toBe(false)
    expect(t.ctrl.litKeys.length).toBe(0)

    await t.pinch("BoxHereButton")
    expect(t.enabled("BoxHereButton")).toBe(false)
    expect(t.enabled("MedicineCard")).toBe(true)
    expect(t.cardShows("Losartan 50 mg")).toBe(true)
    expect(t.cardShows("Medicine 1 of 4")).toBe(true)
    expect(t.cardShows("0 of 7 placed")).toBe(true)
    expect(t.ctrl.litKeys.join(",")).toBe(MORNINGS.join(","))
  }
}
