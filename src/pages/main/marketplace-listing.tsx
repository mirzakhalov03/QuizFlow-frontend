import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { api as axiosInstance } from '@/api/axios-instance'
import { Reviews } from '@/components/main/marketplace/reviews'
import { categoryLabel, DIFFICULTY_CHIP } from '@/components/main/marketplace/utils'
import Breadcrumb from '@/components/ui/breadcrumb'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { MARKETPLACE, MARKETPLACE_LISTING, QUIZ_CLONE } from '@/constants/api-endpoints'
import { useGet } from '@/hooks/useGet'
import { PATHS } from '@/lib/path'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/store/use-authstore'
import type { ListingCard } from '@/types/marketplace'
import StartCountdownOverlay from '@/components/main/quiz-solving/start-countdown-overlay'
import { pickIntroQuote } from '@/components/main/quiz-solving/intro-quotes'

export default function MarketplaceListingPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const isAuthed = useAuthStore((s) => s.isAuthed)
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)
  const [takeCountdown, setTakeCountdown] = useState<number | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const quote = useMemo(() => pickIntroQuote(), [])
  const autoSaveTriggered = useRef(false)

  const { data, isLoading } = useGet<{ data: ListingCard }>(MARKETPLACE_LISTING(quizId!), {
    enabled: Boolean(quizId),
  })
  const listing = data?.data

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  // After login redirect with ?save=1, auto-save the quiz to the user's library
  useEffect(() => {
    const pendingSave = searchParams.get('save') === '1'
    if (
      !pendingSave ||
      !isAuthed ||
      !listing ||
      listing.isCloned ||
      listing.isMine ||
      autoSaveTriggered.current
    )
      return
    autoSaveTriggered.current = true
    // Clean the ?save=1 from the URL so a refresh doesn't re-trigger
    navigate(pathname, { replace: true })
    if (!listing.shareToken) return
    setIsSaving(true)
    axiosInstance
      .post(QUIZ_CLONE(listing.shareToken))
      .then(() => {
        toast.success('Imported to quizzes section')
        queryClient.invalidateQueries({ queryKey: [MARKETPLACE_LISTING(quizId!)] })
        queryClient.invalidateQueries({ queryKey: [MARKETPLACE] })
      })
      .catch((err: unknown) => {
        const code = (
          err as { response?: { data?: { error?: { code?: string } } } }
        )?.response?.data?.error?.code
        if (code === 'ALREADY_IMPORTED') {
          toast.error('You already have this quiz in your library')
        } else {
          toast.error('Could not save a copy')
        }
      })
      .finally(() => {
        setIsSaving(false)
      })
  }, [searchParams, isAuthed, listing, navigate, pathname, queryClient, quizId])

  if (isLoading)
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  if (!listing) return <p className="text-muted-foreground p-6">Listing not found.</p>

  // Keep the breadcrumb's "Explore" link within the current zone.
  const exploreBase = pathname.startsWith(PATHS.app.root)
    ? PATHS.app.marketplace
    : PATHS.marketplace

  const requireLogin = () => {
    // Redirect to the authenticated app-zone path with ?save=1 so that:
    // 1. login.tsx accepts it (it requires from to start with /app)
    // 2. this page auto-triggers the save once the user is authenticated
    navigate(`/auth/login?from=${encodeURIComponent(`/app/marketplace/${quizId}?save=1`)}`)
  }

  const onTake = () => {
    if (!isAuthed) {
      if (!listing.shareToken) return
      navigate(`/public/quizzes/${listing.shareToken}`)
      return
    }
    if (takeCountdown !== null) return
    setTakeCountdown(3)
    countdownRef.current = setInterval(() => {
      setTakeCountdown((prev) => {
        if (prev === null) return null
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          navigate(`${PATHS.app.quiz(listing.quizId)}?autostart=1`)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const onSave = async () => {
    if (!isAuthed) return requireLogin()
    if (!listing.shareToken) return
    setIsSaving(true)
    try {
      await axiosInstance.post(QUIZ_CLONE(listing.shareToken))
      toast.success('Imported to quizzes section')
      // Refresh the listing so isCloned flips to true and button updates
      await queryClient.invalidateQueries({ queryKey: [MARKETPLACE_LISTING(quizId!)] })
      // Also refresh the marketplace list so the card badge updates if the user navigates back
      queryClient.invalidateQueries({ queryKey: [MARKETPLACE] })
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data
        ?.error?.code
      if (code === 'ALREADY_IMPORTED') {
        toast.error('You already have this quiz in your library')
      } else {
        toast.error('Could not save a copy')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: 'Explore', to: exploreBase }, { label: listing.title }]} />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="bg-muted text-muted-foreground w-fit rounded-full px-2 py-0.5 text-xs capitalize">
              {categoryLabel(listing)}
            </span>
            {listing.difficulty && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs capitalize ${DIFFICULTY_CHIP[listing.difficulty] ?? 'bg-muted text-muted-foreground'}`}
              >
                {listing.difficulty}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <p className="text-muted-foreground text-sm">
            by {listing.authorName} · {listing.questionCount} questions · {listing.playCount} plays
            · ⭐ {listing.ratingCount > 0 ? listing.ratingAvg.toFixed(1) : '—'} (
            {listing.ratingCount})
          </p>
          {listing.description && <p className="mt-2">{listing.description}</p>}
        </div>

        <div className="flex gap-3">
          <Button onClick={onTake} size="md" disabled={takeCountdown !== null} className="min-w-28">
            Take quiz
          </Button>
          {/* You already own your own quizzes — no "save a copy" for them. */}
          {!listing.isMine && (
            <Button
              variant="outline"
              size="md"
              loading={isSaving}
              onClick={listing.isCloned ? undefined : onSave}
              disabled={listing.isCloned || isSaving}
            >
              {listing.isCloned ? 'Already in library' : 'Save to my library'}
            </Button>
          )}
        </div>

        {quizId && <Reviews quizId={quizId} canRate={!listing.isMine} />}
      </div>

      {takeCountdown !== null && (
        <StartCountdownOverlay count={takeCountdown} quote={quote} />
      )}
    </div>
  )
}
