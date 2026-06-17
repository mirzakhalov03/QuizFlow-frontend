import { create } from 'zustand'

export type PendingJob = {
  jobId: string
  title: string
  type: string
  status: 'uploading' | 'generating' | 'failed'
  error?: string
  folderId?: string
}

type PendingJobsStore = {
  jobs: PendingJob[]
  addJob: (job: Omit<PendingJob, 'status'>) => void
  setJobReady: (tempId: string, realJobId: string) => void
  removeJob: (jobId: string) => void
  markJobFailed: (jobId: string, error?: string) => void
}

export const usePendingJobsStore = create<PendingJobsStore>((set) => ({
  jobs: [],
  addJob: (job) => set((state) => ({ jobs: [...state.jobs, { ...job, status: 'uploading' }] })),
  setJobReady: (tempId, realJobId) =>
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.jobId === tempId ? { ...j, jobId: realJobId, status: 'generating' } : j
      ),
    })),
  removeJob: (jobId) => set((state) => ({ jobs: state.jobs.filter((j) => j.jobId !== jobId) })),
  markJobFailed: (jobId, error) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.jobId === jobId ? { ...j, status: 'failed', error } : j)),
    })),
}))
