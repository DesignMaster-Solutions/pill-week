// PillWeekButton: one UIKit RectangleButton with a light label, placed by its authored SceneObject
// (BoxHereButton / NextButton / StartOverButton). Emits onPressed; setLabel() lets the controller
// switch "Next medicine" to "Finish". Holds no state.
import Event, {PublicApi} from "InteractionKit.lspkg/Utils/Event"
import {RectangleButton} from "UIKit.lspkg/Scripts/Components/Button/RectangleButton"

const BUTTON_LABEL_Z = 0.08

@component
export class PillWeekButton extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">PillWeekButton: table-edge button</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Button label")
  label: string = "Next medicine"

  @input
  @hint("Button width in cm")
  @widget(new SliderWidget(6, 24, 0.5))
  widthCm: number = 12

  @input
  @hint("Button height in cm")
  @widget(new SliderWidget(3, 10, 0.5))
  heightCm: number = 6

  @input
  @hint("Label text size (Lens Text size; ~44 per 1 cm em height)")
  @widget(new SliderWidget(30, 100, 1))
  labelSize: number = 72
  @ui.group_end

  private text!: Text
  private _onPressed = new Event<void>()

  get onPressed(): PublicApi<void> {
    return this._onPressed.publicApi()
  }

  onAwake(): void {
    this.sceneObject.createComponent("Component.Canvas")
    const btn = this.sceneObject.createComponent(RectangleButton.getTypeName()) as RectangleButton
    btn.size = new vec3(this.widthCm, this.heightCm, 1)
    btn.onTriggerUp.add(() => this._onPressed.invoke())

    const so = global.scene.createSceneObject("Label")
    so.setParent(this.sceneObject)
    so.getTransform().setLocalPosition(new vec3(0, 0, 0.5 + BUTTON_LABEL_Z))
    this.text = so.createComponent("Component.Text") as Text
    this.text.size = this.labelSize
    this.text.depthTest = true
    this.text.horizontalAlignment = HorizontalAlignment.Center
    this.text.verticalAlignment = VerticalAlignment.Center
    this.text.horizontalOverflow = HorizontalOverflow.Shrink
    this.text.layoutRect = Rect.create(-this.widthCm / 2 + 0.3, this.widthCm / 2 - 0.3, -this.heightCm / 2, this.heightCm / 2)
    this.text.textFill.color = new vec4(1, 1, 1, 1)
    this.text.text = this.label
  }

  get labelText(): string {
    return this.text ? this.text.text : this.label
  }

  setLabel(value: string): void {
    this.label = value
    if (this.text) this.text.text = value
  }

  setVisible(on: boolean): void {
    this.sceneObject.enabled = on
  }
}
