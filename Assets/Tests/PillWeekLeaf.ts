// LEAF helpers for Pill Week. Every action is a real SIK trigger on the compartment or button
// interactable; the controller is only read for assertions, plus reset() (= "Start over") to begin
// each scenario from a known state, since scenarios share one running Lens.
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {DEFAULT_EVENT_TIMEOUT_MS, findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {PillWeekController} from "../Scripts/PillWeekController"

export const MORNINGS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => `${d}_AM`)
export const EVENINGS = MORNINGS.map((k) => k.replace("_AM", "_PM"))

export class PillWeekLeaf extends DefaultLeafInteractor {
  constructor() {
    super("PillWeekLeaf")
    this.eventTimeoutMs = DEFAULT_EVENT_TIMEOUT_MS // a missed pinch fails with a named timeout
  }

  get ctrl(): PillWeekController {
    return findSceneObjectByName("PillWeek").getComponent(PillWeekController.getTypeName()) as PillWeekController
  }

  /** Real pinch on an enabled interactable (UIKit button or compartment). */
  async pinch(name: string): Promise<void> {
    const target = findInteractablesByName(name, undefined, true)[0]
    if (!target) throw new Error(`Interactable "${name}" not found or not enabled`)
    await this.trigger(target)
    await sleep(250)
  }

  cell(key: string): Promise<void> {
    return this.pinch(`Cell_${key}`)
  }

  /** Start over (keeps the box as found), then "The box is here" if it still shows: Losartan, nothing placed. */
  async freshStart(): Promise<void> {
    await sleep(800)
    this.ctrl.reset()
    await sleep(300)
    if (!this.ctrl.boxFound) await this.pinch("BoxHereButton")
    if (this.ctrl.medicineIndex !== 0 || this.ctrl.placedCount !== 0) throw new Error("fresh start failed")
  }

  /** Pinch every lit compartment of the current medicine, in week order. */
  async fillLit(skip: string[] = []): Promise<void> {
    for (const k of this.ctrl.litKeys.slice()) if (skip.indexOf(k) < 0) await this.cell(k)
  }

  enabled(name: string): boolean {
    const so = findSceneObjectByName(name)
    return !isNull(so) && so.isEnabledInHierarchy
  }

  /** Every string the medicine card is showing right now (what the user reads). */
  cardTexts(): string[] {
    const out: string[] = []
    const walk = (o: SceneObject) => {
      if (!o.isEnabledInHierarchy) return
      const t = o.getComponent("Component.Text") as Text
      if (t) out.push(t.text)
      for (let i = 0; i < o.getChildrenCount(); i++) walk(o.getChild(i))
    }
    walk(findSceneObjectByName("MedicineCard"))
    return out
  }

  cardShows(s: string): boolean {
    return this.cardTexts().some((t) => t.indexOf(s) >= 0)
  }
}
