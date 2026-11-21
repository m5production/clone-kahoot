import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router'
import {
  GAME_QUESTIONS_QUERY,
  isQuestionReady,
  isQuizReady,
} from '@/entities/question'
import { useMediaQuery } from '@/shared/lib'
import type { EditorSection, SelectedQuestion } from './quiz-editor.types'
import { QuizEditorDesktop } from './quiz-editor.ui.desktop'
import { QuizEditorMobile } from './quiz-editor.ui.mobile'

export function QuizEditorPage() {
  const { gameId } = useParams()
  const [selectedQuestion, setSelectedQuestion] = useState<SelectedQuestion>()
  // FR-88: below 768px the editor shows one section at a time (D-10); the layout
  // is picked in JS so only one is mounted — duplicated test ids and a doubly
  // mounted form would break e2e locators and the form state
  const [section, setSection] = useState<EditorSection>('questions')
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { data: questions } = useQuery(
    GAME_QUESTIONS_QUERY.queryOptions(gameId),
  )

  if (!gameId) {
    return null
  }

  // FR-55, BR-49: the quiz launches only when every question is game-ready
  const isReady = questions ? isQuizReady(questions) : false
  const incompleteCount =
    questions?.filter((question) => !isQuestionReady(question)).length ?? 0

  const layoutProps = {
    gameId,
    isReady,
    selectedQuestion,
    // FR-89: picking or adding a question opens the Question section
    onSelectQuestion: (question: SelectedQuestion) => {
      setSelectedQuestion(question)
      setSection('question')
    },
    // FR-89: deleting the open question returns to the list
    onDeleteSelected: () => {
      setSelectedQuestion(undefined)
      setSection('questions')
    },
  }

  return isDesktop ? (
    <QuizEditorDesktop {...layoutProps} />
  ) : (
    <QuizEditorMobile
      {...layoutProps}
      section={section}
      onSectionChange={setSection}
      incompleteCount={incompleteCount}
    />
  )
}
