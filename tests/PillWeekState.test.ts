// Run: node tests/PillWeekState.test.ts  (Node >= 22.18 strips TS types natively)
import assert from "node:assert/strict"
import {PillWeekState, REGIMEN, WEEK_KEYS} from "../Assets/Scripts/PillWeekState.ts"

const s = new PillWeekState()
const lit = () => WEEK_KEYS.filter((k) => s.cell(k).kind === "lit")

// before the box is found, pinches do nothing
assert.equal(s.pinchCell("Mon_AM"), "ignored")
assert.deepEqual(lit(), []) // nothing lit until "The box is here"
s.markBoxFound()

// 1. Losartan, 7 mornings lit
assert.equal(s.cardTitle, "Losartan 50 mg")
assert.equal(s.cardProgress, "Medicine 1 of 4")
assert.equal(s.cardCounter, "0 of 7 placed")
assert.deepEqual(lit(), WEEK_KEYS.filter((k) => k.endsWith("_AM")))
assert.equal(s.nextKey(), "Mon_AM")

// 2. check / uncheck
assert.equal(s.pinchCell("Mon_AM"), "checked")
assert.equal(s.cardCounter, "1 of 7 placed")
assert.equal(s.pinchCell("Mon_AM"), "unchecked")
assert.equal(s.cardCounter, "0 of 7 placed")

// 3. wrong compartment
assert.equal(s.pinchCell("Mon_PM"), "wrong")
assert.equal(s.cell("Mon_PM").kind, "empty")
assert.equal(s.cardStatus, "Not here: Losartan goes in mornings only")

// 4. skip detection: Mon checked, Wed checked while Tue empty -> Tue amber
s.pinchCell("Mon_AM")
s.pinchCell("Wed_AM")
assert.equal(s.cell("Tue_AM").kind, "amber")
assert.equal(s.cardStatus, "Skipped: Tue AM")
s.pinchCell("Tue_AM")
assert.equal(s.cell("Tue_AM").kind, "checked")
assert.equal(s.cardStatus, "")

// 5. walk all four medicines, filling everything except Thu PM Metformin
const fill = (except = "") => s.medicine!.keys.forEach((k) => k !== except && s.cell(k).kind !== "checked" && s.pinchCell(k))
fill()
s.next()
assert.equal(lit().length, 14)
fill("Thu_PM")
s.next()
assert.deepEqual(lit(), ["Mon_PM", "Wed_PM", "Fri_PM", "Sun_PM"])
assert.equal(s.cell("Thu_PM").kind, "amber") // past skip visible, not a Calcium cell
fill()
s.next()
assert.ok(s.isLastMedicine)
assert.deepEqual(lit(), ["Sun_AM"])
fill()
assert.equal(s.next(), true)

// 6. summary with one skip
assert.equal(s.summaryText, "Morning 15 of 15 · Evening 10 of 11 · 1 skipped")
assert.equal(s.skipListText, "1 skipped: Thu PM Metformin")
assert.equal(s.cell("Thu_PM").kind, "amber")
assert.deepEqual(s.cell("Sun_AM").dots, [0, 1, 3])

// reset + clean run -> 0 skipped
s.reset()
assert.equal(s.medicineIndex, 0)
for (let i = 0; i < REGIMEN.length; i++) {
  fill()
  s.next()
}
assert.equal(s.summaryText, "Morning 15 of 15 · Evening 11 of 11 · 0 skipped")
assert.equal(s.skipListText, "")
console.log("PillWeekState: all checks passed")
