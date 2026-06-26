import {
  MARKETPLACE_CATEGORIES,
  type MarketplaceCategory,
  type MarketplaceSort,
} from '@/types/marketplace'

type Props = {
  search: string
  onSearch: (v: string) => void
  category: MarketplaceCategory | ''
  onCategory: (v: MarketplaceCategory | '') => void
  sort: MarketplaceSort
  onSort: (v: MarketplaceSort) => void
}

export function MarketplaceFilters({
  search,
  onSearch,
  category,
  onCategory,
  sort,
  onSort,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search quizzes…"
        className="border-border bg-background h-9 min-w-48 flex-1 rounded-md border px-3 text-sm"
      />
      <select
        value={category}
        onChange={(e) => onCategory(e.target.value as MarketplaceCategory | '')}
        className="border-border bg-background h-9 rounded-md border px-2 text-sm capitalize"
      >
        <option value="">All categories</option>
        {MARKETPLACE_CATEGORIES.map((c) => (
          <option key={c} value={c} className="capitalize">
            {c}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => onSort(e.target.value as MarketplaceSort)}
        className="border-border bg-background h-9 rounded-md border px-2 text-sm"
      >
        <option value="recent">Most recent</option>
        <option value="popular">Most popular</option>
        <option value="rating">Top rated</option>
      </select>
    </div>
  )
}
