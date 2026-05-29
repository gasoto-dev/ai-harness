import { describe, it, expect } from 'vitest'
import { isAgentEvent, type AgentEvent } from './events'

describe('isAgentEvent', () => {
  it('accepts a well-formed event', () => {
    const e: AgentEvent = {
      ts: 1,
      agent: 'planner',
      type: 'task_added',
      payload: { title: 'Add dark mode toggle' },
    }
    expect(isAgentEvent(e)).toBe(true)
  })

  it('accepts all four agent kinds', () => {
    for (const agent of ['planner', 'builder', 'qa', 'system'] as const) {
      expect(isAgentEvent({ ts: 0, agent, type: 'x', payload: {} })).toBe(true)
    }
  })

  it('rejects an unknown agent', () => {
    expect(isAgentEvent({ ts: 1, agent: 'hacker', type: 'x', payload: {} })).toBe(false)
  })

  it('rejects a missing agent', () => {
    expect(isAgentEvent({ ts: 1, type: 'task_added', payload: {} })).toBe(false)
  })

  it('rejects a non-numeric ts', () => {
    expect(isAgentEvent({ ts: 'soon', agent: 'planner', type: 'x', payload: {} })).toBe(false)
  })

  it('rejects a missing type', () => {
    expect(isAgentEvent({ ts: 1, agent: 'planner', payload: {} })).toBe(false)
  })

  it('rejects a non-object payload', () => {
    expect(isAgentEvent({ ts: 1, agent: 'planner', type: 'x', payload: 'nope' })).toBe(false)
  })

  it('rejects null and non-objects', () => {
    expect(isAgentEvent(null)).toBe(false)
    expect(isAgentEvent(42)).toBe(false)
    expect(isAgentEvent('event')).toBe(false)
  })
})
