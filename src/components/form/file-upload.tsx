import { Control, FieldValues, Path, useController } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { X, Upload } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '../ui/button'
import { FileUploader } from 'react-drag-drop-files'
import Spinner from '../ui/spinner'
import FieldLabel from './form-label'
import FieldError from './form-error'
import { Input } from '../ui/input'

type TProps<Form extends FieldValues> = {
  control: Control<Form>
  name: Path<Form>
  label?: string
  required?: boolean
  wrapperClassName?: string
  multiple?: boolean
  isCompressed?: boolean
  maxLength?: number
  maxSize?: number
  isPaste?: boolean
  dropAccept?: string[]
  hideError?: boolean
  hideClearable?: boolean
}

export default function FileUpload<TForm extends FieldValues>({
  control,
  name,
  label,
  required = false,
  wrapperClassName,
  multiple = false,
  isCompressed = true,
  maxSize = 10,
  maxLength = 5,
  dropAccept = ['JPG', 'PNG', 'JPEG'],
  isPaste = true,
  hideError = true,
  hideClearable = false,
}: TProps<TForm>) {
  const maxS = maxSize * 1024 * 1024
  const [isCompressing, setIsCompressing] = useState(false)

  const {
    field: { value, onChange, ...field },
    fieldState,
  } = useController({
    control,
    name,
    // @ts-expect-error defsdf
    defaultValue: multiple ? [] : undefined,
    rules: {
      validate: (val) => {
        // 1. Required Check
        if (required && (!val || (Array.isArray(val) && val.length === 0))) {
          return 'This field is required'
        }

        // 2. Multi-file Checks
        if (multiple && Array.isArray(val)) {
          if (val.length > maxLength) {
            return `Maximum ${maxLength} files allowed`
          }

          let totalSize = 0
          const sizeLimitMessage = isCompressed
            ? `Total file size after compression exceeds ${maxSize} MB`
            : `Total file size exceeds ${maxSize} MB`

          for (let i = 0; i < val.length; i++) {
            totalSize += val[i]?.size || 0

            // As soon as the threshold is breached, bail out immediately with the string!
            if (totalSize > maxS) {
              return sizeLimitMessage
            }
          }
        }

        // 3. Single File Check
        if (!multiple && val) {
          if (val.size > maxS) {
            return isCompressed
              ? `File size after compression exceeds ${maxSize} MB`
              : `File size exceeds ${maxSize} MB`
          }
        }

        return true
      },
    },
  })

  // Memoize fileArray to prevent unnecessary re-renders
  const fileArray: File[] = useMemo(() => {
    return !multiple ? (value ? [value] : []) : value || []
  }, [multiple, value])

  const fileUrls = useMemo(() => {
    const urls: Record<string, string> = {}

    fileArray.forEach((file, index) => {
      if (file instanceof File) {
        const key = `${file.name}-${file.size}-${index}`
        urls[key] = URL.createObjectURL(file)
      }
    })

    return urls
  }, [fileArray])

  useEffect(() => {
    return () => {
      Object.values(fileUrls).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [fileUrls])

  const getFileUrl = (file: File, index: number) => {
    const key = `${file.name}-${file.size}-${index}`
    return fileUrls[key]
  }

  async function handleOnChange(files: File[]) {
    if (files.length > 0) {
      if (isCompressed && files[0].type.includes('image')) {
        setIsCompressing(true)
        // TODO: Implement actual image compression logic here
        setIsCompressing(false)
        onChange(multiple ? [...files, ...fileArray] : files[0])
      } else {
        onChange(multiple ? [...files, ...fileArray] : files[0])
      }
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    if (e.clipboardData.files.length) {
      handleOnChange([e.clipboardData.files[0]])
    }
  }

  return (
    <fieldset className={cn('flex w-full min-w-48 flex-col', wrapperClassName)}>
      {label && (
        <FieldLabel isError={!!fieldState.error} required={required}>
          {label}
        </FieldLabel>
      )}
      {isPaste && (
        <Input {...field} onPaste={onPaste} tabIndex={0} placeholder="(CTRL+V)" fullWidth />
      )}

      <FileUploader
        classes="mt-2 w-full"
        handleChange={
          field.disabled
            ? undefined
            : (val) => {
                if (multiple) {
                  handleOnChange(Array.from((val as unknown as FileList) || []))
                } else {
                  handleOnChange([val as File])
                }
              }
        }
        maxSize={maxSize}
        multiple={multiple}
        name={field.name}
        types={dropAccept}
      >
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/30 hover:border-primary/60 rounded-xl py-6 px-4 w-full cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40 text-center',
            !!fieldState.error && 'border-destructive/40 hover:border-destructive/60 bg-destructive/5',
            field.disabled && 'border-muted-foreground/30 bg-muted/10 cursor-not-allowed pointer-events-none'
          )}
        >
          <Upload className={cn('h-7 w-7 text-primary/80', !!fieldState.error && 'text-destructive/80', field.disabled && 'text-muted-foreground/60')} />
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium text-foreground">
              Drag &amp; drop files, or <span className="text-primary hover:underline font-semibold">browse</span>
            </p>
          </div>
        </div>
      </FileUploader>

      {fieldState.error && !hideError && <FieldError>{fieldState.error?.message}</FieldError>}

      <article className={fileArray?.length ? 'space-y-3 pt-4' : ''}>
        {isCompressing && (
          <div className="grid place-items-center pb-3">
            <Spinner />
          </div>
        )}
        <div
          className={cn(
            fileArray.length &&
              'border-border max-h-40 space-y-1 overflow-y-auto rounded-lg border p-1.5'
          )}
        >
          {fileArray.map((file, index) => {
            if (!(file instanceof File)) {
              return null
            }
            const url = getFileUrl(file, index)
            if (!url) return null

            return (
              <main
                key={index}
                className="hover:bg-muted/50 flex items-center justify-between gap-4 rounded-md px-2 py-1"
              >
                <a
                  className="inline-block truncate text-sm text-blue-500"
                  target="_blank"
                  href={url}
                  rel="noreferrer noopener"
                >
                  {file.name}
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive!"
                  leftIcon={<X width={18} />}
                  onClick={() => onChange(fileArray.filter((_, i) => i !== index))}
                  disabled={field.disabled}
                />
              </main>
            )
          })}
        </div>
        {fileArray.length > 0 && !hideClearable && (
          <div className="grid place-items-end">
            <Button
              variant="destructive"
              type="button"
              onClick={() => onChange([])}
              disabled={field.disabled}
            >
              Clear
            </Button>
          </div>
        )}
      </article>
    </fieldset>
  )
}
