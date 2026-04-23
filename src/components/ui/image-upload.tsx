import { useEffect, useRef, useState } from 'react'
import { Pencil, UserCircle2 } from 'lucide-react'

export default function ImageUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const openPicker = () => {
    inputRef.current?.click()
  }

  const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(file))
  }

  return (
    <div className="border-border bg-muted/30 relative h-40 w-40 overflow-hidden rounded-2xl border">
      {previewUrl ? (
        <img src={previewUrl} alt="Profile preview" className="h-full w-full object-cover" />
      ) : (
        <div className="text-muted-foreground flex h-full w-full items-center justify-center">
          <UserCircle2 size={56} />
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
        accept="image/*"
        className="sr-only"
        onChange={onSelectImage}
      />
    </div>
  )
}
