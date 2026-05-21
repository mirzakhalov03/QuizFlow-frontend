import { useState } from 'react'
import QuizSourceSelector from './quiz-source-selector'
import QuizForm from './quiz-form'
import NotionQuizForm from './notion-quiz-form'

type View = 'selector' | 'file' | 'notion'

export default function QuizFormWrapper() {
  const [view, setView] = useState<View>('selector')

  return (
    <>
      {view === 'selector' && <QuizSourceSelector onSelect={(source) => setView(source)} />}
      {view === 'file' && <QuizForm onBack={() => setView('selector')} />}
      {view === 'notion' && <NotionQuizForm onBack={() => setView('selector')} />}
    </>
  )
}
