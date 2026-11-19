import type { Player } from './player.types'

export const findPlayerAnswer = (player: Player, questionId: string) =>
  player.answers.find((answer) => answer.questionId === questionId)

export const hasAnsweredQuestion = (player: Player, questionId: string) =>
  Boolean(findPlayerAnswer(player, questionId))
