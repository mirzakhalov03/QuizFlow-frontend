import { useState } from 'react'
import Button from '@/components/ui/button'
import { useUserProfileStore } from '@/store/userProfileStore'
import { useToastStore } from '@/store/toast-store'
import { cn } from '@/lib/utils'

type Answers = {
  purpose: string[]
  fields: string[]
  otherField: string
  background: string[]
}

const PURPOSE_OPTIONS = [
  'Studying for an exam',
  'Preparing for job interviews',
  'Learning something new on my own',
  'Creating quizzes for my students',
]

const FIELD_OPTIONS = [
  'Computer Science',
  'Medicine',
  'Law',
  'Business & Finance',
  'Science',
  'Humanities',
  'Languages',
  'History',
  'Other',
]

const BACKGROUND_OPTIONS = [
  'High school student',
  'Undergraduate / College',
  'Graduate student',
  'Working professional',
  'Self-taught / hobbyist',
]

function compileBio(answers: Answers): string {
  const fields = answers.fields
    .map((f) => (f === 'Other' ? answers.otherField || 'Other' : f))
    .join(', ')
  return `Purpose: ${answers.purpose.join(', ')}. Fields: ${fields}. Background: ${answers.background.join(', ')}.`
}

export default function OnboardingModal() {
  const { isOnboarded, loading, updating, updateProfile } = useUserProfileStore()
  const addToast = useToastStore((s) => s.add)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [filledUpTo, setFilledUpTo] = useState(0)
  const [answers, setAnswers] = useState<Answers>({
    purpose: [],
    fields: [],
    otherField: '',
    background: [],
  })

  if (isOnboarded !== false || loading) return null

  const handleAdvance = (from: 1 | 2) => {
    setFilledUpTo(from)
    setTimeout(() => setStep((from + 1) as 2 | 3), 400)
  }

  const handleSkip = async () => {
    try {
      await updateProfile({ isOnboarded: true })
    } catch {
      addToast({
        type: 'error',
        title: 'Something went wrong',
        description: 'Could not save your preferences. Please try again.',
      })
    }
  }

  const handleFinish = async () => {
    try {
      await updateProfile({ bio: compileBio(answers), isOnboarded: true })
    } catch {
      addToast({
        type: 'error',
        title: 'Something went wrong',
        description: 'Could not save your preferences. Please try again.',
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70" />

      <div className="relative z-50 w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 text-center">
          <h2 className="text-lg font-semibold">Let's personalize your experience!</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            A few quick questions so we can tailor your quizzes.
          </p>
        </div>

        <div className="mb-6 flex justify-center gap-2">
          {([1, 2, 3] as const).map((s) => (
            <div key={s} className="bg-muted h-2 w-20 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: s <= filledUpTo ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <StepPurpose
              value={answers.purpose}
              onToggle={(value) =>
                setAnswers((a) => ({
                  ...a,
                  purpose: a.purpose.includes(value)
                    ? a.purpose.filter((x) => x !== value)
                    : [...a.purpose, value],
                }))
              }
            />
          )}
          {step === 2 && (
            <StepField
              selected={answers.fields}
              otherText={answers.otherField}
              onToggle={(f) =>
                setAnswers((a) => ({
                  ...a,
                  fields: a.fields.includes(f) ? a.fields.filter((x) => x !== f) : [...a.fields, f],
                }))
              }
              onOtherChange={(v) => setAnswers((a) => ({ ...a, otherField: v }))}
            />
          )}
          {step === 3 && (
            <StepBackground
              value={answers.background}
              onToggle={(value) => {
                setAnswers((a) => ({
                  ...a,
                  background: a.background.includes(value)
                    ? a.background.filter((x) => x !== value)
                    : [...a.background, value],
                }))
                setFilledUpTo(3)
              }}
            />
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleSkip}
            disabled={updating}
            className="text-muted-foreground text-sm hover:underline disabled:opacity-50"
          >
            Skip for now
          </button>

          <div className="flex gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                disabled={updating}
              >
                Back
              </Button>
            )}
            {(step === 1 || step === 2) && (
              <Button
                size="sm"
                onClick={() => handleAdvance(step)}
                disabled={
                  (step === 1 && answers.purpose.length === 0) ||
                  (step === 2 && answers.fields.length === 0) ||
                  updating
                }
              >
                Next
              </Button>
            )}
            {step === 3 && (
              <Button
                size="sm"
                onClick={handleFinish}
                disabled={answers.background.length === 0 || updating}
                loading={updating}
              >
                Finish
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepPurpose({ value, onToggle }: { value: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">What brings you here?</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          This helps us tailor quizzes to your goals.
        </p>
      </div>
      <div className="grid gap-2">
        {PURPOSE_OPTIONS.map((opt) => {
          const selected = value.includes(opt)
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                selected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-foreground hover:bg-muted'
              )}
            >
              <div
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  selected ? 'border-primary' : 'border-muted-foreground/40'
                )}
              >
                {selected && <div className="bg-primary h-2 w-2 rounded-full" />}
              </div>
              <span className={cn(selected && 'font-medium')}>{opt}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepField({
  selected,
  otherText,
  onToggle,
  onOtherChange,
}: {
  selected: string[]
  otherText: string
  onToggle: (f: string) => void
  onOtherChange: (v: string) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">What's your field?</h2>
        <p className="text-muted-foreground mt-1 text-sm">Pick all that apply.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {FIELD_OPTIONS.map((f) => {
          const checked = selected.includes(f)
          return (
            <button
              key={f}
              onClick={() => onToggle(f)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                checked
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted text-foreground hover:border-primary/40 hover:bg-muted/80'
              )}
            >
              {f}
            </button>
          )
        })}
      </div>
      {selected.includes('Other') && (
        <input
          type="text"
          placeholder="What's your field?"
          value={otherText}
          onChange={(e) => onOtherChange(e.target.value)}
          className="border-border bg-background focus:ring-primary/40 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
        />
      )}
    </div>
  )
}

function StepBackground({ value, onToggle }: { value: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Where are you in your journey?</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Helps us pitch the right depth in your quizzes.
        </p>
      </div>
      <div className="grid gap-2">
        {BACKGROUND_OPTIONS.map((opt) => {
          const selected = value.includes(opt)
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                selected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-foreground hover:bg-muted'
              )}
            >
              <div
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  selected ? 'border-primary' : 'border-muted-foreground/40'
                )}
              >
                {selected && <div className="bg-primary h-2 w-2 rounded-full" />}
              </div>
              <span className={cn(selected && 'font-medium')}>{opt}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
