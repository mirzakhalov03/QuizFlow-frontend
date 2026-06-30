import { FieldValues, Path, RegisterOptions, UseFormReturn } from 'react-hook-form'
import { cn } from '@/lib/utils'
import FieldLabel from './form-label'
import FieldError from './form-error'
import { ClassNameValue } from 'tailwind-merge'
import { getNestedValue } from './input'

type IProps<IForm extends FieldValues> = {
  methods: UseFormReturn<IForm>
  name: Path<IForm>
  label?: string
  required?: boolean
  registerOptions?: RegisterOptions<IForm>
  wrapperClassName?: ClassNameValue
  hideError?: boolean
}

export function FormTextarea<IForm extends FieldValues>({
  methods,
  name,
  label,
  required = false,
  registerOptions,
  wrapperClassName,
  className,
  hideError = false,
  ...props
}: IProps<IForm> & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const {
    register,
    formState: { errors },
  } = methods

  const reg = register(name, {
    required: required ? `${label || name} is required` : false,
    ...registerOptions,
    disabled: props.disabled,
  })

  const { disabled, ...otherProps } = props
  const error = getNestedValue(errors, name)

  return (
    <fieldset className={cn('flex w-full flex-col', wrapperClassName)}>
      {label && (
        <FieldLabel htmlFor={name} required={required} isError={!!error}>
          {label}
        </FieldLabel>
      )}
      <div className={cn('relative', label && 'mt-0.5')}>
        <textarea
          {...reg}
          {...otherProps}
          disabled={disabled || methods.formState.disabled}
          placeholder={props.placeholder || label || 'Enter text...'}
          id={name}
          rows={props.rows || 4}
          className={cn(
            'no-time-icon bg-popover border-input focus-visible:ring-ring',
            'flex w-full rounded-md border px-3 py-2',
            'text-sm transition-colors',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground',
            'focus-visible:ring-1 focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'min-h-20 resize-y',
            !!error && 'border-destructive focus-visible:ring-destructive/20',
            className
          )}
        />
        {props.maxLength && (
          <div className="text-muted-foreground absolute right-2 bottom-1 text-xs">
            {methods.watch(name)?.length || 0}/{props.maxLength}
          </div>
        )}
      </div>
      {!hideError && errors[name] && <FieldError>{errors[name]?.message as string}</FieldError>}
    </fieldset>
  )
}

export default FormTextarea
