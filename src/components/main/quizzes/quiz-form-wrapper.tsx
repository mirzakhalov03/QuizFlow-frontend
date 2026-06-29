import { useState, useEffect } from 'react'
import QuizSourceSelector from './quiz-source-selector'
import QuizForm from './quiz-form'
import NotionQuizForm from './notion-quiz-form'
import { useModal } from '@/hooks/useModal'

type View = 'selector' | 'file' | 'notion' | 'obsidian'

export default function QuizFormWrapper({ folderId }: { folderId?: string }) {
  const [view, setView] = useState<View>('selector')
  const { isOpen } = useModal('quiz-add')


  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setView('selector'), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])


  return (
    <>
      {view === 'selector' && <QuizSourceSelector onSelect={(source) => setView(source)} />}
      {view === 'file' && <QuizForm folderId={folderId} onBack={() => setView('selector')} />}
      {view === 'notion' && (
        <NotionQuizForm folderId={folderId} onBack={() => setView('selector')} />
      )}

      {view === 'obsidian' && (
        <QuizForm
          folderId={folderId}
          onBack={() => setView('selector')}
          sourceOverride="obsidian"
        />
      )}
    </>
  )
}
