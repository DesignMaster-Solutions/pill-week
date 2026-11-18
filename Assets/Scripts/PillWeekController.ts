// PillWeekController: the one orchestrator. Owns the PillWeekState, routes every SIK/UIKit pinch
// to a single handler (onBoxHere / onCellPinched / onNext / onStartOver), pushes the result to the
// passive views, and plays the two cues. Read-only getters below exist for LEAF tests; they never
// mutate. reset() is exactly what "Start over" does.
// Expects @inputs: box, card, three buttons, two audio tracks (wired by the scene).
// Must not: build UI or text itself.
import {PillWeekBoxUI} from "./PillWeekBoxUI"
import {PillWeekButton} from "./PillWeekButton"
import {PillWeekCardUI} from "./PillWeekCardUI"
import {CellView, PillWeekState, REGIMEN, WEEK_KEYS} from "./PillWeekState"

@component
export class PillWeekController extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">PillWeekController: Pill Week flow</span>')
  @ui.separator
  @ui.group_start("References")
  @input
  @hint("The pill box view (PillBox object)")
  box!: PillWeekBoxUI
  @input
  @hint("The medicine card / summary (MedicineCard object)")
  card!: PillWeekCardUI
  @input
  @hint("'The box is here' button")
  boxHereButton!: PillWeekButton
  @input
  @hint("'Next medicine' / 'Finish' button")
  nextButton!: PillWeekButton
  @input
  @hint("'Start over' button")
  startOverButton!: PillWeekButton
  @input
  @hint("Short low tone for a wrong compartment")
  wrongSound!: AudioTrackAsset
  @input
  @hint("Soft chime at Finish")
  finishSound!: AudioTrackAsset
  @ui.group_end
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Volume of both cues")
  @widget(new SliderWidget(0, 1, 0.05))
  volume: number = 0.8
  @ui.group_end

  private state = new PillWeekState()
  private tints: vec3[] = REGIMEN.map((m) => new vec3(m.tint[0], m.tint[1], m.tint[2]))
  private wrongAudio!: AudioComponent
  private chimeAudio!: AudioComponent

  onAwake(): void {
    // Root runs first in hierarchy order; the views below are not awake yet, so wire on start.
    this.createEvent("OnStartEvent").bind(() => this.wire())
  }

  private wire(): void {
    const missing = ["box", "card", "boxHereButton", "nextButton", "startOverButton"].filter((k) => !(this as any)[k])
    if (missing.length) {
      print(`PillWeekController: missing inputs ${missing.join(", ")}`)
      return
    }
    this.wrongAudio = this.audio("WrongTone", this.wrongSound)
    this.chimeAudio = this.audio("FinishChime", this.finishSound)
    this.box.setTints(this.tints)

    this.boxHereButton.onPressed.add(() => this.onBoxHere())
    this.nextButton.onPressed.add(() => this.onNext())
    this.startOverButton.onPressed.add(() => this.onStartOver())
    this.box.onCellPinched.add((key) => this.onCellPinched(key))

    // Hide after the first frame so UIKit components on hidden objects finish their OnStart init.
    const first = this.createEvent("UpdateEvent")
    first.bind(() => {
      first.enabled = false
      this.render()
    })
  }

  // ------------------------------------------------------------ handlers (pinch targets)

  onBoxHere(): void {
    this.state.markBoxFound()
    this.render()
  }

  onCellPinched(key: string): void {
    const r = this.state.pinchCell(key)
    if (r === "wrong") {
      this.box.flashWrong(key)
      this.play(this.wrongAudio)
    }
    this.render()
  }

  onNext(): void {
    if (this.state.next()) this.play(this.chimeAudio)
    this.render()
  }

  onStartOver(): void {
    this.state.reset()
    this.render()
  }

  /** Same as pinching "Start over". */
  reset(): void {
    this.onStartOver()
  }

  // ------------------------------------------------------------ read-only API for tests

  get boxFound(): boolean {
    return this.state.boxFound
  }
  get finished(): boolean {
    return this.state.finished
  }
  get medicineIndex(): number {
    return this.state.medicineIndex
  }
  get placedCount(): number {
    return this.state.placedCount
  }
  get targetCount(): number {
    return this.state.targetCount
  }
  /** "empty" | "lit" | "checked" | "amber", plus next (pulsing) and dots (medicine indices). */
  getCellState(key: string): CellView {
    return this.state.cell(key)
  }
  get cellKeys(): string[] {
    return WEEK_KEYS
  }
  get litKeys(): string[] {
    return WEEK_KEYS.filter((k) => this.state.cell(k).kind === "lit")
  }
  get amberKeys(): string[] {
    return WEEK_KEYS.filter((k) => this.state.cell(k).kind === "amber")
  }
  get cardTitle(): string {
    return this.state.boxFound ? this.state.cardTitle : ""
  }
  get cardSchedule(): string {
    return this.state.boxFound ? this.state.cardSchedule : ""
  }
  get cardProgress(): string {
    return this.state.boxFound ? this.state.cardProgress : ""
  }
  get cardCounter(): string {
    return this.state.boxFound ? this.state.cardCounter : ""
  }
  get cardStatus(): string {
    return this.state.boxFound ? this.state.cardStatus : ""
  }
  get summaryText(): string {
    return this.state.finished ? this.state.summaryText : ""
  }
  get skipListText(): string {
    return this.state.finished ? this.state.skipListText : ""
  }
  get nextLabel(): string {
    return this.state.isLastMedicine ? "Finish" : "Next medicine"
  }

  // ------------------------------------------------------------ view push

  private render(): void {
    const s = this.state
    const found = s.boxFound
    this.boxHereButton.setVisible(!found)
    this.nextButton.setVisible(found && !s.finished) // after Finish only "Start over" is left
    this.startOverButton.setVisible(found)
    this.card.setVisible(found)
    this.box.setLabelsVisible(found)
    this.nextButton.setLabel(this.nextLabel)

    const tint = s.finished ? new vec3(1, 1, 1) : this.tints[s.medicineIndex]
    this.box.currentTint = tint
    WEEK_KEYS.forEach((k) => this.box.setCell(k, s.cell(k)))
    const progress = s.finished ? "" : `${s.cardProgress}   ·   ${s.cardCounter}`
    this.card.setContent(s.cardTitle, s.cardSchedule, progress, s.cardStatus, tint)
  }

  private audio(name: string, track: AudioTrackAsset): AudioComponent {
    const o = global.scene.createSceneObject(name)
    o.setParent(this.sceneObject)
    const a = o.createComponent("Component.AudioComponent") as AudioComponent
    if (track) a.audioTrack = track
    a.volume = this.volume
    a.playbackMode = Audio.PlaybackMode.LowLatency // interactive cue; Specs default LowPower adds delay
    return a
  }

  private play(a: AudioComponent): void {
    if (a && a.audioTrack) a.play(1)
  }
}
