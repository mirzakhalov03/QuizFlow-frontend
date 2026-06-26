import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import { ListingCard } from '@/components/main/marketplace/listing-card'
import { MarketplaceFilters } from '@/components/main/marketplace/marketplace-filters'
import Breadcrumb from '@/components/ui/breadcrumb'
import { MARKETPLACE } from '@/constants/api-endpoints'
import { useDebounce } from '@/hooks/useDebounce'
import { useGet } from '@/hooks/useGet'
import { PATHS } from '@/lib/path'
import type {
  BrowseResponse,
  ListingCard as Listing,
  MarketplaceCategory,
  MarketplaceSort,
} from '@/types/marketplace'

function Grid({ items, basePath }: { items: Listing[]; basePath: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((l) => (
        <ListingCard key={l.quizId} listing={l} basePath={basePath} />
      ))}
    </div>
  )
}

export default function MarketplacePage() {
  const { pathname } = useLocation()
  // The same page is mounted in both the app shell (/app/marketplace) and the
  // public zone (/marketplace); keep listing links within whichever zone we're in.
  const basePath = pathname.startsWith(PATHS.app.root) ? PATHS.app.marketplace : PATHS.marketplace

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<MarketplaceCategory | ''>('')
  const [sort, setSort] = useState<MarketplaceSort>('recent')
  const debouncedSearch = useDebounce(search, 350)

  const params = {
    q: debouncedSearch || undefined,
    category: category || undefined,
    sort,
    page: 1,
    pageSize: 24,
  }

  const { data, isLoading } = useGet<{ data: BrowseResponse }>(MARKETPLACE, { params })
  const items = data?.data.items ?? []
  const mine = items.filter((l) => l.isMine)
  const others = items.filter((l) => !l.isMine)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <Breadcrumb items={[{ label: 'Explore' }]} />

      <div>
        <h1 className="text-2xl font-bold">Explore</h1>
        <p className="text-muted-foreground">Discover quizzes shared by the community.</p>
      </div>

      <MarketplaceFilters
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
        sort={sort}
        onSort={setSort}
      />

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">No quizzes found.</p>
      ) : mine.length > 0 ? (
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold tracking-wide uppercase">Your public quizzes</h2>
            <Grid items={mine} basePath={basePath} />
          </section>

          {others.length > 0 && (
            <>
              <hr className="border-border" />
              <section className="flex flex-col gap-3">
                <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                  Others
                </h2>
                <Grid items={others} basePath={basePath} />
              </section>
            </>
          )}
        </div>
      ) : (
        <Grid items={others} basePath={basePath} />
      )}
    </div>
  )
}
