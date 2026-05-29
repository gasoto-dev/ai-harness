import { describe, it, expect } from 'vitest'
import { sseFormat, replayDelay, MAX_GAP_MS } from './stream'
import type { AgentEvent } from './events'

const ev = (ts: number): AgentEvent => ({ ts, agent: 'system', type: 'x', payload: {} })

describe('sseFormat', () => {
  it('formats an event as an SSE data frame ending in a blank line', () => {
    const e = ev(5)
    const out = sseFormat(e)
    expect(out.startsWith('data: ')).toBe(true)
    expect(out.endsWith('\n\n')).toBe(true)
    expect(JSON.parse(out.slice('data: '.length).trim())).toEqual(e)
  })
})

describe('replayDelay', () => {
  it('returns the timestamp difference between consecutive events', () => {
    expect(replayDelay(ev(1000), ev(1400))).toBe(400)
  })

  it('caps the gap at MAX_GAP_MS so the demo never stalls', () => {
    expect(replayDelay(ev(0), ev(60000))).toBe(MAX_GAP_MS)
  })

  it('returns 0 for the first event (no previous)', () => {
    expect(replayDelay(null, ev(500))).toBe(0)
  })

  it('never returns a negative delay', () => {
    expect(replayDelay(ev(500), ev(100))).toBe(0)
  })
})
