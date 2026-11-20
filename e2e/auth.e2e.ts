import type { Page } from '@playwright/test'
import { expect, test } from './support/fixtures'

const submitCredentials = async (
  page: Page,
  scope: 'login' | 'register',
  name: string,
  password: string,
) => {
  const form = page.getByTestId(`${scope}-form`)
  await form.getByTestId(`${scope}-name-input`).fill(name)
  await form.getByTestId(`${scope}-password-input`).fill(password)
  await form.getByTestId(`${scope}-submit-button`).click()
}

test.describe('authorisation', () => {
  test('the welcome page describes the product and leads to login and register', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.getByTestId('welcome-login-link')).toBeVisible()
    await page.getByTestId('welcome-register-link').click()
    await expect(page).toHaveURL('/register')

    await page.getByTestId('register-welcome-link').click()
    await page.getByTestId('welcome-login-link').click()
    await expect(page).toHaveURL('/login')
  })

  test('a guest registers on the register page and lands signed in', async ({
    page,
    uniqueName,
  }) => {
    const name = uniqueName('newcomer')

    await page.goto('/register')
    await submitCredentials(page, 'register', name, 'secret-password')

    await expect(page).toHaveURL('/home')
    await expect(page.getByTestId('user-avatar')).toHaveText(name)
    await expect(page.getByTestId('games-empty')).toBeVisible()
  })

  test('an existing user logs in on the login page', async ({
    page,
    api,
    uniqueName,
  }) => {
    const user = await api.createUser(uniqueName('returning'), 'right-password')

    await page.goto('/login')
    await submitCredentials(page, 'login', user.name, 'right-password')

    await expect(page).toHaveURL('/home')
    await expect(page.getByTestId('user-avatar')).toHaveText(user.name)
  })

  test('the login page rejects unknown credentials without creating an account', async ({
    page,
    uniqueName,
  }) => {
    const name = uniqueName('stranger')

    await page.goto('/login')
    await submitCredentials(page, 'login', name, 'wrong-password')

    await expect(page.getByText('Invalid name or password')).toBeVisible()
    await expect(page).toHaveURL('/login')

    // The failed login created no account: the same name can still register
    await page.getByTestId('login-register-link').click()
    await submitCredentials(page, 'register', name, 'secret-password')
    await expect(page).toHaveURL('/home')
  })

  test('the register page rejects a taken nickname', async ({
    page,
    api,
    uniqueName,
  }) => {
    const user = await api.createUser(uniqueName('owner'))

    await page.goto('/register')
    await submitCredentials(page, 'register', user.name, 'secret-password')

    await expect(
      page.getByText('There is a user with such a name'),
    ).toBeVisible()
    await expect(page).toHaveURL('/register')
  })

  test('the register page rejects the nickname in a different case', async ({
    page,
    api,
    uniqueName,
  }) => {
    const user = await api.createUser(uniqueName('owner'))

    await page.goto('/register')
    await submitCredentials(
      page,
      'register',
      user.name.toUpperCase(),
      'secret-password',
    )

    await expect(
      page.getByText('There is a user with such a name'),
    ).toBeVisible()
  })

  test('the login and register forms need a nickname and a password', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.getByTestId('login-submit-button').click()
    await expect(page.getByTestId('login-name-input')).toBeFocused()

    await page.goto('/register')
    await page.getByTestId('register-submit-button').click()
    await expect(page.getByTestId('register-name-input')).toBeFocused()
  })

  test('a remembered user skips the guest pages', async ({ signIn }) => {
    const { page, user } = await signIn('remembered')

    for (const path of ['/', '/login', '/register']) {
      await page.goto(path)
      await expect(page).toHaveURL('/home')
    }
    await expect(page.getByTestId('user-avatar')).toHaveText(user.name)
  })

  test('pages behind the login redirect a guest to the welcome page', async ({
    page,
  }) => {
    for (const path of ['/home', '/some-game/admin', '/some-game/player']) {
      await page.goto(path)
      await expect(page.getByTestId('welcome-login-link')).toBeVisible()
      await expect(page).toHaveURL('/')
    }
  })

  test('logout ends the session', async ({ signIn }) => {
    const { page } = await signIn('leaving')
    await page.goto('/home')

    await page.getByTestId('logout-button').click()

    await expect(page.getByTestId('welcome-login-link')).toBeVisible()
    await page.goto('/home')
    await expect(page).toHaveURL('/')
  })
})
