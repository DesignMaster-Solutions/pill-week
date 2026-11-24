// PillWeekBoxUI: passive view of the 7 x 2 pill box (stand-in for the real one on the table).
// Owns: the box base, 14 compartment SceneObjects "Cell_<Day>_<AM|PM>" (SIK Interactable + box
// collider + hover highlight), check marks, medicine dots, "skipped" labels, day and AM/PM labels.
// Expects: to sit on the "PillBox" SceneObject whose origin is the box's bottom center on the table.
// Must not: hold domain state or decide anything. The controller pushes CellViews in via setCell()
// and listens to onCellPinched. Text lives here (not in the controller) per the UI-module rule;
// it is placed per compartment because each label belongs to a physical 4 cm column/row of the box,
// so a FlexLayout would only re-derive the same grid.
import Event, {PublicApi} from "InteractionKit.lspkg/Utils/Event"
import {Interactable} from "InteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {CellView, DAYS, SLOTS, WEEK_KEYS} from "./PillWeekState"

const BOX_MESH = requireAsset("../Meshes/PillWeekBox.mesh") as RenderMesh
const BASE_MAT = requireAsset("../Materials/PillWeekUnlit.mat") as Material

interface Cell {
  obj: SceneObject
  lid: RenderMeshVisual
  check: SceneObject
  dots: RenderMeshVisual[]
  skipped: SceneObject
  view: CellView
  hovered: boolean
  wrongUntil: number
}

@component
export class PillWeekBoxUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">PillWeekBoxUI: pill box view</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Compartment pitch in cm (brief: 4 cm large-print organizer)")
  @widget(new SliderWidget(2.5, 6, 0.5))
  cellSizeCm: number = 4

  @input
  @hint("Height of the box base in cm; lids sit on top of it")
  @widget(new SliderWidget(1, 5, 0.5))
  boxHeightCm: number = 2.5

  @input("vec3", "{0.2, 0.22, 0.25}")
  @hint("Empty lid color (dim = translucent on the additive display)")
  @widget(new ColorWidget())
  emptyColor: vec3 = new vec3(0.2, 0.22, 0.25)

  @input("vec3", "{1, 0.65, 0.15}")
  @hint("Skipped compartment color")
  @widget(new ColorWidget())
  amberColor: vec3 = new vec3(1, 0.65, 0.15)

  @input("vec3", "{1, 0.35, 0.25}")
  @hint("Wrong-compartment flash color")
  @widget(new ColorWidget())
  wrongColor: vec3 = new vec3(1, 0.35, 0.25)

  @input
  @hint("Seconds the wrong-compartment flash lasts")
  @widget(new SliderWidget(0.2, 2, 0.1))
  wrongFlashSeconds: number = 0.7
  @ui.group_end

  private cells: Map<string, Cell> = new Map()
  private labels: SceneObject[] = []
  private tints: vec3[] = []
  private _onCellPinched = new Event<string>()

  /** Fires with the compartment key ("Mon_AM") when a compartment is pinched. */
  get onCellPinched(): PublicApi<string> {
    return this._onCellPinched.publicApi()
  }

  onAwake(): void {
    this.build()
    this.createEvent("UpdateEvent").bind(() => this.tick())
  }

  setTints(tints: vec3[]): void {
    this.tints = tints
  }

  setLabelsVisible(on: boolean): void {
    this.labels.forEach((l) => (l.enabled = on))
  }

  setCell(key: string, view: CellView): void {
    const c = this.cells.get(key)
    if (!c) return
    c.view = view
    c.check.enabled = view.kind === "checked"
    c.skipped.enabled = view.kind === "amber"
    c.dots.forEach((d, i) => {
      const med = view.dots[i]
      d.sceneObject.enabled = med !== undefined
      if (med !== undefined) this.color(d, this.tints[med] ?? new vec3(1, 1, 1))
    })
  }

  /** Short amber-red flash on a compartment where the current medicine does not go. */
  flashWrong(key: string): void {
    const c = this.cells.get(key)
    if (c) c.wrongUntil = getTime() + this.wrongFlashSeconds
  }

  /** Index of the medicine whose tint lights/checks cells; set by the controller. */
  currentTint: vec3 = new vec3(1, 1, 1)

  // ---------------------------------------------------------------- build

  private build(): void {
    const s = this.cellSizeCm
    const w = s * DAYS.length + 4 // 2 cm border left/right
    const d = s * SLOTS.length + 2 // 1 cm border front/back
    const base = this.box(this.sceneObject, "PillBoxBase", new vec3(0, this.boxHeightCm / 2, 0), new vec3(w, this.boxHeightCm, d))
    this.color(base, new vec3(0.32, 0.34, 0.38))

    const top = this.boxHeightCm
    DAYS.forEach((day, col) => {
      const x = (col - (DAYS.length - 1) / 2) * s
      SLOTS.forEach((slot, row) => {
        // morning row in back (-Z), evening row in front (+Z, toward the user)
        const z = (row - 0.5) * s
        this.cells.set(`${day}_${slot}`, this.buildCell(`${day}_${slot}`, new vec3(x, top, z)))
      })
      this.labels.push(this.text(this.sceneObject, `Day_${day}`, day, new vec3(x, top + 0.3, -d / 2 - 1.4), 80))
    })
    SLOTS.forEach((slot, row) => {
      this.labels.push(this.text(this.sceneObject, `Row_${slot}`, slot, new vec3(-w / 2 + 1, top + 0.3, (row - 0.5) * s), 56))
    })
    this.setLabelsVisible(false)
  }

  private buildCell(key: string, pos: vec3): Cell {
    const s = this.cellSizeCm
    const obj = global.scene.createSceneObject(`Cell_${key}`)
    obj.setParent(this.sceneObject)
    obj.getTransform().setLocalPosition(pos)

    // 4 x 4 cm pinch target: collider + SIK Interactable on the cell itself
    const col = obj.createComponent("Physics.ColliderComponent") as ColliderComponent
    const shape = Shape.createBoxShape()
    shape.size = new vec3(s, 2, s)
    col.shape = shape
    col.fitVisual = false
    const it = obj.createComponent(Interactable.getTypeName()) as Interactable

    const lid = this.box(obj, "Lid", new vec3(0, 0.15, 0), new vec3(s - 0.6, 0.3, s - 0.6))

    // check mark: two white bars forming a tick, lying on the lid
    const check = global.scene.createSceneObject("Check")
    check.setParent(obj)
    check.getTransform().setLocalPosition(new vec3(-0.2, 0.45, -0.3))
    const white = new vec3(1, 1, 1)
    this.color(this.box(check, "Short", new vec3(-0.55, 0, 0.1), new vec3(1.2, 0.15, 0.35), -45), white)
    this.color(this.box(check, "Long", new vec3(0.45, 0, -0.25), new vec3(2.0, 0.15, 0.35), 50), white)

    // up to 4 dots (one per medicine placed), in a row along the front of the compartment
    const dots: RenderMeshVisual[] = []
    for (let i = 0; i < 4; i++) {
      const dot = this.box(obj, `Dot${i}`, new vec3(-1.2 + i * 0.8, 0.45, s / 2 - 0.75), new vec3(0.55, 0.3, 0.55))
      dot.sceneObject.enabled = false
      dots.push(dot)
    }

    const skipped = this.text(obj, "Skipped", "skipped", new vec3(0, 1.1, -0.4), 50)
    skipped.enabled = false

    const cell: Cell = {obj, lid, check, dots, skipped, view: {kind: "empty", next: false, dots: []}, hovered: false, wrongUntil: 0}
    it.onHoverEnter.add(() => (cell.hovered = true))
    it.onHoverExit.add(() => (cell.hovered = false))
    it.onTriggerEnd.add(() => this._onCellPinched.invoke(key))
    return cell
  }

  // ---------------------------------------------------------------- per-frame look

  private tick(): void {
    const now = getTime()
    const pulse = 0.78 + 0.22 * Math.sin(now * 5)
    this.cells.forEach((c) => {
      let col: vec3
      if (now < c.wrongUntil) col = this.wrongColor
      else if (c.view.kind === "amber") col = this.amberColor
      else if (c.view.kind === "lit") col = this.currentTint.uniformScale(c.view.next ? pulse : 0.7)
      else if (c.view.kind === "checked") col = this.currentTint.uniformScale(0.5)
      else col = this.emptyColor
      if (c.hovered) col = col.add(new vec3(0.18, 0.18, 0.18))
      this.color(c.lid, col)
      c.lid.getTransform().setLocalScale(this.lidScale(c.hovered ? 1.06 : 1))
    })
  }

  private lidScale(k: number): vec3 {
    const s = this.cellSizeCm - 0.6
    return new vec3(s * k, 0.3, s * k)
  }

  // ---------------------------------------------------------------- helpers

  private box(parent: SceneObject, name: string, pos: vec3, size: vec3, yawDeg: number = 0): RenderMeshVisual {
    const o = global.scene.createSceneObject(name)
    o.setParent(parent)
    const t = o.getTransform()
    t.setLocalPosition(pos)
    t.setLocalScale(size) // PillWeekBox.mesh is a 1 cm unit cube
    if (yawDeg) t.setLocalRotation(quat.fromEulerAngles(0, (yawDeg * Math.PI) / 180, 0))
    const v = o.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
    v.mesh = BOX_MESH
    v.mainMaterial = BASE_MAT.clone()
    return v
  }

  private color(v: RenderMeshVisual, c: vec3): void {
    v.mainMaterial.mainPass.baseColor = new vec4(c.x, c.y, c.z, 1)
  }

  /** Light label lying on the box, tilted toward a seated user's eye. */
  private text(parent: SceneObject, name: string, value: string, pos: vec3, size: number): SceneObject {
    const o = global.scene.createSceneObject(name)
    o.setParent(parent)
    o.getTransform().setLocalPosition(pos)
    o.getTransform().setLocalRotation(quat.fromEulerAngles((-55 * Math.PI) / 180, 0, 0))
    const t = o.createComponent("Component.Text") as Text
    t.text = value
    t.size = size
    t.depthTest = true
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.textFill.color = new vec4(1, 1, 1, 1)
    return o
  }

  /** Keys in week order, for callers that render the whole box. */
  get keys(): string[] {
    return WEEK_KEYS
  }
}
