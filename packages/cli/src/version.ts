import { Option, Schema } from "effect"
import pkg from "../package.json"

declare const OPENCODE_VERSION: string
declare const OPENCODE_CHANNEL: string
declare const OPENCODE_ARTIFACT: string
declare const OPENCODE_RELEASE_HIGHLIGHTS: string

const version = typeof OPENCODE_VERSION === "string" ? OPENCODE_VERSION : "local"
const channel = typeof OPENCODE_CHANNEL === "string" ? OPENCODE_CHANNEL : "local"
const artifact = typeof OPENCODE_ARTIFACT === "string" ? OPENCODE_ARTIFACT : "cli"
// Ivys keeps its own identity on this machine, but OpenCode's services (free tier models, the
// model catalog, the Console) only serve clients that identify as a release build. Any build
// that is not a released channel introduces itself as the release this fork tracks, so the
// channel stays local for the updater, logging and web assets.
const released = channel === "prod" || channel === "beta"
const serviceVersion = released ? version : pkg.version
const serviceChannel = released ? channel : "prod"
// Stable release builds embed the release notes' Highlights; every other build has none.
const highlights =
  typeof OPENCODE_RELEASE_HIGHLIGHTS === "string"
    ? Option.getOrElse(
        Schema.decodeUnknownOption(
          Schema.fromJsonString(Schema.Array(Schema.Struct({ title: Schema.String, body: Schema.String }))),
        )(OPENCODE_RELEASE_HIGHLIGHTS),
        () => [],
      )
    : []

export {
  serviceVersion as OPENCODE_VERSION,
  channel as OPENCODE_CHANNEL,
  artifact as OPENCODE_ARTIFACT,
  highlights as OPENCODE_HIGHLIGHTS,
  serviceChannel as OPENCODE_SERVICE_CHANNEL,
}
export const OPENCODE_LOCAL = channel === "local"
