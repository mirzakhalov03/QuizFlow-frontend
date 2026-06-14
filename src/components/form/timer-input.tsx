import { cn } from '@/lib/utils'
import { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { Input } from '../ui/input'
import FieldError from './form-error'
import FieldLabel from './form-label'

type Props<IForm extends FieldValues> = {
  methods: UseFormReturn<IForm>
  name: Path<IForm>
  label?: string
  required?: boolean
}

export function FormTimerInput<IForm extends FieldValues>({
  methods,
  name,
  label = 'Timer (minutes)',
  required = false,
}: Props<IForm>) {
  const {
    register,
    formState: { errors },
  } = methods

  const error = errors?.[name]

  return (
    <fieldset className="flex w-full flex-col">
      <FieldLabel htmlFor={name} required={required} isError>
        {label}
      </FieldLabel>

      <Input
        type="number"
        id={name}
        placeholder="Enter minutes"
        min={1}
        onKeyDown={(e) => {
          if (['-', 'e', 'E', '+'].includes(e.key)) {
            e.preventDefault()
          }
        }}
        className={cn('bg-secondary', error && 'border-destructive')}
        {...register(name, {
          required: required ? 'Timer is required' : false,
          min: { value: 1, message: 'Minimum 1 minute' },
          max: { value: 180, message: 'Max 180 minutes' },
        })}
      />

      {error && <FieldError>{error.message as string}</FieldError>}
    </fieldset>
  )
}
