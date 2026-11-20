import { type APIRequestContext, expect } from '@playwright/test'
import { E2E_API_URL } from './urls'

export interface TestUser {
  id: string
  name: string
  token: string
  password: string
}

export interface TestQuestion {
  id: string
  gameId: string
  text: string
}

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` })

/** Test data set up through the backend API, bypassing the UI */
export const createApi = (request: APIRequestContext) => ({
  createUser: async (
    name: string,
    password = 'password1',
  ): Promise<TestUser> => {
    const response = await request.post(`${E2E_API_URL}/users`, {
      data: { name, password },
    })
    await expect(response, await response.text()).toBeOK()

    return { ...(await response.json()), password }
  },

  createGame: async (
    user: TestUser,
    title = 'Test quiz',
  ): Promise<{ id: string }> => {
    const response = await request.post(`${E2E_API_URL}/games`, {
      headers: authHeaders(user.token),
      data: { title },
    })
    await expect(response, await response.text()).toBeOK()

    return response.json()
  },

  fetchQuestions: async (user: TestUser, gameId: string) =>
    request.get(`${E2E_API_URL}/questions`, {
      headers: authHeaders(user.token),
      params: { gameId },
    }),

  createQuestion: async (
    user: TestUser,
    gameId: string,
    text: string,
    acceptedAnswers: string[],
  ): Promise<TestQuestion> => {
    const response = await request.post(`${E2E_API_URL}/questions`, {
      headers: authHeaders(user.token),
      data: { gameId, text },
    })
    await expect(response, await response.text()).toBeOK()
    const question: TestQuestion = await response.json()

    if (acceptedAnswers.length) {
      const answers = await request.put(`${E2E_API_URL}/accepted-answers/`, {
        headers: authHeaders(user.token),
        params: { questionId: question.id },
        data: acceptedAnswers.map((answer) => ({ text: answer })),
      })
      await expect(answers, await answers.text()).toBeOK()
    }

    return question
  },
})

export type Api = ReturnType<typeof createApi>
