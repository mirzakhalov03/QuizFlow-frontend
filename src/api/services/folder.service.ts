import { api as axiosInstance } from '../axios-instance'

export const folderService = {
  getFolders: async () => {
    const response = await axiosInstance.get('/folders')
    return response.data
  },

  createFolder: async (name: string) => {
    const response = await axiosInstance.post('/folders', { name })
    return response.data
  },

  updateFolder: async (id: string, name: string) => {
    const response = await axiosInstance.put(`/folders/${id}`, { name })
    return response.data
  },

  deleteFolder: async (id: string) => {
    const response = await axiosInstance.delete(`/folders/${id}`)
    return response.data
  },

  getQuizzesInFolder: async (id: string) => {
    const response = await axiosInstance.get(`/folders/${id}/quizzes`)
    return response.data
  },

  moveQuizToFolder: async (quizId: string, folderId: string | null) => {
    const response = await axiosInstance.patch(`/folders/quizzes/${quizId}`, { folderId })
    return response.data
  },
}
