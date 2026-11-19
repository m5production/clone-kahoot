import { test as base, type BrowserContext, type Page } from '@playwright/test'
import { createApi, type Api, type TestUser } from './api'

export interface Actor {
  user: TestUser
  page: Page
}

interface Fixtures {
  api: Api
  /** A name unique across runs and workers; backend user names must be unique */
  uniqueName: (prefix: string) => string
  /** A signed-in user in its own browser context, e.g. the host or a player */
  signIn: (prefix: string) => Promise<Actor>
}

let nameCounter = 0

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    await use(createApi(request))
  },

  uniqueName: async ({}, use, testInfo) => {
    const runId = Date.now().toString(36)

    await use((prefix) => `${prefix}-${runId}-${testInfo.workerIndex}-${++nameCounter}`)
  },

  signIn: async ({ browser, api, uniqueName }, use) => {
    const contexts: BrowserContext[] = []

    await use(async (prefix) => {
      const user = await api.createUser(uniqueName(prefix))
      const context = await browser.newContext()
      contexts.push(context)

      // The app's session: the bearer token and the remembered user id (seeded once per
      // tab, so a logout inside the test is not undone by the next navigation)
      await context.addInitScript(([userId, token]) => {
        if (sessionStorage.getItem('e2e-session-seeded')) return
        localStorage.setItem('userId', userId)
        localStorage.setItem('sessionToken', token)
        sessionStorage.setItem('e2e-session-seeded', 'true')
      }, [user.id, user.token])

      return { user, page: await context.newPage() }
    })

    await Promise.all(contexts.map((context) => context.close()))
  },
})

export { expect } from '@playwright/test'
