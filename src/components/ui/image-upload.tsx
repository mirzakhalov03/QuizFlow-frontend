import { useEffect, useRef, useState } from 'react'
import { Pencil, UserCircle2 } from 'lucide-react'
import { toast } from '@/lib/toast'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 15

type Props = {
  value?: string | null
  onChange?: (file: File) => void
  loading?: boolean
}

export default function ImageUpload({ value, onChange, loading }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [localPreview, setLocalPreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (localPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview)
      }
    }
  }, [localPreview])

  const openPicker = () => {
    inputRef.current?.click()
  }

  const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP and GIF images are allowed.')
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_SIZE_MB} MB.`)
      return
    }

    if (localPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview)
    }

    const blobUrl = URL.createObjectURL(file)

    setLocalPreview(blobUrl)

    onChange?.(file)
  }

  const imageSrc = localPreview ?? value ?? null

  return (
    <div className="border-border bg-muted/30 relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border sm:h-40 sm:w-40">
      {imageSrc ? (
        <img src={imageSrc} alt="Profile" key={imageSrc} className="h-full w-full object-cover" />
      ) : (
        <div className="text-muted-foreground flex h-full w-full items-center justify-center">
          <UserCircle2 size={56} />
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white">
          Uploading...
        </div>
      )}
      <button
        type="button"
        onClick={openPicker}
        className="bg-background hover:bg-accent border-border absolute right-2 bottom-2 inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-colors"
        aria-label="Upload profile image"
      >
        <Pencil size={15} />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="sr-only"
        onChange={onSelectImage}
      />
    </div>
  )
}
