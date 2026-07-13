import { CustomSelect } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
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

const CATEGORY_OPTIONS = [
  { label: 'All categories', value: '' },
  ...MARKETPLACE_CATEGORIES.map((c) => ({
    label: c.charAt(0).toUpperCase() + c.slice(1),
    value: c,
  })),
]

const SORT_OPTIONS = [
  { label: 'Most recent', value: 'recent' },
  { label: 'Most popular', value: 'popular' },
  { label: 'Top rated', value: 'rating' },
]

export function MarketplaceFilters({
  search,
  onSearch,
  category,
  onCategory,
  sort,
  onSort,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="w-full sm:flex-1">
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search quizzes…"
          fullWidth
        />
      </div>
      <div className="flex w-full gap-3 sm:w-auto sm:flex-none">
        <CustomSelect
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(v) => onCategory(v as MarketplaceCategory | '')}
          placeholder="All categories"
          className="flex-1 sm:min-w-40 sm:flex-none"
        />
        <CustomSelect
          options={SORT_OPTIONS}
          value={sort}
          onChange={(v) => onSort(v as MarketplaceSort)}
          className="flex-1 sm:min-w-36 sm:flex-none"
          align="right"
        />
      </div>
    </div>
  )
}
