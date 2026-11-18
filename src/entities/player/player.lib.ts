import type { Player, PlayerScore } from './player.types'

export const findPlayerAnswer = (player: Player, questionId: string) =>
  player.answers.find((answer) => answer.questionId === questionId)

export const hasAnsweredQuestion = (player: Player, questionId: string) =>
  Boolean(findPlayerAnswer(player, questionId))

export const rankPlayersByScore = (players: Player[]): PlayerScore[] =>
  players
    .map(({ id, name, answers }) => ({
      id,
      name,
      score: answers.filter(({ isCorrect }) => isCorrect).length,
    }))
    .sort((a, b) => b.score - a.score)
