/** The two run modes. Public traffic always resolves to `replay`. */
export type RunMode = 'replay' | 'live'

const HARNESS_KEY_HEADER = 'x-harness-key'

/**
 * Resolve the effective run mode, enforcing the DESIGN.md "Mode safety" boundary:
 * live execution requires BOTH an explicit `live` request AND a request header
 * matching the server's `HARNESS_KEY`. Anything else — missing key, wrong key,
 * or an unset server key — falls back to `replay`. Public input can never reach
 * live mode.
 */
export const resolveMode = (
  requested: RunMode,
  headers: Headers,
): RunMode => {
  if (requested !== 'live') return 'replay'

  const serverKey = process.env.HARNESS_KEY
  if (!serverKey) return 'replay'

  const provided = headers.get(HARNESS_KEY_HEADER)
  return provided === serverKey ? 'live' : 'replay'
}
