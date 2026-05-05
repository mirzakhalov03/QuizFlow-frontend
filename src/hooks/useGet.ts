import axiosInstance from "@/api/axios-instance"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { AxiosRequestConfig } from "axios"

const DEFAULT_STALE_TIME = 1000 * 5 * 60

export const buildQueryKey = (url: string, params?: Record<string, unknown>) => {
    const paramValues = Object.values(params || {}).filter(
        (v) => v !== undefined && v !== null && v !== "",
    )
    return paramValues.length > 0 ? [url, ...paramValues] : [url]
}

export type UseGetArgs<TData = unknown, TQueryFnData = unknown, TError = unknown> = {
    options?: Partial<UseQueryOptions<TQueryFnData, TError, TData>>
    config?: Omit<AxiosRequestConfig, "params">
    params?: Record<string, unknown>
    enabled?: boolean
}

export const getRequest = (url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get(`/${url}/`, config).then((res) => res.data)

export const useGet = <TData = unknown, TQueryFnData = unknown, TError = unknown>(
    url: string,
    args?: UseGetArgs<TData, TQueryFnData, TError>,
) => {
    const { config, options, params, enabled = true } = args || {}
    const queryKey = buildQueryKey(url, params)

    return useQuery<TQueryFnData, TError, TData>({
        queryKey,
        queryFn: () =>
            getRequest(url, {
                ...config,
                params: {
                    ...params,
                    downloadUrl: undefined,
                    hasDate: undefined,
                    hasPassword: undefined,
                    excel_from_date: undefined,
                    excel_to_date: undefined,
                },
            }),
        staleTime: options?.staleTime ?? DEFAULT_STALE_TIME,
        enabled,
        ...options,
    })
}
