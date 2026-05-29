import fs from 'node:fs'
import path from 'node:path'
import { isAgentEvent, type AgentEvent } from './events'

/** Thrown when a requested recording id does not exist or is not a safe id. */
export class RecordingNotFoundError extends Error {
  constructor(id: string) {
    super(`Recording not found: ${id}`)
    this.name = 'RecordingNotFoundError'
  }
}

/** Absolute path to the directory holding recording JSON files. */
const RECORDINGS_DIR = path.join(process.cwd(), 'src', 'recordings')

/** A valid recording id: lowercase letters, digits, and hyphens only (no path separators). */
const VALID_ID = /^[a-z0-9-]+$/

/**
 * List the ids of all available recordings (filenames in the recordings dir,
 * minus the `.json` extension).
 */
export const listRecordings = (): string[] =>
  fs
    .readdirSync(RECORDINGS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))

/**
 * Load and validate a recording by id. Every entry is checked with
 * {@link isAgentEvent}; malformed entries are dropped so a bad event can never
 * crash a run. Throws {@link RecordingNotFoundError} for unknown or unsafe ids.
 */
export const loadRecording = (id: string): AgentEvent[] => {
  if (!VALID_ID.test(id)) throw new RecordingNotFoundError(id)

  const file = path.join(RECORDINGS_DIR, `${id}.json`)
  if (!fs.existsSync(file)) throw new RecordingNotFoundError(id)

  const raw: unknown = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (!Array.isArray(raw)) throw new RecordingNotFoundError(id)

  return raw.filter(isAgentEvent)
}
