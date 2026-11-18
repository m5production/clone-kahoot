import { expect, type APIRequestContext } from '@playwright/test'
import { E2E_API_URL } from './urls'

export interface TestUser {
  id: string
  name: string
  password: string
}

export interface TestQuestion {
  id: string
  gameId: string
  text: string
}

const authHeaders = (userId: string) => ({ Cookie: `authorization=${userId}` })

/** Test data set up through the backend API, bypassing the UI */
export const createApi = (request: APIRequestContext) => ({
  createUser: async (name: string, password = 'pass'): Promise<TestUser> => {
    const response = await request.post(`${E2E_API_URL}/users`, {
      data: { name, password },
    })
    await expect(response, await response.text()).toBeOK()

    return { ...(await response.json()), password }
  },

  createGame: async (userId: string): Promise<{ id: string }> => {
    const response = await request.post(`${E2E_API_URL}/games`, {
      headers: authHeaders(userId),
    })
    await expect(response, await response.text()).toBeOK()

    return response.json()
  },

  createQuestion: async (
    gameId: string,
    text: string,
    acceptedAnswers: string[]
  ): Promise<TestQuestion> => {
    const response = await request.post(`${E2E_API_URL}/questions`, {
      data: { gameId, text },
    })
    await expect(response, await response.text()).toBeOK()
    const question: TestQuestion = await response.json()

    const answers = await request.put(`${E2E_API_URL}/accepted-answers/`, {
      params: { questionId: question.id },
      data: acceptedAnswers.map((answer) => ({ text: answer, questionId: question.id })),
    })
    await expect(answers, await answers.text()).toBeOK()

    return question
  },
})

export type Api = ReturnType<typeof createApi>
