import { DialogSelect, type DialogSelectOption, type DialogSelectRef } from "../ui/dialog-select"
import { useThemes } from "../context/theme"
import { useDialog } from "../ui/dialog"
import { onCleanup } from "solid-js"

type ThemeListValue = { mode: "dark" | "light" } | { theme: string }

export function DialogThemeList() {
  const themes = useThemes()
  const dialog = useDialog()
  const initial = themes.selected
  const active = themes.mode()
  const options: DialogSelectOption<ThemeListValue>[] = [
    ...(["dark", "light"] as const).map((mode) => ({
      title: `${mode === "dark" ? "Dark" : "Light"} mode${mode === active ? " ✓" : ""}`,
      value: { mode },
      category: "Theme mode",
    })),
    { title: "ivys", value: { theme: "opencode" }, category: "IvysCode" },
    ...Object.keys(themes.all())
      .filter((name) => name !== "opencode")
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
      .map((name) => ({ title: name, value: { theme: name }, category: "Other themes" })),
  ]
  const current: ThemeListValue = { theme: initial }
  let confirmed = false
  let ref: DialogSelectRef<ThemeListValue>

  onCleanup(() => {
    if (!confirmed) themes.set(initial)
  })

  return (
    <DialogSelect
      title="Themes"
      options={options}
      current={current}
      onMove={(opt) => {
        if ("theme" in opt.value) themes.set(opt.value.theme)
      }}
      onSelect={(opt) => {
        if ("theme" in opt.value) themes.set(opt.value.theme)
        else themes.setMode(opt.value.mode)
        confirmed = true
        dialog.clear()
      }}
      ref={(r) => {
        ref = r
      }}
      onFilter={(query) => {
        if (query.length === 0) {
          themes.set(initial)
          return
        }

        const first = ref.filtered.find((option) => "theme" in option.value)
        if (first && "theme" in first.value) themes.set(first.value.theme)
      }}
    />
  )
}
