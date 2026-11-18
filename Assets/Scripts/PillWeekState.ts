// PillWeekState — pure logic for Pill Week. Owns the sample regimen, what is placed where,
// skipped detection, and every card/summary string. No scene access, no Lens globals,
// so tests/PillWeekState.test.ts runs it under plain Node.
// Must not: touch SceneObjects, play audio, or know about SIK.

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
export const SLOTS = ["AM", "PM"]

/** Week order: Mon AM, Mon PM, Tue AM, ... Sun PM (chronological). */
export const WEEK_KEYS: string[] = DAYS.flatMap((d) => SLOTS.map((s) => `${d}_${s}`))

export interface Medicine {
  name: string // "Losartan 50 mg"
  short: string // used in the skip list: "Thu PM Metformin"
  schedule: string // "every morning"
  notHere: string // wrong-compartment message
  tint: [number, number, number] // light tint, additive-display friendly
  keys: string[] // compartments where it goes
}

const every = (slot: string) => DAYS.map((d) => `${d}_${slot}`)

// Hard-coded SAMPLE regimen from devpost/design-brief.md. Not medical advice.
export const REGIMEN: Medicine[] = [
  {
    name: "Losartan 50 mg",
    short: "Losartan",
    schedule: "every morning",
    notHere: "Not here: Losartan goes in mornings only",
    tint: [0.55, 0.85, 1.0],
    keys: every("AM"),
  },
  {
    name: "Metformin 500 mg",
    short: "Metformin",
    schedule: "morning and evening",
    notHere: "Not here: Metformin goes in mornings and evenings only",
    tint: [1.0, 0.75, 0.95],
    keys: WEEK_KEYS.slice(),
  },
  {
    name: "Calcium 600 mg + vitamin D",
    short: "Calcium",
    schedule: "every other day, evening: Mon, Wed, Fri, Sun",
    notHere: "Not here: Calcium goes in Mon, Wed, Fri, Sun evenings only",
    tint: [0.6, 1.0, 0.7],
    keys: ["Mon_PM", "Wed_PM", "Fri_PM", "Sun_PM"],
  },
  {
    name: "Vitamin B12 1000 mcg",
    short: "Vitamin B12",
    schedule: "Sunday morning only",
    notHere: "Not here: Vitamin B12 goes in Sunday morning only",
    tint: [1.0, 0.95, 0.55],
    keys: ["Sun_AM"],
  },
]

export type CellKind = "empty" | "lit" | "checked" | "amber"

export interface CellView {
  kind: CellKind
  next: boolean // the earliest unfilled lit compartment (pulses)
  dots: number[] // medicine indices placed here, in placement order
}

const order = (k: string) => WEEK_KEYS.indexOf(k)
const label = (k: string) => k.replace("_", " ") // "Thu_PM" -> "Thu PM"

export class PillWeekState {
  boxFound = false
  medicineIndex = 0
  finished = false
  /** key -> medicine indices placed there */
  private placed: Map<string, number[]> = new Map()
  /** skips frozen when "Next medicine"/"Finish" was pinched with lit cells still empty */
  private frozenSkips: {key: string; med: number}[] = []
  /** last wrong-compartment message, cleared by the next valid action */
  warning = ""

  private regimen: Medicine[]

  constructor(regimen: Medicine[] = REGIMEN) {
    this.regimen = regimen
    this.reset()
  }

  reset(): void {
    this.medicineIndex = 0
    this.finished = false
    this.placed = new Map(WEEK_KEYS.map((k) => [k, []]))
    this.frozenSkips = []
    this.warning = ""
  }

  get medicine(): Medicine | null {
    return this.finished ? null : this.regimen[this.medicineIndex]
  }

  get medicineCount(): number {
    return this.regimen.length
  }

  get targetCount(): number {
    return this.medicine ? this.medicine.keys.length : 0
  }

  get placedCount(): number {
    const m = this.medicine
    return m ? m.keys.filter((k) => this.has(k, this.medicineIndex)).length : 0
  }

  get isLastMedicine(): boolean {
    return this.medicineIndex === this.regimen.length - 1
  }

  private has(key: string, med: number): boolean {
    return (this.placed.get(key) ?? []).indexOf(med) >= 0
  }

  /** Current medicine's lit cells that are empty while a later one is checked. */
  private liveSkips(): string[] {
    const m = this.medicine
    if (!m) return []
    const checked = m.keys.filter((k) => this.has(k, this.medicineIndex)).map(order)
    if (checked.length === 0) return []
    const latest = Math.max(...checked)
    return m.keys.filter((k) => !this.has(k, this.medicineIndex) && order(k) < latest)
  }

  // ---- handlers (the only mutators; SIK pinches call these via the controller) ----

  markBoxFound(): void {
    this.boxFound = true
  }

  /** Returns "checked" | "unchecked" | "wrong" | "ignored". */
  pinchCell(key: string): "checked" | "unchecked" | "wrong" | "ignored" {
    const m = this.medicine
    if (!this.boxFound || !m || order(key) < 0) return "ignored"
    if (m.keys.indexOf(key) < 0) {
      this.warning = m.notHere
      return "wrong"
    }
    this.warning = ""
    const list = this.placed.get(key)!
    const i = list.indexOf(this.medicineIndex)
    if (i >= 0) {
      list.splice(i, 1)
      return "unchecked"
    }
    list.push(this.medicineIndex)
    return "checked"
  }

  /** "Next medicine" / "Finish". Empty lit cells are frozen as skipped. Returns true when this finished the week. */
  next(): boolean {
    const m = this.medicine
    if (!this.boxFound || !m) return false
    for (const k of m.keys) if (!this.has(k, this.medicineIndex)) this.frozenSkips.push({key: k, med: this.medicineIndex})
    this.warning = ""
    if (this.isLastMedicine) {
      this.finished = true
      return true
    }
    this.medicineIndex++
    return false
  }

  // ---- views ----

  cell(key: string): CellView {
    const dots = (this.placed.get(key) ?? []).slice()
    const m = this.medicine
    const isTarget = this.boxFound && !!m && m.keys.indexOf(key) >= 0
    // A past medicine's skip stays amber unless the current medicine needs this cell (then lit/checked wins).
    const amber = this.liveSkips().indexOf(key) >= 0 || (!isTarget && this.frozenSkips.some((s) => s.key === key))
    let kind: CellKind = "empty"
    if (amber) kind = "amber"
    else if (isTarget) kind = this.has(key, this.medicineIndex) ? "checked" : "lit"
    return {kind, dots, next: this.boxFound && key === this.nextKey()}
  }

  /** Earliest unfilled lit compartment in week order, or "" if none. */
  nextKey(): string {
    const m = this.medicine
    if (!m) return ""
    const open = m.keys.filter((k) => !this.has(k, this.medicineIndex)).sort((a, b) => order(a) - order(b))
    return open.length ? open[0] : ""
  }

  get cardTitle(): string {
    return this.finished ? "Week filled" : this.medicine!.name
  }

  get cardSchedule(): string {
    return this.finished ? this.summaryText : this.medicine!.schedule
  }

  get cardProgress(): string {
    return this.finished ? "" : `Medicine ${this.medicineIndex + 1} of ${this.regimen.length}`
  }

  get cardCounter(): string {
    return this.finished ? "" : `${this.placedCount} of ${this.targetCount} placed`
  }

  get cardStatus(): string {
    if (this.finished) return this.skipListText
    if (this.warning) return this.warning
    const live = this.liveSkips()
    return live.length ? `Skipped: ${live.map(label).join(", ")}` : ""
  }

  get summaryText(): string {
    let am = 0,
      amTotal = 0,
      pm = 0,
      pmTotal = 0
    this.regimen.forEach((m, i) =>
      m.keys.forEach((k) => {
        const filled = this.has(k, i) ? 1 : 0
        if (k.endsWith("_AM")) {
          amTotal++
          am += filled
        } else {
          pmTotal++
          pm += filled
        }
      }),
    )
    return `Morning ${am} of ${amTotal} · Evening ${pm} of ${pmTotal} · ${this.frozenSkips.length} skipped`
  }

  /** "" when nothing skipped, else "1 skipped: Thu PM Metformin". */
  get skipListText(): string {
    const s = this.frozenSkips
      .slice()
      .sort((a, b) => order(a.key) - order(b.key) || a.med - b.med)
      .map((x) => `${label(x.key)} ${this.regimen[x.med].short}`)
    return s.length ? `${s.length} skipped: ${s.join(", ")}` : ""
  }
}
