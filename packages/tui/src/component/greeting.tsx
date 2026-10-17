import { TextAttributes } from "@opentui/core"
import { For, type JSX } from "solid-js"
import { useTerminalDimensions } from "@opentui/solid"
import { useTheme } from "../context/theme"
import { tint } from "../theme/color"
import { art, artWidth, computerName, greeting } from "../greeting"

// The home greeting: the block greeting picked for this launch over the name of
// the machine, painted with the plain text ramp only so it stays monochrome.
export function Greeting() {
  const theme = useTheme()
  const dimensions = useTerminalDimensions()
  const fits = () => dimensions().width - 4 >= artWidth(greeting)

  const renderLine = (line: string): JSX.Element[] => {
    const shadow = tint(theme.background.base, theme.text.base, 0.25)
    const attrs = TextAttributes.BOLD
    return Array.from(line).map((char) => {
      if (char === "_") {
        return (
          <text fg={theme.text.base} bg={shadow} attributes={attrs} selectable={false}>
            {" "}
          </text>
        )
      }
      if (char === "~") {
        return (
          <text fg={shadow} attributes={attrs} selectable={false}>
            ▀
          </text>
        )
      }
      return (
        <text fg={theme.text.base} attributes={attrs} selectable={false}>
          {char}
        </text>
      )
    })
  }

  if (dimensions().height < 12) return <box />

  return (
    <box alignItems="center">
      {fits() ? (
        <For each={art(greeting)}>{(line) => <box flexDirection="row">{renderLine(line)}</box>}</For>
      ) : (
        <text fg={theme.text.base} attributes={TextAttributes.BOLD} selectable={false}>
          {greeting}
        </text>
      )}
      {dimensions().height < 15 ? null : (
        <>
          <box height={1} />
          <text fg={theme.text.muted} selectable={false}>
            {computerName}
          </text>
        </>
      )}
    </box>
  )
}
