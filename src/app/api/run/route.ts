import { loadRecording, RecordingNotFoundError } from '@/lib/recordings'
import { resolveMode, type RunMode } from '@/lib/auth'
import { sseFormat, replayDelay } from '@/lib/stream'
import type { AgentEvent } from '@/lib/events'

// Route Handlers must not be cached for streaming (DESIGN.md → real-time stream).
export const dynamic = 'force-dynamic'

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
}

/** Sleep helper; overridable in tests via the `delayMs` hook below. */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Build a ReadableStream that emits each event as an SSE frame, paced by
 * {@link replayDelay}. In tests, `realtime=false` collapses all delays to 0 so
 * the full stream resolves instantly.
 */
const buildStream = (events: AgentEvent[], realtime: boolean): ReadableStream => {
  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      let prev: AgentEvent | null = null
      for (const event of events) {
        if (realtime) {
          const wait = replayDelay(prev, event)
          if (wait > 0) await sleep(wait)
        }
        controller.enqueue(encoder.encode(sseFormat(event)))
        prev = event
      }
      controller.close()
    },
  })
}

/**
 * GET /api/run?recording=<id>&mode=<replay|live>
 *
 * Streams a factory run as Server-Sent Events. Public requests always resolve to
 * replay (see {@link resolveMode}). Unknown recordings return 404.
 *
 * Behavior contract: docs/DESIGN.md → "Run a recorded factory pass".
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const recordingId = url.searchParams.get('recording') ?? 'dark-mode-toggle'
  const requestedMode = (url.searchParams.get('mode') as RunMode) ?? 'replay'

  // Enforce the safety boundary. (Live production path lands in Phase G; for now
  // both modes stream the recording, but the gate is real.)
  const mode = resolveMode(requestedMode, request.headers)
  void mode

  let events: AgentEvent[]
  try {
    events = loadRecording(recordingId)
  } catch (err) {
    if (err instanceof RecordingNotFoundError) {
      return new Response(JSON.stringify({ error: 'recording_not_found', id: recordingId }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    throw err
  }

  // Realtime pacing in production; instant in tests (NODE_ENV === 'test').
  const realtime = process.env.NODE_ENV !== 'test'
  return new Response(buildStream(events, realtime), { headers: SSE_HEADERS })
}
