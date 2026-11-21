import { useActiveGame } from '@/entities/active-game'
import { AnswerOptionButtons } from './submit-answer.ui.options'
import { TextAnswerForm } from './submit-answer.ui.text'

/** The player's answer control: a text form for open questions, option buttons
    for choice questions — picked by the question type coming over WS (D-10) */
export function SubmitAnswerForm() {
  const { session } = useActiveGame()

  if (session?.question?.type === 'choice') {
    return <AnswerOptionButtons />
  }

  return <TextAnswerForm />
}
