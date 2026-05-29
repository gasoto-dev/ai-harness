import { describe, it, expect } from 'vitest'
import { GET } from './route'

const readStream = async (res: Response): Promise<string> => {
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let out = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    out += decoder.decode(value)
  }
  return out
}

describe('GET /api/run', () => {
  it('streams SSE with the correct content type', async () => {
    const req = new Request('http://localhost/api/run?recording=dark-mode-toggle')
    const res = await GET(req)
    expect(res.headers.get('content-type')).toContain('text/event-stream')
  })

  it('streams every event of the recording as a data frame', async () => {
    const req = new Request('http://localhost/api/run?recording=dark-mode-toggle')
    const res = await GET(req)
    const body = await readStream(res)
    const frames = body.split('\n\n').filter((f) => f.startsWith('data: '))
    // dark-mode-toggle has 17 events
    expect(frames.length).toBe(17)
    const first = JSON.parse(frames[0].slice('data: '.length))
    expect(first.agent).toBe('system')
    expect(first.type).toBe('run_started')
  })

  it('returns 404 for an unknown recording', async () => {
    const req = new Request('http://localhost/api/run?recording=nope')
    const res = await GET(req)
    expect(res.status).toBe(404)
  })

  it('defaults to the dark-mode-toggle recording when none specified', async () => {
    const req = new Request('http://localhost/api/run')
    const res = await GET(req)
    expect(res.status).toBe(200)
  })
})
