import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import FieldLabel from './form-label'
import FieldError from './form-error'
import { cn } from '@/lib/utils'
import { ClassNameValue } from 'tailwind-merge'

interface thisProps<TForm extends FieldValues> {
  name: Path<TForm>
  label?: string
  disabled?: boolean
  control: Control<TForm>
  required?: boolean
  hideError?: boolean
  wrapperClass?: ClassNameValue
  className?: ClassNameValue
}

export function FormCheckbox<TForm extends FieldValues>({
  name,
  label,
  disabled,
  control,
  required,
  hideError = true,
  wrapperClass,
  className,
}: thisProps<TForm>) {
  return (
    <div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className={cn('flex cursor-pointer items-center gap-2', wrapperClass)}>
            <Checkbox
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled || field.disabled}
              className={cn('-mt-1', className)}
              id={name}
            />
            <FieldLabel
              htmlFor={name}
              required={!!required}
              isError={!!control._formState.errors?.[name]}
            >
              {label}
            </FieldLabel>
          </div>
        )}
      />
      {!hideError && control._formState.errors?.[name] && (
        <FieldError>{control._formState.errors[name]?.message as string}</FieldError>
      )}
    </div>
  )
}
