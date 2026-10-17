/** @jsxImportSource @opentui/solid */
import { expect, test } from "bun:test"
import { DialogTextViewer } from "../../src/component/dialog-text-viewer"
import { renderLocal } from "../fixture/local"

const read = (body: string, status = 200) => (url: URL) =>
  url.pathname.startsWith("/api/fs/read") ? new Response(body, { status }) : undefined

test("renders Markdown files", async () => {
  await using app = await renderLocal({ fetch: read("# Plan\n\n- uno\n- dos\n") })
  app.dialog.replace(() => <DialogTextViewer path="PLAN.md" />)
  await Bun.sleep(1200)
  const frame = app.captureCharFrame()
  expect(frame).toContain("PLAN.md")
  expect(frame).toContain("Plan")
  expect(frame).toContain("uno")
})

test("renders non-Markdown files as plain text", async () => {
  await using app = await renderLocal({ fetch: read("hola mundo") })
  app.dialog.replace(() => <DialogTextViewer path="NOTES.txt" />)
  await Bun.sleep(600)
  expect(app.captureCharFrame()).toContain("hola mundo")
})

test("reports files that cannot be read", async () => {
  await using app = await renderLocal({ fetch: read("boom", 500) })
  app.dialog.replace(() => <DialogTextViewer path="missing.md" />)
  await Bun.sleep(600)
  expect(app.captureCharFrame()).toContain("Could not open")
})
