import type { ListingCard } from '@/types/marketplace'

/** Show the publisher's custom label when the category is "other", else the category itself. */
export function categoryLabel(listing: Pick<ListingCard, 'category' | 'customCategory'>): string {
  if (listing.category === 'other' && listing.customCategory) return listing.customCategory
  return listing.category
}

/** Tailwind chip classes per difficulty level. */
export const DIFFICULTY_CHIP: Record<string, string> = {
  easy: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  hard: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
}
