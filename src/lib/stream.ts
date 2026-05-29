import type { AgentEvent } from './events'

/**
 * Maximum delay (ms) inserted between two consecutive replayed events.
 * Caps long gaps in a recording so the demo never appears to stall
 * (DESIGN.md → "Replay timing feels live").
 */
export const MAX_GAP_MS = 2000

/**
 * Serialize an event as a Server-Sent Events `data:` frame, terminated by the
 * required blank line.
 */
export const sseFormat = (event: AgentEvent): string =>
  `data: ${JSON.stringify(event)}\n\n`

/**
 * Compute how long to wait before emitting `current`, based on the timestamp
 * gap from the `previous` event. Returns 0 for the first event, clamps negative
 * gaps to 0, and caps large gaps at {@link MAX_GAP_MS}.
 */
export const replayDelay = (
  previous: AgentEvent | null,
  current: AgentEvent,
): number => {
  if (!previous) return 0
  const gap = current.ts - previous.ts
  if (gap <= 0) return 0
  return Math.min(gap, MAX_GAP_MS)
}
