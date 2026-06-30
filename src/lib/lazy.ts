import type { ComponentType } from 'react'
import type { LoaderFunction, ActionFunction } from 'react-router-dom'

type LazyModule = Promise<{
  default: ComponentType
  loader?: LoaderFunction
  action?: ActionFunction
  ErrorBoundary?: ComponentType
}>

export const lazyPage = (importer: () => LazyModule) => async () => {
  const mod = await importer()
  return {
    Component: mod.default,
    loader: mod.loader,
    action: mod.action,
    ErrorBoundary: mod.ErrorBoundary,
  }
}
