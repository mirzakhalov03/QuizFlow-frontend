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

  const [viewMode, setViewMode] = useState<'grid' | 'anki'>('grid')
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Bookmark removal confirmation state
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null)

  // Keyboard navigation listener for Anki Mode
  useEffect(() => {
    if (viewMode !== 'anki' || bookmarks.length === 0) return

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

    if (viewMode === 'anki') {
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
          <h1 className="text-xl font-semibold sm:text-2xl flex items-center gap-2">
            Bookmarks
            {!isLoading && bookmarks.length > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold">
                {bookmarks.length}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm">Review your saved questions and answers.</p>
        </div>

        {/* View Toggle (Grid vs Anki) */}
        {!isLoading && bookmarks.length > 0 && (
          <div className="bg-muted flex items-center gap-1 rounded-lg p-1 text-xs self-start sm:self-auto shadow-sm">
            <button
              onClick={() => {
                setViewMode('grid')
                setIsFlipped(false)
              }}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
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
                setViewMode('anki')
                setIsFlipped(false)
              }}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'anki'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Anki Mode
            </button>
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <BookmarkCardSkeleton key={`initial-skeleton-${i}`} />
          ))}
        </div>
      ) : isError && bookmarks.length === 0 ? (
        <div className="border-border bg-card/50 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 px-4 text-center">
          <p className="text-destructive text-sm">
            Could not load bookmarks. Please refresh the page and try again.
          </p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="border-border bg-card/50 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 px-4 text-center">
          <div className="bg-muted text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Bookmark className="h-6 w-6" />
          </div>
          <h3 className="font-heading text-lg font-bold">No bookmarks yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Bookmark individual questions while taking quizzes or reviewing your results to review them later.
          </p>
          <Link to={PATHS.app.quizzes} className="mt-6">
            <Button>Go to Quizzes</Button>
          </Link>
        </div>
      ) : viewMode === 'anki' ? (
        /* Anki Mode */
        <div className="flex flex-col items-center gap-6 py-4 max-w-2xl mx-auto">
          {/* Card Indicator */}
          <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase bg-muted/60 px-3 py-1 rounded-full">
            Card {activeIndex + 1} of {bookmarks.length}
          </div>

          {/* Flashcard Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full aspect-[16/10] min-h-[320px] md:min-h-[380px] cursor-pointer [perspective:1200px] group relative select-none"
          >
            <div
              className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* Front Side (Question) */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-card border-border border-2 rounded-2xl p-8 flex flex-col justify-between shadow-md hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs bg-muted text-muted-foreground font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3" />
                    {bookmarks[activeIndex].quiz?.title || 'Unknown Quiz'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteQuestionId(bookmarks[activeIndex].question.id)
                    }}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0 rounded-md p-1 transition-colors"
                    title="Remove Bookmark"
                    aria-label="Remove Bookmark"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                  <MarkdownText
                    text={bookmarks[activeIndex].question.text}
                    className="text-lg md:text-xl font-bold leading-relaxed text-foreground"
                  />
                  <span className="capitalize text-[10px] tracking-wider text-muted-foreground mt-3 bg-muted px-2.5 py-1 rounded-full font-semibold">
                    {bookmarks[activeIndex].question.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-center text-xs text-muted-foreground/60 select-none animate-pulse">
                  Click card to reveal answer
                </div>
              </div>

              {/* Back Side (Answer) */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-card border-border border-2 rounded-2xl p-8 flex flex-col justify-between shadow-md overflow-y-auto">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <span className="text-xs bg-muted text-muted-foreground font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3" />
                    {bookmarks[activeIndex].quiz?.title || 'Unknown Quiz'}
                  </span>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Correct Answer
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center px-2 py-4">
                  {bookmarks[activeIndex].question.type === 'open_ended' ? (
                    <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-left">
                      <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wider uppercase block mb-1">
                        Suggested Answer
                      </span>
                      <MarkdownText
                        text={bookmarks[activeIndex].question.modelAnswer || 'No suggested answer available.'}
                        className="text-sm leading-relaxed"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 text-left max-h-[220px] overflow-y-auto pr-1">
                      {bookmarks[activeIndex].question.correctOptions &&
                      bookmarks[activeIndex].question.correctOptions.length > 0 ? (
                        bookmarks[activeIndex].question.correctOptions.map((opt) => (
                          <div
                            key={opt.id}
                            className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3"
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
                        <p className="text-muted-foreground text-xs italic text-center">No options listed.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-center text-xs text-muted-foreground/60 select-none pt-4">
                  Click card to see question
                </div>
              </div>
            </div>
          </div>

          {/* Flashcard Deck Controls */}
          <div className="flex items-center justify-center gap-4 mt-2">
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
          <div className="text-[11px] text-muted-foreground/50 text-center select-none hidden md:block">
            Use <span className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold">Left</span> /{' '}
            <span className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold">Right</span> Arrows to navigate,{' '}
            <span className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold">Space</span> to flip card.
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-2">
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
      className="bg-card border-border hover:border-primary/30 transition-all duration-200 relative flex flex-col rounded-xl border p-5 shadow-sm cursor-pointer group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs bg-muted text-muted-foreground font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
            <BookOpen className="h-3 w-3" />
            {quiz?.title || 'Unknown Quiz'}
          </span>
          <span className="text-muted-foreground text-[11px]">
            Saved {formattedDate}
          </span>
        </div>

        {/* Remove Bookmark Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation() // Prevent expanding
            onRemove()
          }}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0 rounded-md p-1 transition-colors"
          title="Remove Bookmark"
          aria-label="Remove Bookmark"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Question Text */}
      <div className="mb-4 pr-6">
        <MarkdownText text={q.text} className="text-sm font-semibold leading-relaxed" />
      </div>

      {/* Reveal Answer Area */}
      <div className="mt-auto pt-3 border-t border-border/50 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="capitalize">Type: {q.type.replace('_', ' ')}</span>
          <span className="text-primary group-hover:underline flex items-center gap-1">
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
            {showAnswer ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </span>
        </div>

        {/* Answer Content Wrapper */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            showAnswer ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-2.5 pt-1">
              {q.type === 'open_ended' ? (
                <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wider uppercase block mb-1">
                    Suggested Answer
                  </span>
                  <MarkdownText
                    text={q.modelAnswer || 'No suggested answer available.'}
                    className="text-sm leading-relaxed"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wider uppercase block mb-1">
                    Correct Option(s)
                  </span>
                  {q.correctOptions && q.correctOptions.length > 0 ? (
                    q.correctOptions.map((opt) => (
                      <div
                        key={opt.id}
                        className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3"
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
      <div className="flex items-start justify-between gap-4 mb-3">
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
      <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="skeleton-shimmer h-4 w-28 rounded-md" />
        <div className="skeleton-shimmer h-4 w-20 rounded-md" />
      </div>
    </div>
  )
}
