// Burst capture of the Lens Studio Preview panel, run through the MCP ExecuteEditorCode tool.
// args: {action: "start", dir, everyMs?, seconds?} begins grabbing JPEG frames into dir (mkdir it
// first); {action: "stop"} ends it and returns the times.txt lines ("<file> <seconds since start>"),
// which the caller writes next to the frames. The frames are real panel grabs, nothing is
// interpolated; clips.py replays each one for its real interval.
const A = args as any
const g = globalThis as any

if (g.pillWeekCapture) {
  clearInterval(g.pillWeekCapture.timer)
  g.pillWeekCapture.done = true
}
if (A.action === "stop") {
  const c = g.pillWeekCapture
  return c ? {frames: c.count, error: c.error, times: c.lines.join("\n") + "\n"} : {frames: 0}
}

const dock = pluginSystem.findInterface(Editor.Dock.IDockManager) as any
const panel = dock.findPanel("Snap.Plugin.Gui.PreviewPanel").widget
const cap = {count: 0, t0: Date.now(), lines: [] as string[], timer: null as any, done: false, error: ""}
const until = cap.t0 + 1000 * (A.seconds || 90)
cap.timer = setInterval(() => {
  if (cap.done || Date.now() > until) {
    clearInterval(cap.timer)
    cap.done = true
    return
  }
  try {
    const name = `${String(cap.count).padStart(5, "0")}.jpg`
    const t = (Date.now() - cap.t0) / 1000
    panel.grab().save(new Editor.Path(`${A.dir}/${name}`), 90)
    cap.lines.push(`${name} ${t.toFixed(3)}`)
    cap.count++
  } catch (e) {
    cap.error = String(e)
  }
}, A.everyMs || 66)
g.pillWeekCapture = cap
return {started: A.dir}
