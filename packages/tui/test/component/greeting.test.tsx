/** @jsxImportSource @opentui/solid */
import { testRender } from "@opentui/solid"
import { expect, test } from "bun:test"
import { Greeting } from "../../src/component/greeting"
import { ConfigProvider } from "../../src/config"
import { ThemeProvider, useTheme } from "../../src/context/theme"
import { art, computerName, greeting } from "../../src/greeting"
import { tint } from "../../src/theme/color"
import { emptyThemeSource } from "../fixture/fixture"
import { createTuiResolvedConfig } from "../fixture/tui-runtime"

test("greets the machine in block art painted with the plain text ramp", async () => {
  let theme: ReturnType<typeof useTheme> | undefined

  function Probe() {
    theme = useTheme()
    return <Greeting />
  }

  const app = await testRender(
    () => (
      <ConfigProvider config={createTuiResolvedConfig()}>
        <ThemeProvider mode="dark" source={emptyThemeSource}>
          <Probe />
        </ThemeProvider>
      </ConfigProvider>
    ),
    { width: 60, height: 16 },
  )
  app.renderer.start()

  try {
    await app.waitForFrame((frame) => frame.includes(computerName), { maxPasses: 100 })
    if (!theme) throw new Error("Theme provider is not mounted")
    const frame = app.captureCharFrame()
    const drawn = (line: string) => line.replaceAll("~", "▀").replaceAll("_", " ").trimEnd()
    for (const line of art(greeting)) expect(frame).toContain(drawn(line))

    const allowed = new Set([
      theme.text.base.toInts().join(),
      theme.text.muted.toInts().join(),
      tint(theme.background.base, theme.text.base, 0.25).toInts().join(),
    ])
    const spans = app
      .captureSpans()
      .lines.flatMap((line) => line.spans)
      .filter((span) => span.text.trim() !== "")
    expect(spans.length).toBeGreaterThan(0)
    for (const span of spans) expect(allowed.has(span.fg.toInts().join())).toBe(true)
  } finally {
    app.renderer.destroy()
  }
})
