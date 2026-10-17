/** @jsxImportSource @opentui/solid */
import { testRender } from "@opentui/solid"
import { expect, test } from "bun:test"
import type { HueScale } from "@opencode/theme/tui"
import { Logo } from "../../src/component/logo"
import { ConfigProvider } from "../../src/config"
import { ThemeProvider, useTheme } from "../../src/context/theme"
import { emptyThemeSource } from "../fixture/fixture"
import { createTuiResolvedConfig } from "../fixture/tui-runtime"

test("paints the left half of the wordmark with the IvysCode blue ramp", async () => {
  let theme: ReturnType<typeof useTheme> | undefined

  function Probe() {
    theme = useTheme()
    return <Logo />
  }

  const app = await testRender(
    () => (
      <ConfigProvider config={createTuiResolvedConfig()}>
        <ThemeProvider mode="dark" source={emptyThemeSource}>
          <Probe />
        </ThemeProvider>
      </ConfigProvider>
    ),
    { width: 60, height: 12 },
  )
  app.renderer.start()

  try {
    await app.waitForFrame((frame) => frame.includes("█"))
    if (!theme) throw new Error("Theme provider is not mounted")
    const blue = (theme.hue as Readonly<Record<string, HueScale>>).blue
    if (!blue) throw new Error("The default theme is missing its blue hue")
    const blocks = app
      .captureSpans()
      .lines.flatMap((line) => line.spans)
      .filter((span) => span.text.includes("█"))

    expect(blocks[0]?.fg.toInts()).toEqual(blue[300].toInts())
    expect(blocks.some((span) => span.fg.toInts().join() === theme!.text.base.toInts().join())).toBe(true)
  } finally {
    app.renderer.destroy()
  }
})
