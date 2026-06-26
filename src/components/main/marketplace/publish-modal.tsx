import { useEffect, useState } from 'react'

import { marketplaceService } from '@/api/services/marketplace.service'
import { toast } from '@/lib/toast'
import { MARKETPLACE_CATEGORIES, type MarketplaceCategory } from '@/types/marketplace'

type Props = {
  quizId: string
  open: boolean
  onClose: () => void
}

const CUSTOM_CATEGORY_MAX = 50

export function PublishModal({ quizId, open, onClose }: Props) {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<MarketplaceCategory>('general')
  const [customCategory, setCustomCategory] = useState('')
  const [listed, setListed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    // Prefill if already listed.
    marketplaceService
      .getListing(quizId)
      .then((res) => {
        const l = res?.data
        if (l) {
          setDescription(l.description ?? '')
          setCategory(l.category)
          setCustomCategory(l.customCategory ?? '')
          setListed(true)
        }
      })
      .catch(() => setListed(false))
  }, [open, quizId])

  if (!open) return null

  const customTooLong = customCategory.trim().length > CUSTOM_CATEGORY_MAX

  const save = async () => {
    if (customTooLong) {
      toast.error(`Custom category must be ${CUSTOM_CATEGORY_MAX} characters or fewer`)
      return
    }
    setLoading(true)
    // Send description as a (possibly empty) string so an emptied field clears it on update.
    const body = {
      description: description.trim(),
      category,
      customCategory: category === 'other' ? customCategory.trim() || undefined : undefined,
    }
    try {
      if (listed) {
        // Send null to clear a previously-set custom label when not 'other'.
        await marketplaceService.update(quizId, {
          ...body,
          customCategory: category === 'other' ? customCategory.trim() || undefined : null,
        })
        toast.success('Listing updated')
      } else {
        await marketplaceService.publish(quizId, body)
        toast.success('Published to marketplace')
      }
      onClose()
    } catch {
      toast.error('Could not save listing')
    } finally {
      setLoading(false)
    }
  }

  const remove = async () => {
    setLoading(true)
    try {
      await marketplaceService.unpublish(quizId)
      toast.success('Removed from marketplace')
      setListed(false)
      onClose()
    } catch {
      toast.error('Could not remove listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card w-full max-w-md rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold">
          {listed ? 'Manage listing' : 'Publish to marketplace'}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Description and category are optional — you can publish with just a title.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs font-medium">
              Description (optional)
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this quiz…"
              className="border-border bg-background min-h-24 rounded-md border p-2 text-sm"
              maxLength={500}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs font-medium">Category (optional)</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MarketplaceCategory)}
              className="border-border bg-background h-9 rounded-md border px-2 text-sm capitalize"
            >
              {MARKETPLACE_CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </label>
          {category === 'other' && (
            <label className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs font-medium">
                Custom category (optional)
              </span>
              <input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Astrophysics"
                className="border-border bg-background h-9 rounded-md border px-2 text-sm"
              />
              <span
                className={`text-right text-xs ${
                  customTooLong ? 'text-red-500' : 'text-muted-foreground'
                }`}
              >
                {customCategory.trim().length}/{CUSTOM_CATEGORY_MAX}
              </span>
            </label>
          )}
        </div>
        <div className="mt-5 flex items-center justify-between">
          {listed ? (
            <button onClick={remove} disabled={loading} className="text-sm text-red-500">
              Unpublish
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className="border-border h-9 rounded-md border px-4 text-sm">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={loading || customTooLong}
              className="bg-primary text-primary-foreground h-9 rounded-md px-4 text-sm font-medium disabled:opacity-50"
            >
              {listed ? 'Save' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
