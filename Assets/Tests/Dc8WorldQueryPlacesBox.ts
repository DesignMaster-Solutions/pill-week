import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {PillWeekLeaf} from "./PillWeekLeaf"

// DC8 (World Query): the preview has no real depth, so the hit test result is injected through the
// same placeOnHit() the hit test callback calls. A wall hit is refused and the stand-in stays; a level
// hit 25 cm right, 5 cm lower, user turned 20 degrees left, puts the PillBox on that point, turned with
// the user, hides the stand-in table, and the box still takes a real SIK pinch at its new place.
const near = (a: vec3, b: vec3) => a.distance(b) < 0.5

@component
export class Dc8WorldQueryPlacesBox extends Scenario {
  async run(): Promise<void> {
    const t = new PillWeekLeaf()
    await t.freshStart()
    const box = () => findSceneObjectByName("PillBox").getTransform()
    const standIn = box().getWorldPosition()
    expect(near(standIn, new vec3(0, -40, -45))).toBe(true)

    expect(t.ctrl.placeOnHit([0, -40, -45], [0, 0, 1], 0)).toBe(false) // wall
    expect(t.ctrl.onSurface).toBe(false)
    expect(near(box().getWorldPosition(), standIn)).toBe(true)
    expect(t.enabled("Table (stand-in)")).toBe(true)

    const yaw = (20 * Math.PI) / 180
    expect(t.ctrl.placeOnHit([25, -45, -50], [0.05, 0.99, 0], yaw)).toBe(true)
    await sleep(200)
    expect(t.ctrl.onSurface).toBe(true)
    expect(near(box().getWorldPosition(), new vec3(25, -45, -50))).toBe(true)
    const fwd = box().forward // the box turned with the user: its +Z points along yaw
    expect(Math.abs(Math.atan2(fwd.x, fwd.z) - yaw) < 0.01).toBe(true)
    expect(t.enabled("Table (stand-in)")).toBe(false)
    expect(near(findSceneObjectByName("Cell_Mon_AM").getTransform().getWorldPosition(), standIn)).toBe(false)

    await t.cell("Mon_AM") // real SIK pinch on the moved compartment
    expect(t.ctrl.placedCount).toBe(1)
    expect(t.ctrl.getCellState("Mon_AM").kind).toBe("checked")
  }
}
