/** @jsxImportSource @opentui/solid */
import { type ScrollBoxRenderable } from "@opentui/core"
import { useTerminalDimensions } from "@opentui/solid"
import type { LocationRef } from "@opencode/client"
import path from "node:path"
import { createMemo, createResource, Show } from "solid-js"
import { useClient } from "../context/client"
import { Keymap } from "../context/keymap"
import { useLocation } from "../context/location"
import { usePathFormatter } from "../context/path-format"
import { useTheme, useThemes } from "../context/theme"
import { DialogFooter, DialogHeader, DialogLayout, useDialog } from "../ui/dialog"

const MARKDOWN_EXTENSIONS = new Set([".md", ".markdown", ".mdx"])

export function isMarkdownPath(file: string) {
  return MARKDOWN_EXTENSIONS.has(path.extname(file).toLowerCase())
}

/** Opens the read-only text viewer for a project file, rendering Markdown and showing other text as-is. */
export function useTextViewer() {
  const dialog = useDialog()
  const location = useLocation()
  const formatter = usePathFormatter()
  return (file: string) => {
    const base = location.current?.directory ?? formatter.path()
    // `fs.read` takes a path relative to the Location; Absolute inputs inside it are shown relative.
    const relative = base && (file === base || file.startsWith(`${base}/`)) ? file.slice(base.length + 1) : file
    dialog.replace(() => <DialogTextViewer path={relative} location={{ directory: base }} />)
  }
}

export function DialogTextViewer(props: { path: string; location?: LocationRef }) {
  const client = useClient()
  const dialog = useDialog()
  const theme = useTheme().surface("dialog")
  const dimensions = useTerminalDimensions()
  const syntax = useThemes().currentSyntax
  const [content] = createResource(
    () => props.path,
    (file) =>
      client.api.file
        .read({ path: file, location: props.location ? { directory: props.location.directory } : undefined })
        .then((bytes) => new TextDecoder().decode(bytes)),
  )
  const markdown = createMemo(() => isMarkdownPath(props.path))
  const name = createMemo(() => path.basename(props.path) || props.path)
  const height = () => Math.max(3, Math.floor(dimensions().height * 0.7) - 4)
  let scroll: ScrollBoxRenderable | undefined

  dialog.setSize("xlarge")
  dialog.setCentered(true)

  Keymap.createLayer(() => ({
    mode: "modal",
    commands: [
      { bind: "up", title: "Scroll up", group: "Text viewer", run: () => scroll?.scrollBy(-1) },
      { bind: "down", title: "Scroll down", group: "Text viewer", run: () => scroll?.scrollBy(1) },
      { bind: "pageup", title: "Page up", group: "Text viewer", run: () => scroll?.scrollBy(-height()) },
      { bind: "pagedown", title: "Page down", group: "Text viewer", run: () => scroll?.scrollBy(height()) },
      { bind: "home", title: "Top", group: "Text viewer", run: () => scroll?.scrollTo(0) },
      { bind: "end", title: "Bottom", group: "Text viewer", run: () => scroll?.scrollTo(Infinity) },
    ],
  }))

  return (
    <DialogLayout
      id="text-viewer"
      header={<DialogHeader title={name()} />}
      footer={
        <DialogFooter
          actions={[
            { title: "scroll", key: "↑/↓" },
            { title: "close", key: "esc" },
          ]}
        />
      }
    >
      <box gap={1}>
        <text fg={theme.text.muted} wrapMode="none" truncate>
          {props.path}
        </text>
        <Show
          when={!content.error}
          fallback={<text fg={theme.text.feedback.error.base}>Could not open {name()}</text>}
        >
          <scrollbox
            id="text-viewer-scroll"
            ref={(value: ScrollBoxRenderable) => (scroll = value)}
            height={height()}
            scrollbarOptions={{ visible: false }}
          >
            <Show when={content()} fallback={<text fg={theme.text.muted}>Loading…</text>}>
              {(value) =>
                markdown() ? (
                  <markdown content={value()} syntaxStyle={syntax()} width="100%" />
                ) : (
                  <text fg={theme.text.base} wrapMode="word">
                    {value()}
                  </text>
                )
              }
            </Show>
          </scrollbox>
        </Show>
      </box>
    </DialogLayout>
  )
}
