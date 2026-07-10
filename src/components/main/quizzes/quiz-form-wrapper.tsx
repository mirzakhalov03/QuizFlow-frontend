import QuizCreateForm from './quiz-create-form'

export default function QuizFormWrapper({ folderId }: { folderId?: string }) {
  return <QuizCreateForm folderId={folderId} />
}
