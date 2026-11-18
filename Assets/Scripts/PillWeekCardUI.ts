// PillWeekCardUI: passive view of the medicine card standing behind the box (and of the summary,
// which replaces it after the last medicine). UIKit BackPlate + FlexLayout column, four text rows:
// title, schedule (or summary), progress line, status (warning / skip list).
// Expects: to sit on the "MedicineCard" SceneObject, tilted toward the user in the scene.
// Must not: compute any text; the controller pushes finished strings via setContent().
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {FlexAlign, FlexAlignSelf, FlexDirection, FlexJustify} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"

const LAYOUT_Z_LIFT = 0.02

@component
export class PillWeekCardUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">PillWeekCardUI: medicine card / summary</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Card width in cm (brief: 24; 30 fits the longest line at 1.2 cm cap height)")
  @widget(new SliderWidget(16, 40, 1))
  widthCm: number = 30

  @input
  @hint("Card height in cm (brief: 12; 15 fits two 2-line rows)")
  @widget(new SliderWidget(8, 24, 0.5))
  heightCm: number = 15

  @input
  @hint("Text size of the medicine name (Lens Text size; ~44 per 1 cm em height)")
  @widget(new SliderWidget(40, 120, 1))
  titleSize: number = 100

  @input
  @hint("Text size of the other card lines (92 gives ~1.2 cm cap height, measured)")
  @widget(new SliderWidget(40, 120, 1))
  bodySize: number = 92

  @input("vec3", "{1, 0.75, 0.3}")
  @hint("Color of warnings and the skip list")
  @widget(new ColorWidget())
  warnColor: vec3 = new vec3(1, 0.75, 0.3)
  @ui.group_end

  private title!: Text
  private schedule!: Text
  private progress!: Text
  private status!: Text

  onAwake(): void {
    this.sceneObject.createComponent("Component.Canvas")
    const plate = this.sceneObject.createComponent(BackPlate.getTypeName()) as BackPlate
    plate.size = new vec2(this.widthCm, this.heightCm)

    const content = global.scene.createSceneObject("Content")
    content.setParent(this.sceneObject)
    content.getTransform().setLocalPosition(new vec3(0, 0, 0.6))
    const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
    const w = this.widthCm - 1.2
    const rows: FlexItem[] = []
    this.title = this.row(content, "Title", w, 2.6, this.titleSize, rows)
    this.schedule = this.row(content, "Schedule", w, 4.4, this.bodySize, rows)
    this.progress = this.row(content, "Progress", w, 2.3, this.bodySize, rows)
    this.status = this.row(content, "Status", w, 4.4, this.bodySize, rows)
    this.status.textFill.color = new vec4(this.warnColor.x, this.warnColor.y, this.warnColor.z, 1)
    flex.onInitialized.add(() => {
      flex.width = this.widthCm
      flex.height = this.heightCm
      flex.direction = FlexDirection.Column
      flex.justifyContent = FlexJustify.Center
      flex.alignItems = FlexAlign.Stretch
      flex.rowGap = 0.1
      flex.paddingTop = 0.3
      flex.paddingBottom = 0.3
      flex.paddingLeft = 0.6
      flex.paddingRight = 0.6
      flex.addItems(rows)
    })
  }

  /** Push the card contents. tint colors the medicine name. */
  setContent(title: string, schedule: string, progress: string, status: string, tint: vec3): void {
    if (!this.title) return
    this.title.text = title
    this.title.textFill.color = new vec4(tint.x, tint.y, tint.z, 1)
    this.schedule.text = schedule
    this.progress.text = progress
    this.status.text = status
  }

  setVisible(on: boolean): void {
    this.sceneObject.enabled = on
  }

  private row(parent: SceneObject, name: string, w: number, h: number, size: number, rows: FlexItem[]): Text {
    const o = global.scene.createSceneObject(name)
    o.setParent(parent)
    o.getTransform().setLocalPosition(new vec3(0, 0, LAYOUT_Z_LIFT))
    const item = o.createComponent(FlexItem.getTypeName()) as FlexItem
    item.overrideHeight = h
    item.alignSelf = FlexAlignSelf.Stretch
    item.flexShrink = 0
    rows.push(item)
    const t = o.createComponent("Component.Text") as Text
    t.size = size
    t.depthTest = true
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Wrap
    t.verticalOverflow = VerticalOverflow.Shrink
    t.layoutRect = Rect.create(-w / 2, w / 2, -h / 2, h / 2)
    t.textFill.color = new vec4(1, 1, 1, 1)
    return t
  }
}
