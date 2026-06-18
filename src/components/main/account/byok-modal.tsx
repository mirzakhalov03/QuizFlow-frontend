import FormInput from '@/components/form/input'
import { FormSelect } from '@/components/form/form-select'
import Button from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { usePatch } from '@/hooks/usePatch'
import { usePost } from '@/hooks/usePost'
import { toast } from '@/lib/toast'
import { ByokKey } from '@/types/byok'
import { useGlobalStore } from '@/store/global-store'
import { useModal } from '@/hooks/useModal'
import { BYOK_BY_ID, BYOK } from '@/constants/api-endpoints'

const PROVIDER_OPTIONS = [
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'openai', label: 'OpenAI - Coming soon', disabled: true },
  { value: 'anthropic', label: 'Anthropic - Coming soon', disabled: true },
  { value: 'google', label: 'Google - Coming soon', disabled: true },
  { value: 'other', label: 'Other - Coming soon', disabled: true },
]

export default function ByokModal() {
  const queryClient = useQueryClient()
  const { getData } = useGlobalStore()
  const { closeModal } = useModal('byok-modal')
  const item = getData<ByokKey>(BYOK)
  const form = useForm<ByokKey>({
    defaultValues: {
      ...item,
    },
  })
  const { handleSubmit, reset, control } = form

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [BYOK] })
    toast.success(item ? 'Key updated successfully!' : 'New key added!')
    reset()
    closeModal()
  }
  const { mutate: editMutate, isPending: isUpdating } = usePatch({ onSuccess })
  const { mutate: addMutate, isPending: isCreating } = usePost({ onSuccess })

  const onSubmit = (value: ByokKey) => {
    if (item) {
      editMutate(BYOK_BY_ID(item.id), value)
    } else {
      addMutate(BYOK, value)
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <FormInput
        methods={form}
        name="keyName"
        label="Key Name"
        placeholder="e.g. My OpenAI Key"
        required
      />

      <FormSelect
        control={control}
        name="provider"
        label="Provider"
        options={PROVIDER_OPTIONS}
        required
        labelKey="label"
        valueKey="value"
      />

      <FormInput methods={form} name="keyValue" label="API Key" type="password" required={!item} />
      {item?.id && (
        <p className="text-muted-foreground text-xs italic">Leave blank to keep current key.</p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button type="submit" loading={isCreating || isUpdating}>
          {item?.id ? 'Update Key' : 'Add Key'}
        </Button>
      </div>
    </form>
  )
}
