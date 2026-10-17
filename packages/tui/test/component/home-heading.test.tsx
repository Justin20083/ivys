/** @jsxImportSource @opentui/solid */
import { expect, test } from "bun:test"
import { HomeHeading } from "../../src/component/home-heading"
import { TuiAppProvider } from "../../src/context/runtime"
import { computerName, userName } from "../../src/greeting"
import { renderLocal } from "../fixture/local"

test("shows the app identity once a provider is connected", async () => {
  await using app = await renderLocal({
    children: () => (
      <TuiAppProvider value={{ name: "test", version: "2.0.30", channel: "test" }}>
        <HomeHeading connected />
      </TuiAppProvider>
    ),
  })

  await app.waitForFrame((frame) => frame.includes("IvysCode (2.0.30)"), { maxPasses: 100 })
  const frame = app.captureCharFrame()
  expect(frame).toContain(userName)
  expect(frame).toContain("/tmp/opencode/packages/tui")
})

test("keeps the launch greeting until a provider is connected", async () => {
  await using app = await renderLocal({ children: () => <HomeHeading connected={false} /> })

  await app.waitForFrame((frame) => frame.includes(computerName), { maxPasses: 100 })
  expect(app.captureCharFrame()).not.toContain("IvysCode")
})
