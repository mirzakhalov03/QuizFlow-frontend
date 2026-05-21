export const INTEGRATION_PROVIDERS = ['google', 'notion'] as const
export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number]

export type Integration = {
  id: string
  provider: IntegrationProvider
  createdAt: string
  updatedAt: string
}
