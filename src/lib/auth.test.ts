import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resolveMode } from './auth'

describe('resolveMode', () => {
  const original = process.env.HARNESS_KEY

  beforeEach(() => {
    process.env.HARNESS_KEY = 'secret-key-123'
  })
  afterEach(() => {
    process.env.HARNESS_KEY = original
  })

  it('defaults to replay when no key header is present', () => {
    const headers = new Headers()
    expect(resolveMode('live', headers)).toBe('replay')
  })

  it('defaults to replay when the key is wrong', () => {
    const headers = new Headers({ 'x-harness-key': 'wrong' })
    expect(resolveMode('live', headers)).toBe('replay')
  })

  it('allows live only when the key matches AND live is requested', () => {
    const headers = new Headers({ 'x-harness-key': 'secret-key-123' })
    expect(resolveMode('live', headers)).toBe('live')
  })

  it('stays replay when key matches but replay was requested', () => {
    const headers = new Headers({ 'x-harness-key': 'secret-key-123' })
    expect(resolveMode('replay', headers)).toBe('replay')
  })

  it('never allows live when HARNESS_KEY is unset on the server', () => {
    delete process.env.HARNESS_KEY
    const headers = new Headers({ 'x-harness-key': 'anything' })
    expect(resolveMode('live', headers)).toBe('replay')
  })
})
