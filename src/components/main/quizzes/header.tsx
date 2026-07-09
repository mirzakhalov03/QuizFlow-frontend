import Button from '@/components/ui/button'
import { useModal } from '@/hooks/useModal'
import { Plus } from 'lucide-react'
import { useSidebarStore } from '@/store/use-sidebar-store'

export default function QuizHeader() {
  const { openModal } = useModal('quiz-add')
  const mobileMenuOpen = useSidebarStore((s) => s.mobileMenuOpen)

  return (
    <>
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your quizzes here.</p>
        </header>

        {/* Desktop button — hidden on mobile */}
        <Button onClick={openModal} className="hidden sm:flex">
          <Plus />
          Add
        </Button>
      </div>

      {/* Mobile floating button — visible only on mobile when menu is closed */}
      {!mobileMenuOpen && (
        <button
          onClick={openModal}
          className="bg-primary text-primary-foreground fixed right-5 bottom-20 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-transform active:scale-95 sm:hidden"
          aria-label="Add quiz"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </>
  )
}
