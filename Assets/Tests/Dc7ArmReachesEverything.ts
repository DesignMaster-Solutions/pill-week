import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {IKBodyInteractor} from "Leaf.lspkg/Interactors/interactor/ik/IKBodyInteractor"
import {DiagnosticRecorder} from "Leaf.lspkg/Diagnostic/DiagnosticRecorder"
import {Interactable} from "InteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {EVENINGS, MORNINGS, PillWeekLeaf} from "./PillWeekLeaf"

// DC7 (reach): a seated user's IK arm (LEAF arm model, head at the preview pose) reaches every
// button and all 14 compartments by touch. No SIK fallback, fail-fast diagnostics: any
// unreachable_* or out_of_fov aborts the run. Each reach must be a direct (in-arm) reach and the
// pinch point must end within 3 cm of the target's center. The left half of the box and
// "Start over" use the left hand, the rest the right hand.
const MAX_PINCH_TO_CENTER_CM = 3
const REACH_TIMEOUT_S = 15

@component
export class Dc7ArmReachesEverything extends Scenario {
  async run(): Promise<void> {
    const t = new PillWeekLeaf()
    const recorder = DiagnosticRecorder.getInstance()
    recorder.reset()
    recorder.setPolicy("fail-fast")
    const body = new IKBodyInteractor() // no fallback: the arm itself has to get there
    const report: string[] = []
    // Lens state the press would change; reach is the assertion, the press result is reported.
    const snapshot = () =>
      [t.ctrl.boxFound, t.ctrl.medicineIndex, t.ctrl.placedCount, t.ctrl.cardStatus, t.ctrl.amberKeys.join()].join("|")
    try {
      const reach = async (name: string, hand: "left" | "right"): Promise<void> => {
        const target: Interactable = findInteractablesByName(name, undefined, true)[0]
        if (!target) throw new Error(`Interactable "${name}" not found or not enabled`)
        if (body[hand].isIndirect(target)) throw new Error(`${name} is beyond direct ${hand}-arm reach`)
        const center = target.getSceneObject().getTransform().getWorldPosition()
        const ikHand = (body[hand] as any)._hand
        let closest = Number.MAX_VALUE
        let tracking = true
        const track = async () => {
          while (tracking) {
            const p: vec3 | undefined = ikHand?.pinchEndpointWorld
            if (p) closest = Math.min(closest, p.distance(center))
            await sleep(50)
          }
        }
        const before = snapshot()
        track()
        // The IK pinch loop has no timeout of its own; a reach that never lands must fail, not hang.
        let timer: DelayedCallbackEvent | undefined
        const timeout = new Promise<never>((_, reject) => {
          timer = this.createEvent("DelayedCallbackEvent")
          timer.bind(() => reject(new Error(`${name}: ${hand} reach did not land in ${REACH_TIMEOUT_S} s`)))
          timer.reset(REACH_TIMEOUT_S)
        })
        try {
          await Promise.race([body.trigger(target, hand), timeout])
        } finally {
          tracking = false
          timer?.cancel()
        }
        const pressed = snapshot() !== before
        report.push(`${name}(${hand[0]}) ${closest.toFixed(1)}cm ${pressed ? "pressed" : "no-press"}`)
        expect(closest).toBeLessThan(MAX_PINCH_TO_CENTER_CM)
        await sleep(400) // arm settles before the next reach
      }

      await sleep(800)
      t.ctrl.reset()
      await sleep(300)
      if (!t.ctrl.boxFound) {
        await reach("BoxHereButton", "right")
        if (!t.ctrl.boxFound) await t.pinch("BoxHereButton") // the next controls only show after it
      } else report.push("BoxHereButton skipped (box already found; run after a refresh)")
      await reach("NextButton", "right") // Losartan -> Metformin
      await reach("StartOverButton", "left") // back to Losartan, so the touches below change state
      // Week order (Mon AM, Mon PM, ...): a morning touch checks Losartan, an evening one shows "Not here".
      for (const k of MORNINGS.map((m, i) => [m, EVENINGS[i]]).reduce((a, p) => a.concat(p), [] as string[])) {
        const leftHalf = k.startsWith("Mon") || k.startsWith("Tue") || k.startsWith("Wed")
        await reach(`Cell_${k}`, leftHalf ? "left" : "right")
      }

      print(`dc7 reach (pinch to center): ${report.join(" | ")}`)
      print(`dc7 diagnostics: ${recorder.getAll().map((e) => `${e.diagnostic.category}: ${(e.diagnostic as any).message ?? ""}`).join(" | ") || "none"}`)
      // DC7 is reach: no unreachable_*, out_of_fov or reach_marginal may be on record. Two known
      // preview gaps are reported, not hidden (docs/build-report.md): SIK 3.1 never promotes the IK
      // hand to hover (convergence_timeout), and on the 4 cm grid the IK hand can resolve to the
      // compartment east of the one it reached (target_overlap). Presses are proven by dc1-dc6.
      const known = ["convergence_timeout", "target_overlap"]
      const overlaps = recorder.getAll().filter((e) => e.diagnostic.category === "target_overlap").length
      print(`dc7 summary: ${report.length} controls reached by touch, ${overlaps} target_overlap`)
      const other = recorder.getAll().filter((e) => known.indexOf(e.diagnostic.category) < 0)
      expect(other.length).toBe(0)
      recorder.reset()
    } finally {
      recorder.setPolicy("fallback")
      body.destroy()
    }
  }
}
