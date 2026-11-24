import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import {Dc1BoxHereLightsMornings} from "./Dc1BoxHereLightsMornings"
import {Dc2CheckAndUndo} from "./Dc2CheckAndUndo"
import {Dc3WrongCompartmentWarns} from "./Dc3WrongCompartmentWarns"
import {Dc4SkippedTurnsAmber} from "./Dc4SkippedTurnsAmber"
import {Dc5NextLightsEachMedicine} from "./Dc5NextLightsEachMedicine"
import {Dc6FinishSummary} from "./Dc6FinishSummary"
import {Dc7ArmReachesEverything} from "./Dc7ArmReachesEverything"
import {Dc8WorldQueryPlacesBox} from "./Dc8WorldQueryPlacesBox"
import {PrintSomeChecked} from "./PrintSomeChecked"
import {PrintWrongAndSkipped} from "./PrintWrongAndSkipped"

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    {id: "dc1-box-here-lights-mornings", typename: Dc1BoxHereLightsMornings.getTypeName()},
    {id: "dc2-check-and-undo", typename: Dc2CheckAndUndo.getTypeName()},
    {id: "dc3-wrong-compartment-warns", typename: Dc3WrongCompartmentWarns.getTypeName()},
    {id: "dc4-skipped-turns-amber", typename: Dc4SkippedTurnsAmber.getTypeName()},
    {id: "dc5-next-lights-each-medicine", typename: Dc5NextLightsEachMedicine.getTypeName()},
    {id: "dc6-finish-summary", typename: Dc6FinishSummary.getTypeName()},
    {id: "dc7-ik-arm-reaches-everything", typename: Dc7ArmReachesEverything.getTypeName()},
    {id: "dc8-world-query-places-box", typename: Dc8WorldQueryPlacesBox.getTypeName()},
    // poses for docs/prints, not done criteria
    {id: "print-02-some-checked", typename: PrintSomeChecked.getTypeName()},
    {id: "print-03-wrong-and-skipped", typename: PrintWrongAndSkipped.getTypeName()},
  ]
}
