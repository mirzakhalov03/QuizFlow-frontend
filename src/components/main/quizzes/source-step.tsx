import { useController, useWatch, type UseFormReturn } from 'react-hook-form'
import { ClipboardPaste, ClipboardType, FileText, X } from 'lucide-react'

import NotionLogo from '@/assets/notionLogo.png'
import FileUpload from '@/components/form/file-upload'
import FieldLabel from '@/components/form/form-label'
import Spinner from '@/components/ui/spinner'
import Button from '@/components/ui/button'
import { MouseTooltip } from '@/components/ui/mouse-tooltip'
import { useNotionPages } from '@/hooks/useNotionPages'
import { useHasNotionIntegration } from '@/hooks/useHasNotionIntegration'
import type { QuizFormValues } from '@/components/main/quizzes/utils'
import { PASTED_TEXT_MAX, PASTED_TEXT_MIN, validatePastedText } from '@/lib/pasted-text'
import { toast } from '@/lib/toast'

/** Screen 1 — pick a source (file, pasted text, or Notion) and provide it. */
export default function SourceStep({ form }: { form: UseFormReturn<QuizFormValues> }) {
  const source = useWatch({ control: form.control, name: 'source' })
  const { hasIntegration: hasNotion } = useHasNotionIntegration()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <SourceToggle
          active={source === 'file'}
          onClick={() => form.setValue('source', 'file')}
          icon={<FileText className="h-4 w-4 text-blue-600" />}
          label="Upload File"
          shortLabel="Upload"
        />
        <SourceToggle
          active={source === 'text'}
          onClick={() => form.setValue('source', 'text')}
          icon={<ClipboardType className="h-4 w-4 text-emerald-600" />}
          label="Paste Text"
          shortLabel="Paste"
        />
        <MouseTooltip
          disabled={hasNotion}
          content={
            <>
              Connect Notion in the <strong>Account</strong> page.
            </>
          }
          className="max-w-[180px]"
          wrapperClassName="h-full"
        >
          <SourceToggle
            active={source === 'notion'}
            disabled={!hasNotion}
            onClick={() => form.setValue('source', 'notion')}
            icon={<img src={NotionLogo} alt="Notion" className="h-4 w-4" />}
            label="Notion"
            badge={!hasNotion ? 'Not connected' : undefined}
          />
        </MouseTooltip>
      </div>

      {source === 'file' && <FileSource form={form} />}
      {source === 'text' && <TextSource form={form} />}
      {source === 'notion' && <NotionSource form={form} />}
    </div>
  )
}

function SourceToggle({
  active,
  disabled,
  onClick,
  icon,
  label,
  shortLabel,
  badge,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  shortLabel?: string
  badge?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        // Mobile: a compact horizontal chip, so three sources fit one row
        // without the labels wrapping mid-word. `min-h-10` keeps the tap
        // target comfortable despite the tighter padding.
        'relative flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full border-2 px-2 py-2 text-center text-[11px] font-semibold transition-all',
        // Desktop: a stacked card, kept tight — the badge is taken out of flow
        // below so one source carrying it can't stretch the whole row.
        'sm:h-full sm:min-h-0 sm:flex-col sm:items-center sm:justify-center sm:gap-1.5 sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm',
        active
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card/50 enabled:hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-40',
      ].join(' ')}
    >
      <span className="sm:bg-muted inline-flex shrink-0 items-center justify-center sm:h-7 sm:w-7 sm:rounded-lg">
        {icon}
      </span>
      <span className="leading-tight sm:hidden">{shortLabel ?? label}</span>
      <span className="hidden leading-tight sm:inline">{label}</span>
      {badge && (
        // Hidden in the chip (no room — the disabled styling carries it) and
        // absolute on the card so it adds no height.
        <span className="bg-muted text-muted-foreground absolute top-1.5 right-1.5 hidden rounded-full px-1.5 py-px text-[9px] leading-tight font-medium sm:inline-block">
          {badge}
        </span>
      )}
    </button>
  )
}

/**
 * Reading the clipboard needs a user gesture and a permission grant in every
 * browser — there is no way to peek at it when the modal opens and offer what
 * the user already copied. So it's an explicit button, and Ctrl+V still works
 * for anyone who denies the prompt or is on a browser without the API.
 */
const canReadClipboard = typeof navigator !== 'undefined' && !!navigator.clipboard?.readText

function TextSource({ form }: { form: UseFormReturn<QuizFormValues> }) {
  const { field, fieldState } = useController({
    control: form.control,
    name: 'pastedText',
    rules: { validate: validatePastedText },
  })

  const length = (field.value ?? '').trim().length
  const isOver = length > PASTED_TEXT_MAX

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text.trim()) {
        // Neither branch here is a failure — an empty clipboard or a declined
        // permission prompt are both normal, so they read as info, not error.
        toast.info('Nothing on your clipboard yet — copy some text first')
        return
      }
      field.onChange(text)
    } catch {
      toast.info('Clipboard access is blocked — you can still paste with Ctrl+V')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <FieldLabel required isError={!!fieldState.error}>
          Paste Your Content
        </FieldLabel>
        {canReadClipboard && (
          <button
            type="button"
            onClick={pasteFromClipboard}
            className="text-primary hover:bg-primary/10 -mt-1 flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium transition-colors"
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            Paste from clipboard
          </button>
        )}
      </div>
      <textarea
        {...field}
        rows={9}
        autoFocus
        placeholder="Paste lecture notes, an article, documentation — anything you want to be quizzed on."
        className={[
          'border-border bg-background focus:ring-primary/40 w-full resize-y rounded-md border px-3 py-2 text-sm leading-relaxed focus:ring-2 focus:outline-none',
          fieldState.error ? 'border-destructive' : '',
        ].join(' ')}
      />
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted-foreground/80 pl-1 text-[11px] leading-relaxed">
          Plain text or Markdown · At least {PASTED_TEXT_MIN} characters
        </p>
        <span
          className={[
            'shrink-0 text-[11px] tabular-nums',
            isOver ? 'text-destructive font-medium' : 'text-muted-foreground/80',
          ].join(' ')}
        >
          {length.toLocaleString()} / {PASTED_TEXT_MAX.toLocaleString()}
        </span>
      </div>
      {fieldState.error && <p className="text-destructive text-xs">{fieldState.error.message}</p>}
    </div>
  )
}

function FileSource({ form }: { form: UseFormReturn<QuizFormValues> }) {
  return (
    <div className="space-y-2">
      <FileUpload
        label="Source Documents"
        control={form.control}
        name="files"
        required
        multiple
        isPaste={false}
        maxSize={25}
        maxLength={5}
        hideError={false}
        dropAccept={['PDF', 'DOC', 'DOCX', 'TXT', 'MD', 'PPTX']}
      />
      <p className="text-muted-foreground/80 pl-1 text-[11px] leading-relaxed">
        PDF, Word, PPTX, TXT, or Markdown (.md) · Max 25 MB · Up to 5 files
      </p>
    </div>
  )
}

function NotionSource({ form }: { form: UseFormReturn<QuizFormValues> }) {
  const { pages, loading, error, refetch } = useNotionPages()
  const { field, fieldState } = useController({
    control: form.control,
    name: 'pageIds',
    rules: { validate: (v) => (v as string[]).length > 0 || 'Select at least one page' },
  })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }
  if (error) {
    return (
      <div className="space-y-3">
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">{error}</div>
        <Button onClick={refetch} variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  const selectedIds: string[] = field.value ?? []
  const selectedPages = pages.filter((p) => selectedIds.includes(p.id))
  const unselectedPages = pages.filter((p) => !selectedIds.includes(p.id))

  return (
    <div className="space-y-2">
      <FieldLabel required isError={!!fieldState.error}>
        Add Notion Pages
      </FieldLabel>
      <select
        className="border-border bg-background focus:ring-primary/40 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:opacity-50"
        value=""
        disabled={unselectedPages.length === 0}
        onChange={(e) => {
          if (e.target.value) field.onChange([...selectedIds, e.target.value])
        }}
      >
        <option value="" disabled>
          {unselectedPages.length ? 'Choose a page…' : 'All pages selected'}
        </option>
        {unselectedPages.map((p) => (
          <option key={p.id} value={p.id}>
            {p.icon ? `${p.icon} ${p.title}` : p.title}
          </option>
        ))}
      </select>
      {selectedPages.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedPages.map((p) => (
            <span
              key={p.id}
              className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
            >
              {p.icon && <span>{p.icon}</span>}
              {p.title}
              <button
                type="button"
                onClick={() => field.onChange(selectedIds.filter((id) => id !== p.id))}
                className="hover:text-primary/70 ml-0.5"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      {fieldState.error && <p className="text-destructive text-xs">{fieldState.error.message}</p>}
    </div>
  )
}
