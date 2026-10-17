/** @jsxImportSource @opentui/solid */
import { InputRenderable } from "@opentui/core"
import { testRender } from "@opentui/solid"
import { expect, test } from "bun:test"
import { onMount } from "solid-js"
import { DialogThemeList } from "../../src/component/dialog-theme-list"
import { ConfigProvider } from "../../src/config"
import { Keymap } from "../../src/context/keymap"
import { ThemeProvider, useThemes } from "../../src/context/theme"
import { DialogProvider, useDialog } from "../../src/ui/dialog"
import { ToastProvider } from "../../src/ui/toast"
import { emptyThemeSource, tmpdir } from "../fixture/fixture"
import { TestTuiContexts } from "../fixture/tui-environment"
import { createTuiResolvedConfig } from "../fixture/tui-runtime"

// The backdrop only tints the probe, so the frame still reads it while the dialog is open.
function Status() {
  const themes = useThemes()
  return <text>{`${themes.mode()}:${themes.selected}`}</text>
}

function Open() {
  const dialog = useDialog()
  onMount(() => dialog.replace(() => <DialogThemeList />))
  return null
}

async function renderDialog(path: string) {
  const app = await testRender(
    () => (
      <TestTuiContexts directory={path} paths={{ state: path }}>
        <ConfigProvider config={createTuiResolvedConfig()}>
          <ThemeProvider mode="dark" source={emptyThemeSource}>
            <Keymap.Provider>
              <ToastProvider>
                <DialogProvider>
                  <Status />
                  <Open />
                </DialogProvider>
              </ToastProvider>
            </Keymap.Provider>
          </ThemeProvider>
        </ConfigProvider>
      </TestTuiContexts>
    ),
    { width: 70, height: 34, kittyKeyboard: true },
  )
  app.renderer.start()
  await app.waitForFrame((frame) => frame.includes("Theme mode") && frame.includes("ivys"))
  // DialogSelect focuses its filter on a timer; keys sent before that are lost.
  await app.waitForFrame(() => app.renderer.currentFocusedRenderable instanceof InputRenderable)
  return app
}

test("groups modes, the IvysCode theme and other themes, and switches mode", async () => {
  await using temporary = await tmpdir()
  const app = await renderDialog(temporary.path)

  try {
    const frame = app.captureCharFrame()
    expect(frame).toContain("Dark mode ✓")
    expect(frame).toContain("Light mode")
    expect(frame).not.toContain("Light mode ✓")
    expect(frame).toContain("ivys")
    expect(frame).toContain("Other themes")
    expect(frame).toContain("aura")

    // The selected theme is the initial row; the mode rows sit above it.
    app.mockInput.pressArrow("up")
    app.mockInput.pressEnter()
    await app.waitForFrame((frame) => frame.includes("light:opencode"))
    expect(app.captureCharFrame()).not.toContain("Search")
  } finally {
    app.renderer.destroy()
  }
})

test("previews a theme on move and restores it on escape", async () => {
  await using temporary = await tmpdir()
  const app = await renderDialog(temporary.path)

  try {
    app.mockInput.pressArrow("down")
    await app.waitForFrame((frame) => frame.includes("dark:aura"))

    app.mockInput.pressEscape()
    await app.waitForFrame((frame) => frame.includes("dark:opencode"))
    expect(app.captureCharFrame()).not.toContain("Search")
  } finally {
    app.renderer.destroy()
  }
})
