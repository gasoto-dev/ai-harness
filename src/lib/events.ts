/**
 * The canonical event shape emitted by every agent run, in both replay and live
 * modes. A single shape lets one front-end render either source identically.
 *
 * See `docs/DESIGN.md` for the behavioral contract these events satisfy.
 */
export type AgentEvent = {
  /** Milliseconds from the start of the run. Used to pace replay. */
  ts: number
  /** Which agent produced the event. */
  agent: AgentKind
  /** Event kind, namespaced per agent (e.g. "task_added", "file_written", "screenshot", "pr_opened"). */
  type: string
  /** Arbitrary structured data for this event. Renderers read fields by event type. */
  payload: Record<string, unknown>
}

/** The four agents in the factory plus the orchestrating system. */
export type AgentKind = 'planner' | 'builder' | 'qa' | 'system'

const AGENT_KINDS: readonly AgentKind[] = ['planner', 'builder', 'qa', 'system']

/**
 * Runtime guard validating that an unknown value is a well-formed {@link AgentEvent}.
 * Used to validate recordings loaded from disk and any data crossing the wire.
 */
export const isAgentEvent = (value: unknown): value is AgentEvent => {
  if (typeof value !== 'object' || value === null) return false
  const e = value as Record<string, unknown>
  return (
    typeof e.ts === 'number' &&
    typeof e.agent === 'string' &&
    (AGENT_KINDS as readonly string[]).includes(e.agent) &&
    typeof e.type === 'string' &&
    typeof e.payload === 'object' &&
    e.payload !== null &&
    !Array.isArray(e.payload)
  )
}
