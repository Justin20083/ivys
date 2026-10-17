import { Plugin } from "@opencode/plugin/tui"
import { Show } from "solid-js"
import { useTerminalDimensions } from "@opentui/solid"
import { Slot } from "../../plugin/render"

function View() {
  const dimensions = useTerminalDimensions()

  return (
    <Show when={dimensions().height >= 14 && dimensions().width >= 44}>
      <box width="100%" paddingLeft={2} paddingRight={2} flexDirection="row" flexShrink={0} gap={2}>
        <Slot path="home.footer.status" />
      </box>
    </Show>
  )
}

export default Plugin.define({
  id: "opencode.home.footer",
  setup(context) {
    // Root takeover: an external plugin replacing home.footer wins (last-
    // enabled) and this builtin shows as suppressed, not silently gone.
    // Append keeps the path open to additive plugin claims; an external
    // replace still takes the boundary over.
    context.ui.slot({ append: "home.footer", render: () => <View /> })
  },
})
