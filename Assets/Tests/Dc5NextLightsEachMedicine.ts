import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {EVENINGS, MORNINGS, PillWeekLeaf} from "./PillWeekLeaf"

// DC5: "Next medicine" moves through the four medicines and lights the right compartments:
// 14 for Metformin, Mon/Wed/Fri/Sun evening for Calcium, only Sunday morning for B12.
@component
export class Dc5NextLightsEachMedicine extends Scenario {
  async run(): Promise<void> {
    const t = new PillWeekLeaf()
    await t.freshStart()
    await t.fillLit()

    await t.pinch("NextButton")
    expect(t.ctrl.medicineIndex).toBe(1)
    expect(t.cardShows("Metformin 500 mg")).toBe(true)
    expect(t.cardShows("Medicine 2 of 4")).toBe(true)
    expect(t.ctrl.litKeys.length).toBe(14)
    await t.fillLit()

    await t.pinch("NextButton")
    expect(t.ctrl.medicineIndex).toBe(2)
    expect(t.cardShows("Calcium 600 mg + vitamin D")).toBe(true)
    expect(t.ctrl.litKeys.join(",")).toBe("Mon_PM,Wed_PM,Fri_PM,Sun_PM")
    await t.fillLit()

    await t.pinch("NextButton")
    expect(t.ctrl.medicineIndex).toBe(3)
    expect(t.cardShows("Vitamin B12 1000 mcg")).toBe(true)
    expect(t.ctrl.litKeys.join(",")).toBe("Sun_AM")
    expect(t.ctrl.nextLabel).toBe("Finish")
    // what is already inside shows as dots: Sun PM holds Metformin and Calcium
    expect(t.ctrl.getCellState("Sun_PM").dots.join(",")).toBe("1,2")
    expect(MORNINGS.concat(EVENINGS).length).toBe(14)
  }
}
