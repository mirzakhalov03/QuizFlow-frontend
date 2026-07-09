import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bookmark,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import dayjs from 'dayjs'
import { useBookmarks } from '@/hooks/useBookmarks'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { PATHS } from '@/lib/path'
import MarkdownText from '@/components/main/quiz-solving/markdown-text'
import type { BookmarkItem } from '@/types/quiz'

const ARTIFICIAL_WAIT_MS = 800

export default function Bookmarks() {
  const {
    bookmarks,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    observerRef,
    toggleBookmark,
  } = useBookmarks(ARTIFICIAL_WAIT_MS)

  const [viewMode, setViewMode] = useState<'grid' | 'flashcard'>('grid')
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Bookmark removal confirmation state
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null)

  // Keyboard navigation listener for Anki Mode
  useEffect(() => {
    if (viewMode !== 'flashcard' || bookmarks.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setIsFlipped((f) => !f)
      } else if (e.code === 'ArrowRight') {
        if (activeIndex < bookmarks.length - 1) {
          setActiveIndex((prev) => prev + 1)
          setIsFlipped(false)
        }
      } else if (e.code === 'ArrowLeft') {
        if (activeIndex > 0) {
          setActiveIndex((prev) => prev - 1)
          setIsFlipped(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewMode, activeIndex, bookmarks.length])

  const handleConfirmRemove = () => {
    if (!deleteQuestionId) return

    toggleBookmark(deleteQuestionId)

    if (viewMode === 'flashcard') {
      if (activeIndex >= bookmarks.length - 1 && activeIndex > 0) {
        setActiveIndex((prev) => prev - 1)
      }
      setIsFlipped(false)
    }

    setDeleteQuestionId(null)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl">
            Bookmarks
            {!isLoading && bookmarks.length > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold">
                {bookmarks.length}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm">Review your saved questions and answers.</p>
        </div>

        {/* View Toggle (Grid vs Flashcard) */}
        {!isLoading && bookmarks.length > 0 && (
          <div className="bg-muted flex items-center gap-1 self-start rounded-lg p-1 text-xs shadow-sm sm:self-auto">
            <button
              onClick={() => {
                setViewMode('grid')
                setIsFlipped(false)
              }}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Grid View
            </button>
            <button
              onClick={() => {
                setViewMode('flashcard')
                setIsFlipped(false)
              }}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
                viewMode === 'flashcard'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Flashcard Mode
            </button>
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <BookmarkCardSkeleton key={`initial-skeleton-${i}`} />
          ))}
        </div>
      ) : isError && bookmarks.length === 0 ? (
        <div className="border-border bg-card/50 flex flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-16 text-center">
          <p className="text-destructive text-sm">
            Could not load bookmarks. Please refresh the page and try again.
          </p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="border-border bg-card/50 flex flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-16 text-center">
          <div className="bg-muted text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Bookmark className="h-6 w-6" />
          </div>
          <h3 className="font-heading text-lg font-bold">No bookmarks yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Bookmark individual questions while taking quizzes or reviewing your results to review
            them later.
          </p>
          <Link to={PATHS.app.quizzes} className="mt-6">
            <Button>Go to Quizzes</Button>
          </Link>
        </div>
      ) : viewMode === 'flashcard' ? (
        /* Flashcard Mode */
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-4">
          {/* Card Indicator */}
          <div className="text-muted-foreground bg-muted/60 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
            Card {activeIndex + 1} of {bookmarks.length}
          </div>

          {/* Flashcard Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="group relative aspect-[16/10] min-h-[320px] w-full cursor-pointer select-none [perspective:1200px] md:min-h-[380px]"
          >
            <div
              className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* Front Side (Question) */}
              <div className="bg-card border-border hover:border-primary/40 absolute inset-0 flex h-full w-full flex-col justify-between overflow-y-auto rounded-2xl border-2 p-8 shadow-md transition-colors [backface-visibility:hidden]">
                <div className="flex items-start justify-between gap-4">
                  <span className="bg-muted text-muted-foreground flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
                    <BookOpen className="h-3 w-3" />
                    {bookmarks[activeIndex].quiz?.title || 'Unknown Quiz'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteQuestionId(bookmarks[activeIndex].question.id)
                    }}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer rounded-md p-1 transition-colors"
                    title="Remove Bookmark"
                    aria-label="Remove Bookmark"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center px-4 py-4 text-center">
                  <MarkdownText
                    text={bookmarks[activeIndex].question.text}
                    className="text-foreground text-lg leading-relaxed font-bold md:text-xl"
                  />
                  <span className="text-muted-foreground bg-muted mt-3 mb-4 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wider capitalize">
                    {bookmarks[activeIndex].question.type.replace('_', ' ')}
                  </span>

                  {bookmarks[activeIndex].question.type !== 'open_ended' &&
                    bookmarks[activeIndex].question.options &&
                    bookmarks[activeIndex].question.options.length > 0 && (
                      <div className="mt-2 flex w-full max-w-md flex-col gap-2 text-left">
                        {bookmarks[activeIndex].question.options.map((opt, idx) => {
                          const letter = String.fromCharCode(65 + idx)
                          return (
                            <div
                              key={opt.id}
                              className="bg-muted/40 border-border flex items-start gap-2.5 rounded-lg border p-2.5 text-xs text-foreground/80"
                            >
                              <span className="bg-muted text-muted-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-semibold text-[10px]">
                                {letter}
                              </span>
                              <MarkdownText text={opt.text} className="flex-1 min-w-0 pt-0.5 leading-relaxed font-normal" />
                            </div>
                          )
                        })}
                      </div>
                    )}
                </div>

                <div className="text-muted-foreground/60 animate-pulse text-center text-xs select-none">
                  Click card to reveal answer
                </div>
              </div>

              {/* Back Side (Answer) */}
              <div className="bg-card border-border absolute inset-0 flex h-full w-full [transform:rotateY(180deg)] flex-col justify-between overflow-y-auto rounded-2xl border-2 p-8 shadow-md [backface-visibility:hidden]">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <span className="bg-muted text-muted-foreground flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
                    <BookOpen className="h-3 w-3" />
                    {bookmarks[activeIndex].quiz?.title || 'Unknown Quiz'}
                  </span>
                  <div className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                    Correct Answer
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-center px-2 py-4">
                  {bookmarks[activeIndex].question.type === 'open_ended' ? (
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-left dark:bg-emerald-500/10">
                      <span className="mb-1 block text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                        Suggested Answer
                      </span>
                      <MarkdownText
                        text={
                          bookmarks[activeIndex].question.modelAnswer ||
                          'No suggested answer available.'
                        }
                        className="text-sm leading-relaxed"
                      />
                    </div>
                  ) : (
                    <div className="flex max-h-[220px] flex-col gap-2 overflow-y-auto pr-1 text-left">
                      {bookmarks[activeIndex].question.correctOptions &&
                      bookmarks[activeIndex].question.correctOptions.length > 0 ? (
                        bookmarks[activeIndex].question.correctOptions.map((opt) => (
                          <div
                            key={opt.id}
                            className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 dark:bg-emerald-500/10"
                          >
                            <MarkdownText text={opt.text} className="text-sm font-medium" />
                            {opt.explanation && (
                              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                                Explanation: {opt.explanation}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center text-xs italic">
                          No options listed.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-muted-foreground/60 pt-4 text-center text-xs select-none">
                  Click card to see question
                </div>
              </div>
            </div>
          </div>

          {/* Flashcard Deck Controls */}
          <div className="mt-2 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setActiveIndex((prev) => prev - 1)
                setIsFlipped(false)
              }}
              disabled={activeIndex === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setActiveIndex((prev) => prev + 1)
                setIsFlipped(false)
              }}
              disabled={activeIndex === bookmarks.length - 1}
              className="gap-1.5"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="text-muted-foreground/50 hidden text-center text-[11px] select-none md:block">
            Use <span className="bg-muted rounded px-1.5 py-0.5 font-mono font-bold">Left</span> /{' '}
            <span className="bg-muted rounded px-1.5 py-0.5 font-mono font-bold">Right</span> Arrows
            to navigate,{' '}
            <span className="bg-muted rounded px-1.5 py-0.5 font-mono font-bold">Space</span> to
            flip card.
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          {bookmarks.map((item) => (
            <BookmarkCard
              key={item.bookmarkId}
              item={item}
              onRemove={() => setDeleteQuestionId(item.question.id)}
            />
          ))}

          {isFetchingNextPage &&
            Array.from({ length: 2 }).map((_, i) => (
              <BookmarkCardSkeleton key={`next-page-skeleton-${i}`} />
            ))}

          {hasNextPage && <div ref={observerRef} className="col-span-full h-1" />}
        </div>
      )}

      {/* Confirmation Dialog before removal */}
      <ConfirmDialog
        isOpen={deleteQuestionId !== null}
        onClose={() => setDeleteQuestionId(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Bookmark?"
        description="Are you sure you want to remove this question from your bookmarks?"
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="destructive"
      />
    </div>
  )
}

function BookmarkCard({ item, onRemove }: { item: BookmarkItem; onRemove: () => void }) {
  const [showAnswer, setShowAnswer] = useState(false)
  const q = item.question
  const quiz = item.quiz

  const formattedDate = dayjs(item.bookmarkedAt).format('MMM D, YYYY')

  return (
    <div
      onClick={() => setShowAnswer(!showAnswer)}
      className="bg-card border-border hover:border-primary/30 group relative flex cursor-pointer flex-col rounded-xl border p-5 shadow-sm transition-all duration-200"
    >
      {/* Top row */}
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-muted text-muted-foreground flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <BookOpen className="h-3 w-3" />
            {quiz?.title || 'Unknown Quiz'}
          </span>
          <span className="text-muted-foreground text-[11px]">Saved {formattedDate}</span>
        </div>

        {/* Remove Bookmark Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation() // Prevent expanding
            onRemove()
          }}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer rounded-md p-1 transition-colors"
          title="Remove Bookmark"
          aria-label="Remove Bookmark"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Question Text */}
      <div className="mb-4 pr-6">
        <MarkdownText text={q.text} className="text-sm leading-relaxed font-semibold" />
      </div>

      {/* Options List */}
      {q.type !== 'open_ended' && q.options && q.options.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {q.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx)
            return (
              <div
                key={opt.id}
                className="bg-muted/30 border-border flex items-start gap-2.5 rounded-lg border p-2.5 text-xs text-foreground/80"
              >
                <span className="bg-muted text-muted-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-semibold text-[10px]">
                  {letter}
                </span>
                <MarkdownText text={opt.text} className="flex-1 min-w-0 pt-0.5 leading-relaxed font-normal" />
              </div>
            )
          })}
        </div>
      )}

      {/* Reveal Answer Area */}
      <div className="border-border/50 mt-auto flex flex-col gap-3 border-t pt-3">
        <div className="text-muted-foreground flex items-center justify-between text-xs font-medium">
          <span className="capitalize">Type: {q.type.replace('_', ' ')}</span>
          <span className="text-primary flex items-center gap-1 group-hover:underline">
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
            {showAnswer ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </span>
        </div>

        {/* Answer Content Wrapper */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            showAnswer ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-2.5 pt-1">
              {q.type === 'open_ended' ? (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 dark:bg-emerald-500/10">
                  <span className="mb-1 block text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                    Suggested Answer
                  </span>
                  <MarkdownText
                    text={q.modelAnswer || 'No suggested answer available.'}
                    className="text-sm leading-relaxed"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <span className="mb-1 block text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                    Correct Option(s)
                  </span>
                  {q.correctOptions && q.correctOptions.length > 0 ? (
                    q.correctOptions.map((opt) => (
                      <div
                        key={opt.id}
                        className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 dark:bg-emerald-500/10"
                      >
                        <MarkdownText text={opt.text} className="text-sm font-medium" />
                        {opt.explanation && (
                          <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                            Explanation: {opt.explanation}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-xs italic">No options listed.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BookmarkCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading bookmark card"
      aria-busy="true"
      className="bg-card border-border flex flex-col gap-4 rounded-xl border p-5 shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="skeleton-shimmer h-5 w-24 rounded-full" />
          <div className="skeleton-shimmer h-3 w-16 rounded-md" />
        </div>
        <div className="skeleton-shimmer h-7 w-7 rounded-md" />
      </div>
      <div className="space-y-2">
        <div className="skeleton-shimmer h-4 w-full rounded-md" />
        <div className="skeleton-shimmer h-4 w-5/6 rounded-md" />
      </div>
      <div className="border-border/50 mt-auto flex items-center justify-between border-t pt-3">
        <div className="skeleton-shimmer h-4 w-28 rounded-md" />
        <div className="skeleton-shimmer h-4 w-20 rounded-md" />
      </div>
    </div>
  )
}
