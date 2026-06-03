/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleFormError } from '@/lib/onError'
import { putRequest } from '@/hooks/usePatch'
import { MutateOptions, useMutation, UseMutationOptions } from '@tanstack/react-query'
import { AxiosRequestConfig } from 'axios'

export const usePut = <P = any, D = any>(
  options?: Partial<UseMutationOptions<D, any, { url: string; payload: P }>>,
  config?: AxiosRequestConfig
) => {
  const mutation = useMutation<D, any, { url: string; payload: P }>({
    mutationFn: ({ url, payload }) => putRequest(url, payload, config),
    onError: (error) => handleFormError(error),
    ...(options || {}),
  })

  const mutate = (
    url: string,
    payload: P,
    mutateOptions?: MutateOptions<D, any, { url: string; payload: P }, unknown>
  ) => {
    mutation.mutate({ url, payload }, mutateOptions)
  }

  const mutateAsync = (
    url: string,
    payload: P,
    mutateOptions?: MutateOptions<D, any, { url: string; payload: P }, unknown>
  ) => mutation.mutateAsync({ url, payload }, mutateOptions)

  return { ...mutation, mutate, mutateAsync }
}
