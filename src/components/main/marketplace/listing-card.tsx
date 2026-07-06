import { ListChecks, Star, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { categoryLabel, DIFFICULTY_CHIP } from './utils'
import type { ListingCard as Listing } from '@/types/marketplace'

export function ListingCard({
  listing,
  basePath = '/marketplace',
}: {
  listing: Listing
  basePath?: string
}) {
  const isImported = listing.isCloned && !listing.isMine

  return (
    <Link
      to={`${basePath}/${listing.quizId}`}
      className={`border-border bg-card relative flex flex-col gap-3 rounded-xl border p-4 transition hover:shadow-md ${isImported ? 'pb-8' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs capitalize">
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
        <span className="flex shrink-0 items-center gap-1 text-sm text-amber-500">
          <Star className="size-4 fill-current" />
          {listing.ratingCount > 0 ? listing.ratingAvg.toFixed(1) : '—'}
          <span className="text-muted-foreground">({listing.ratingCount})</span>
        </span>
      </div>
      <h3 className="line-clamp-2 font-semibold">{listing.title}</h3>
      <p className="text-muted-foreground line-clamp-2 text-sm">{listing.description}</p>
      <div className="text-muted-foreground mt-auto flex items-center gap-4 text-xs">
        <span className="flex shrink-0 items-center gap-1">
          <ListChecks className="size-3.5" /> {listing.questionCount} Qs
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <Users className="size-3.5" /> {listing.playCount} plays
        </span>
        <span className="ml-auto truncate">by {listing.authorName}</span>
      </div>

      {isImported && (
        <span className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-md border-t border-r border-l border-sky-400/50 bg-sky-50 px-3 py-0.5 text-[10px] font-semibold tracking-wider whitespace-nowrap text-sky-600 uppercase dark:border-sky-500/30 dark:bg-sky-950/60 dark:text-sky-400">
          Imported
        </span>
      )}
    </Link>
  )
}

export function ListingCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading quiz listing card"
      aria-busy="true"
      className="border-border bg-card relative flex flex-col gap-3 rounded-xl border p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="skeleton-shimmer h-5 w-16 rounded-full" />
          <div className="skeleton-shimmer h-5 w-14 rounded-full" />
        </div>
        <div className="skeleton-shimmer h-5 w-16 rounded-md shrink-0" />
      </div>

      <div className="skeleton-shimmer h-5 w-4/5 rounded-md" />

      <div className="space-y-1.5">
        <div className="skeleton-shimmer h-4 w-full rounded-md" />
        <div className="skeleton-shimmer h-4 w-5/6 rounded-md" />
      </div>

      <div className="mt-auto flex items-center gap-4 pt-2">
        <div className="skeleton-shimmer h-4 w-12 rounded-md shrink-0" />
        <div className="skeleton-shimmer h-4 w-14 rounded-md shrink-0" />
        <div className="skeleton-shimmer ml-auto h-4 w-20 rounded-md" />
      </div>
    </div>
  )
}
