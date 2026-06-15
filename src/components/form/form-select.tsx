/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'
import { CustomSelect, type SelectOption } from '@/components/ui/select'
import FieldError from './form-error'
import FieldLabel from './form-label'
import { getNestedValue } from './input'

type FormSelectProps<
  TForm extends FieldValues,
  T extends Record<string, any> = Record<string, any>,
> = {
  name: Path<TForm>
  label?: string
  labelIcon?: ReactNode
  options: T[]
  disabled?: boolean
  required?: boolean
  setValue?: (val: string) => void
  control: Control<TForm>
  hideError?: boolean
  valueKey?: keyof T
  labelKey?: keyof T
  groupKey?: keyof T
  renderOption?: (item: T) => ReactNode
  placeholder?: string
  className?: string
}

export function FormSelect<
  TForm extends FieldValues,
  T extends Record<string, any> = Record<string, any>,
>({
  name,
  label,
  labelIcon,
  options,
  disabled,
  required,
  control,
  setValue,
  valueKey = 'value' as keyof T,
  labelKey = 'label' as keyof T,
  groupKey,
  hideError = false,
  renderOption,
  placeholder,
  className,
}: FormSelectProps<TForm, T>) {
  const error = getNestedValue(control._formState.errors, name)

  const selectOptions: SelectOption[] = options.map((option) => ({
    label: String(option[labelKey] ?? ''),
    value: String(option[valueKey] ?? ''),
    disabled: !!option.disabled,
    ...(groupKey && option[groupKey] != null && { group: String(option[groupKey]) }),
    ...(renderOption && {
      customRender: () => renderOption(option),
    }),
  }))

  return (
    <div className="w-full">
      {label && (
        <FieldLabel htmlFor={name} required={!!required} isError={!!error} icon={labelIcon}>
          {label}
        </FieldLabel>
      )}
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label || name} is required` } : {}}
        render={({ field }) => (
          <div className={label ? 'pt-0.5' : ''}>
            <CustomSelect
              options={selectOptions}
              placeholder={placeholder || 'Select...'}
              value={field.value}
              className={cn(
                !!error && '[&>button]:border-destructive! [&>button]:ring-destructive/20!',
                className
              )}
              onChange={(val) => {
                if (val === 'other') {
                  setValue?.(val)
                } else {
                  field.onChange(val)
                }
              }}
              disabled={disabled}
            />
          </div>
        )}
      />
      {!hideError && error && <FieldError>{error.message as string}</FieldError>}
    </div>
  )
}
