import type { Page } from '@playwright/test'
import { expect, test } from './support/fixtures'

const submitLogin = async (page: Page, name: string, password: string) => {
  const form = page.getByTestId('login-form')
  await form.getByTestId('login-name-input').fill(name)
  await form.getByTestId('login-password-input').fill(password)
  await form.getByTestId('login-submit-button').click()
}

test.describe('authorisation', () => {
  test('a new nickname registers the user and opens the home page', async ({
    page,
    uniqueName,
  }) => {
    const name = uniqueName('newcomer')

    await page.goto('/')
    await submitLogin(page, name, 'secret')

    await expect(page).toHaveURL('/home')
    await expect(page.getByTestId('user-avatar')).toHaveText(name)
    await expect(page.getByTestId('games-empty')).toBeVisible()
  })

  test('an existing user logs in with the right password', async ({
    page,
    api,
    uniqueName,
  }) => {
    const user = await api.createUser(uniqueName('returning'), 'right')

    await page.goto('/')
    await submitLogin(page, user.name, 'right')

    await expect(page).toHaveURL('/home')
    await expect(page.getByTestId('user-avatar')).toHaveText(user.name)
  })

  test('a taken nickname with a wrong password is rejected', async ({
    page,
    api,
    uniqueName,
  }) => {
    const user = await api.createUser(uniqueName('owner'), 'right')

    await page.goto('/')
    await submitLogin(page, user.name, 'wrong')

    await expect(
      page.getByText('There is a user with such a name'),
    ).toBeVisible()
    await expect(page).toHaveURL('/')
  })

  test('the login form needs a nickname and a password', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('login-submit-button').click()

    await expect(page.getByTestId('login-name-input')).toBeFocused()
    await expect(page).toHaveURL('/')
  })

  test('a remembered user skips the login page', async ({ signIn }) => {
    const { page, user } = await signIn('remembered')

    await page.goto('/')

    await expect(page).toHaveURL('/home')
    await expect(page.getByTestId('user-avatar')).toHaveText(user.name)
  })

  test('pages behind the login redirect a guest to the login page', async ({
    page,
  }) => {
    for (const path of ['/home', '/some-game/admin', '/some-game/player']) {
      await page.goto(path)
      await expect(page.getByTestId('login-form')).toBeVisible()
      await expect(page).toHaveURL('/')
    }
  })

  test('logout ends the session', async ({ signIn }) => {
    const { page } = await signIn('leaving')
    await page.goto('/home')

    await page.getByTestId('logout-button').click()

    await expect(page.getByTestId('login-form')).toBeVisible()
    await page.goto('/home')
    await expect(page).toHaveURL('/')
  })
})
