import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { api as axiosInstance } from '@/api/axios-instance'
import { Reviews } from '@/components/main/marketplace/reviews'
import { categoryLabel, DIFFICULTY_CHIP } from '@/components/main/marketplace/utils'
import Breadcrumb from '@/components/ui/breadcrumb'
import { MARKETPLACE_LISTING, QUIZ_CLONE } from '@/constants/api-endpoints'
import { useGet } from '@/hooks/useGet'
import { PATHS } from '@/lib/path'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/store/use-authstore'
import type { ListingCard } from '@/types/marketplace'

export default function MarketplaceListingPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isAuthed = useAuthStore((s) => s.isAuthed)
  // Keep the breadcrumb's "Explore" link within the current zone.
  const exploreBase = pathname.startsWith(PATHS.app.root)
    ? PATHS.app.marketplace
    : PATHS.marketplace

  const { data, isLoading } = useGet<{ data: ListingCard }>(MARKETPLACE_LISTING(quizId!), {
    enabled: Boolean(quizId),
  })
  const listing = data?.data

  if (isLoading) return <p className="text-muted-foreground p-6">Loading…</p>
  if (!listing) return <p className="text-muted-foreground p-6">Listing not found.</p>

  const requireLogin = () => {
    navigate(`/auth/login?from=${encodeURIComponent(pathname)}`)
  }

  const onTake = () => {
    if (!listing.shareToken) return
    // Reuse the existing public solving flow. Logged-in takes persist server-side.
    navigate(`/public/quizzes/${listing.shareToken}`)
  }

  const onSave = async () => {
    if (!isAuthed) return requireLogin()
    if (!listing.shareToken) return
    try {
      await axiosInstance.post(QUIZ_CLONE(listing.shareToken))
      toast.success('Saved to your library')
    } catch {
      toast.error('Could not save a copy')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <Breadcrumb items={[{ label: 'Explore', to: exploreBase }, { label: listing.title }]} />

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
          by {listing.authorName} · {listing.questionCount} questions · {listing.playCount} plays ·
          ⭐ {listing.ratingCount > 0 ? listing.ratingAvg.toFixed(1) : '—'} ({listing.ratingCount})
        </p>
        {listing.description && <p className="mt-2">{listing.description}</p>}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onTake}
          className="bg-primary text-primary-foreground h-10 rounded-md px-5 font-medium"
        >
          Take quiz
        </button>
        {/* You already own your own quizzes — no "save a copy" for them. */}
        {!listing.isMine && (
          <button
            onClick={listing.isCloned ? undefined : onSave}
            disabled={listing.isCloned}
            className={`border-border h-10 rounded-md border px-5 font-medium ${
              listing.isCloned ? 'text-muted-foreground cursor-default opacity-60' : ''
            }`}
          >
            {listing.isCloned ? 'Already in library' : 'Save to my library'}
          </button>
        )}
      </div>

      {quizId && <Reviews quizId={quizId} canRate={false} />}
    </div>
  )
}
