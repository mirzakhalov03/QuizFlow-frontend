import { handleFormError } from '@/lib/onError'
import axiosInstance from '@/api/axios-instance'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { AxiosRequestConfig } from 'axios'

export const deleteRequest = (url: string, config?: AxiosRequestConfig) =>
  axiosInstance.delete(`${url}`, config).then((res) => res.data)

export const useDelete = <TData = unknown>(
  options?: Partial<UseMutationOptions<TData, unknown, string>>,
  config?: AxiosRequestConfig
) => {
  return useMutation<TData, unknown, string>({
    mutationFn: (url) => deleteRequest(url, config),
    onError: (error) => handleFormError(error),
    ...(options || {}),
  })
}
