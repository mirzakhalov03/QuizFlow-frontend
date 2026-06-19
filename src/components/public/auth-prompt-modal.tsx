import { useNavigate } from 'react-router-dom'
import Modal from '@/components/custom/modal'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/path'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function AuthPromptModal({ isOpen, onClose }: Props) {
  const navigate = useNavigate()
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create your own quizzes"
      description="Sign up free to generate quizzes from your own documents and Notion pages."
    >
      <div className="flex flex-col gap-3 py-4">
        <Button onClick={() => navigate(PATHS.auth.register)}>Sign up free</Button>
        <Button variant="outline" onClick={() => navigate(PATHS.auth.login)}>
          I already have an account
        </Button>
      </div>
    </Modal>
  )
}
