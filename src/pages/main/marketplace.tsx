import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { ListingCard } from '@/components/main/marketplace/listing-card'
import { MarketplaceFilters } from '@/components/main/marketplace/marketplace-filters'
import Spinner from '@/components/ui/spinner'
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

const PAGE_SIZE = 24

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
  const isPublic = !pathname.startsWith(PATHS.app.root)
  const basePath = !isPublic ? PATHS.app.marketplace : PATHS.marketplace

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<MarketplaceCategory | ''>('')
  const [sort, setSort] = useState<MarketplaceSort>('recent')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 350)

  const handleSearch = (v: string) => {
    setSearch(v)
    setPage(1)
  }
  const handleCategory = (v: MarketplaceCategory | '') => {
    setCategory(v)
    setPage(1)
  }
  const handleSort = (v: MarketplaceSort) => {
    setSort(v)
    setPage(1)
  }

  const params = {
    q: debouncedSearch || undefined,
    category: category || undefined,
    sort,
    page,
    pageSize: PAGE_SIZE,
  }

  const { data, isLoading } = useGet<{ data: BrowseResponse }>(MARKETPLACE, { params })
  const items = data?.data.items ?? []
  const total = data?.data.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const mine = items.filter((l) => l.isMine)
  const others = items.filter((l) => !l.isMine)

  return (
    <div className={`flex flex-col gap-6${isPublic ? ' px-4 py-8 sm:px-6 lg:px-8' : ''}`}>
      <div>
        <h1 className="text-2xl font-bold">Explore</h1>
        <p className="text-muted-foreground">Discover quizzes shared by the community.</p>
      </div>

      <MarketplaceFilters
        search={search}
        onSearch={handleSearch}
        category={category}
        onCategory={handleCategory}
        sort={sort}
        onSort={handleSort}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="border-border hover:bg-muted disabled:text-muted-foreground flex h-8 w-8 items-center justify-center rounded-md border transition disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 min-w-8 rounded-md border px-2 text-sm transition ${
                p === page
                  ? 'bg-primary border-primary text-primary-foreground font-medium'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="border-border hover:bg-muted disabled:text-muted-foreground flex h-8 w-8 items-center justify-center rounded-md border transition disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
