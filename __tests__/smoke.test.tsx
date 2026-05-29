import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../src/app/page'

test('home page renders', () => {
  render(<Home />)
  // The default create-next-app page contains an Image with alt text "Next.js logo".
  expect(screen.getByAltText('Next.js logo')).toBeInTheDocument()
})
