import { MouseEvent, RGBA } from "@opentui/core"
import { useTerminalDimensions } from "@opentui/solid"
import { createMemo, createSignal, onCleanup, Show } from "solid-js"

// Fixed brand colors: the mascot stays recognizable on light and dark themes,
// so it deliberately does not read from the theme tokens.
const BODY = RGBA.fromHex("#3D5BFD")
const SHOULDER = RGBA.fromHex("#2A3AD6")
const EYE = RGBA.fromHex("#FFFFFF")

const BLINK_MS = 140
const MIN_WIDTH = 40
const MIN_HEIGHT = 14

// Flat block art: a solid head with two square eyes over a wider shoulder
// band, drawn with full blocks only so the shape stays one solid color.
const HEAD = "  ██████████  "
const EYES_LEFT = "  ██"
const EYE_WIDTH = "██"
const EYE_GAP = "██"
const EYES_RIGHT = "██  "
const SHOULDER_LEFT = "██"
const SHOULDER_MIDDLE = "██████████"

export function Mascot() {
  const dimensions = useTerminalDimensions()
  const [blinking, setBlinking] = createSignal(false)
  let blinkTimer: ReturnType<typeof setTimeout> | undefined
  const visible = createMemo(() => dimensions().width >= MIN_WIDTH && dimensions().height >= MIN_HEIGHT)
  const blink = () => {
    if (blinkTimer) clearTimeout(blinkTimer)
    setBlinking(true)
    blinkTimer = setTimeout(() => {
      blinkTimer = undefined
      setBlinking(false)
    }, BLINK_MS)
  }

  onCleanup(() => {
    if (blinkTimer) clearTimeout(blinkTimer)
  })

  return (
    <Show when={visible()}>
      <box
        width="100%"
        height={4}
        flexDirection="column"
        alignItems="flex-end"
        paddingRight={4}
        flexShrink={0}
        onMouseUp={(event: MouseEvent) => {
          if (event.button !== 0) return
          blink()
        }}
      >
        <text fg={BODY} selectable={false} wrapMode="none">
          {HEAD}
        </text>
        <Show
          when={blinking()}
          fallback={
            <>
              <text fg={BODY} selectable={false} wrapMode="none">
                {EYES_LEFT}
                <span style={{ fg: EYE }}>{EYE_WIDTH}</span>
                {EYE_GAP}
                <span style={{ fg: EYE }}>{EYE_WIDTH}</span>
                {EYES_RIGHT}
              </text>
              <text fg={BODY} selectable={false} wrapMode="none">
                {EYES_LEFT}
                <span style={{ fg: EYE }}>{EYE_WIDTH}</span>
                {EYE_GAP}
                <span style={{ fg: EYE }}>{EYE_WIDTH}</span>
                {EYES_RIGHT}
              </text>
            </>
          }
        >
          <text fg={BODY} selectable={false} wrapMode="none">
            {HEAD}
          </text>
          <text fg={BODY} selectable={false} wrapMode="none">
            {HEAD}
          </text>
        </Show>
        <text selectable={false} wrapMode="none">
          <span style={{ fg: SHOULDER }}>{SHOULDER_LEFT}</span>
          <span style={{ fg: BODY }}>{SHOULDER_MIDDLE}</span>
          <span style={{ fg: SHOULDER }}>{SHOULDER_LEFT}</span>
        </text>
      </box>
    </Show>
  )
}
