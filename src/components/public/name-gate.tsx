import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PublicQuiz } from '@/types/quiz'

type Props = {
  quiz: PublicQuiz
  defaultName?: string
  onStart: (name: string) => void
}

export default function NameGate({ quiz, defaultName = '', onStart }: Props) {
  const [name, setName] = useState(defaultName)
  const trimmed = name.trim()

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 md:py-20">
      <div className="border-border bg-card flex flex-col gap-6 rounded-2xl border p-8">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">Quiz</p>
          <h1 className="font-heading text-2xl font-bold md:text-3xl">{quiz.title}</h1>
          <p className="text-muted-foreground text-sm">
            Created by {quiz.owner.fullName} via QuizFlow
          </p>
          {quiz.userInstructions && (
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed whitespace-pre-wrap">
              {quiz.userInstructions}
            </p>
          )}
        </div>

        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (trimmed) onStart(trimmed)
          }}
        >
          <label htmlFor="solver-name" className="text-sm font-medium">
            Enter your name to begin
          </label>
          <Input
            id="solver-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={60}
            fullWidth
            autoFocus
          />
          <Button type="submit" disabled={!trimmed} className="self-start">
            Start quiz
          </Button>
        </form>
      </div>
    </div>
  )
}
