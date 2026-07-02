import { useEffect, useMemo, useRef } from 'react'
import type { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form'

import { useGet } from '@/hooks/useGet'
import { useByokKeys } from '@/hooks/useByokKeys'
import { PaginatedResponse } from '@/types/api'
import { Folder } from '@/types/folder'

 
export function useQuizFormOptions<T extends FieldValues>(form: UseFormReturn<T>) {
  const { setValue, getValues } = form
  const { keys: byokKeys } = useByokKeys()
  const { data: foldersData } = useGet<PaginatedResponse<Folder>>('/folders', {
    params: { limit: 500 },
  })

  const folderOptions = useMemo(() => {
    const folders = foldersData?.data?.items || []
    return [
      { label: 'No Folder', value: 'none' },
      ...folders.map((f) => ({ label: f.name, value: f.id })),
    ]
  }, [foldersData?.data?.items])


  const byokOptions = useMemo(() => {
    return [
      { label: 'None (Use QuizFlow credits)', value: '' },
      ...byokKeys.map((key) => ({
        label: `${key.keyName} (${key.provider})`,
        value: key.id,
      })),
    ]
  }, [byokKeys])

  const byokDefaultApplied = useRef(false)
  useEffect(() => {
    if (byokDefaultApplied.current || byokKeys.length === 0) return
    const apiKeyId = 'apiKeyId' as Path<T>
    if (!getValues(apiKeyId)) {
      setValue(apiKeyId, byokKeys[0].id as PathValue<T, Path<T>>)
    }
    byokDefaultApplied.current = true
  }, [byokKeys, setValue, getValues])

  return { byokKeys, folderOptions, byokOptions }
}
