/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleFormError } from '@/lib/onError'
import axiosInstance from '@/api/axios-instance'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { AxiosRequestConfig } from 'axios'

export const deleteRequest = (url: string, config?: AxiosRequestConfig) =>
  axiosInstance.delete(`${url}`, config).then((res) => res.data)

export const useDelete = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: Partial<UseMutationOptions<any, any, string>>,
  config?: AxiosRequestConfig
) => {
  return useMutation<any, any, string>({
    mutationFn: (url) => deleteRequest(url, config),
    onError: (error) => handleFormError(error),
    ...(options || {}),
  })
}
