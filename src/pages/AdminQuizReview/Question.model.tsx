import { createContext, PropsWithChildren, useContext, useState, type Dispatch, type SetStateAction } from 'react'

type SelectedQuestion = { id: string; number: number }

const QuestionContext = createContext<{
    selectedQuestion?: SelectedQuestion
    setSelectedQuestion: Dispatch<SetStateAction<SelectedQuestion | undefined>>
} | null>(null)

export const QuestionContextProvider = ({ children }: PropsWithChildren) => {
    const [selectedQuestion, setSelectedQuestion] = useState<SelectedQuestion | undefined>()

    return (
        <QuestionContext.Provider value={{ selectedQuestion, setSelectedQuestion }}>
            {children}
        </QuestionContext.Provider>
    )
}

export function useQuestionContext() {
    const ctx = useContext(QuestionContext)

    if (!ctx) throw new Error('useQuestionContext must be used within QuestionContext.Provider')

    return ctx
}