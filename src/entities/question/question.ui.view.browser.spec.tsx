import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { QuestionView } from './question.ui.view'

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

describe('QuestionView', () => {
  it('shows the question text without an image', async () => {
    const screen = await render(<QuestionView text="2+2?" img={null} />)

    await expect.element(screen.getByText('2+2?')).toBeVisible()
    await expect.element(screen.getByRole('img')).not.toBeInTheDocument()
  })

  it('shows the illustration once it has loaded', async () => {
    const screen = await render(<QuestionView text="Whose flag?" img={PIXEL} />)

    await expect
      .element(
        screen.getByRole('img', {
          name: 'Image illustrating the question: Whose flag?',
        }),
      )
      .toBeVisible()
    await expect
      .element(screen.getByText('Image is loading...'))
      .not.toBeInTheDocument()
  })

  it('keeps the placeholder while the image is loading', async () => {
    const screen = await render(
      <QuestionView text="Slow" img="http://127.0.0.1:9/never-loads.png" />,
    )

    await expect.element(screen.getByText('Image is loading...')).toBeVisible()
  })
})
