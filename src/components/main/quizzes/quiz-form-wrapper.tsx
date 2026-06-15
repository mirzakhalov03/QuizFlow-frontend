import { useState } from 'react'
import QuizSourceSelector from './quiz-source-selector'
import QuizForm from './quiz-form'
import NotionQuizForm from './notion-quiz-form'

type View = 'selector' | 'file' | 'notion'

export default function QuizFormWrapper({ folderId }: { folderId?: string }) {
  const [view, setView] = useState<View>('selector')

  return (
    <>
      {view === 'selector' && <QuizSourceSelector onSelect={(source) => setView(source)} />}
      {view === 'file' && <QuizForm folderId={folderId} onBack={() => setView('selector')} />}
      {view === 'notion' && (
        <NotionQuizForm folderId={folderId} onBack={() => setView('selector')} />
      )}
    </>
  )
}
