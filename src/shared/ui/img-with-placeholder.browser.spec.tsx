import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { ImgWithPlaceholder } from './img-with-placeholder'

const pixel = (color: string) => {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d')
  if (!context) throw new Error('no 2d canvas context')
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return canvas.toDataURL()
}

const NEVER_LOADS = 'http://127.0.0.1:9/never-loads.png'

describe('ImgWithPlaceholder', () => {
  it('shows a placeholder until the image has loaded', async () => {
    const screen = await render(<ImgWithPlaceholder alt="Pic" src={NEVER_LOADS} />)

    await expect.element(screen.getByText('Image is loading...')).toBeVisible()
    // The image is hidden from the accessibility tree until it has loaded
    await expect.element(screen.getByRole('img', { name: 'Pic' })).not.toBeInTheDocument()
  })

  it('shows the image once it has loaded', async () => {
    const screen = await render(<ImgWithPlaceholder alt="Pic" src={pixel('red')} />)

    await expect.element(screen.getByRole('img', { name: 'Pic' })).toBeVisible()
    await expect.element(screen.getByText('Image is loading...')).not.toBeInTheDocument()
  })

  it('shows the placeholder again for a new source and then the new image', async () => {
    const screen = await render(<ImgWithPlaceholder alt="Pic" src={pixel('red')} />)
    await expect.element(screen.getByRole('img', { name: 'Pic' })).toBeVisible()

    await screen.rerender(<ImgWithPlaceholder alt="Pic" src={NEVER_LOADS} />)
    await expect.element(screen.getByText('Image is loading...')).toBeVisible()

    await screen.rerender(<ImgWithPlaceholder alt="Pic" src={pixel('blue')} />)
    await expect.element(screen.getByRole('img', { name: 'Pic' })).toBeVisible()
  })

  it('shows an image that is mounted already loaded', async () => {
    const src = pixel('green')
    const preloaded = new Image()
    preloaded.src = src
    await preloaded.decode()

    const screen = await render(<ImgWithPlaceholder alt="Pic" src={src} />)

    await expect.element(screen.getByRole('img', { name: 'Pic' })).toBeVisible()
  })
})
