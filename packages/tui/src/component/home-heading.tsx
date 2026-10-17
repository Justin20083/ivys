import { TextAttributes } from "@opentui/core"
import { useTerminalDimensions } from "@opentui/solid"
import { useTheme } from "../context/theme"
import { useLocation } from "../context/location"
import { useTuiApp, useTuiPaths } from "../context/runtime"
import { abbreviateHome } from "../util/path-format"
import { userName } from "../greeting"
import { Greeting } from "./greeting"

// Above the prompt: the launch greeting until a provider is connected, then the
// app identity for every later launch.
export function HomeHeading(props: { connected: boolean }) {
  const dimensions = useTerminalDimensions()
  if (dimensions().height < 12) return <box />
  return props.connected ? <Identity /> : <Greeting />
}

// Painted with the plain text ramp so it stays monochrome on every theme.
function Identity() {
  const theme = useTheme()
  const app = useTuiApp()
  const paths = useTuiPaths()
  const location = useLocation()
  const dimensions = useTerminalDimensions()
  // The home container pads one column per side when the terminal is narrow.
  const width = () => Math.max(2, dimensions().width - (dimensions().width < 44 ? 2 : 4))
  const directory = () => abbreviateHome(location.ref?.directory ?? paths.cwd, paths.home)
  // Keep the tail: the project directory matters more than the root of the path.
  const clip = (value: string) => (value.length <= width() ? value : `…${value.slice(1 - width())}`)
  const title = () => {
    const full = `IvysCode (${app.version})`
    if (full.length <= width()) return full
    if ("IvysCode".length <= width()) return "IvysCode"
    return "Ivys"
  }

  return (
    <box width="100%" alignItems="flex-start">
      <text fg={theme.text.base} attributes={TextAttributes.BOLD} selectable={false}>
        {title()}
      </text>
      <box height={1} />
      <text fg={theme.text.muted} selectable={false}>
        {clip(userName)}
      </text>
      <text fg={theme.text.muted} selectable={false}>
        {clip(directory())}
      </text>
    </box>
  )
}
