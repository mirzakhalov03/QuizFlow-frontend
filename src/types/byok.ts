export type ByokKey = {
  id: string
  keyName: string
  provider: string
  maskedKey: string
  createdAt: string
  updatedAt: string
  keyValue?: string
}

export type CreateByokPayload = {
  id: string
  keyName: string
  keyValue: string
  provider: string
}

export type UpdateByokPayload = {
  keyName?: string
  keyValue?: string
  provider?: string
}
