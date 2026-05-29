import { describe, it, expect } from 'vitest'
import { loadRecording, listRecordings, RecordingNotFoundError } from './recordings'
import { isAgentEvent } from './events'

describe('loadRecording', () => {
  it('loads the dark-mode-toggle recording', () => {
    const events = loadRecording('dark-mode-toggle')
    expect(events.length).toBeGreaterThan(0)
  })

  it('returns only well-formed AgentEvents', () => {
    const events = loadRecording('dark-mode-toggle')
    expect(events.every(isAgentEvent)).toBe(true)
  })

  it('events are in non-decreasing timestamp order', () => {
    const events = loadRecording('dark-mode-toggle')
    for (let i = 1; i < events.length; i++) {
      expect(events[i].ts).toBeGreaterThanOrEqual(events[i - 1].ts)
    }
  })

  it('ends with a system run_complete after a pr_opened', () => {
    const events = loadRecording('dark-mode-toggle')
    const types = events.map((e) => `${e.agent}/${e.type}`)
    expect(types).toContain('system/pr_opened')
    expect(types.at(-1)).toBe('system/run_complete')
  })

  it('throws RecordingNotFoundError for an unknown recording', () => {
    expect(() => loadRecording('does-not-exist')).toThrow(RecordingNotFoundError)
  })

  it('rejects a traversal-style id', () => {
    expect(() => loadRecording('../../etc/passwd')).toThrow(RecordingNotFoundError)
  })
})

describe('listRecordings', () => {
  it('includes the dark-mode-toggle recording id', () => {
    expect(listRecordings()).toContain('dark-mode-toggle')
  })
})
