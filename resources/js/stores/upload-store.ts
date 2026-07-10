import { create } from 'zustand'
import type { UploadItem, ProcessingState } from '@/types/media'

interface UploadStore {
  uploads: UploadItem[]
  addUpload: (item: UploadItem) => void
  removeUpload: (id: string) => void
  updateProgress: (id: string, progress: number, speed: number, uploadedBytes: number, eta: number | null) => void
  updateStatus: (id: string, status: ProcessingState) => void
  updateStatusByUuid: (uuid: string, status: ProcessingState) => void
  updateMediaRef: (id: string, mediaUuid: string, mediaId: number) => void
  updateThumbnail: (id: string, thumbnailUrl: string) => void
  setError: (id: string, errorMessage: string) => void
  cancelUpload: (id: string) => void
  retryUpload: (id: string) => void
  clearCompleted: () => void
  clearAll: () => void
}

export const useUploadStore = create<UploadStore>((set) => ({
  uploads: [],

  addUpload: (item) =>
    set((state) => ({ uploads: [...state.uploads, item] })),

  removeUpload: (id) =>
    set((state) => ({ uploads: state.uploads.filter((u) => u.id !== id) })),

  updateProgress: (id, progress, speed, uploadedBytes, eta) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, progress, speed, uploadedBytes, eta } : u,
      ),
    })),

  updateStatus: (id, status) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, status } : u,
      ),
    })),

  updateStatusByUuid: (uuid, status) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.mediaUuid === uuid ? { ...u, status } : u,
      ),
    })),

  updateMediaRef: (id, mediaUuid, mediaId) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, mediaUuid, mediaId } : u,
      ),
    })),

  updateThumbnail: (id, thumbnailUrl) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, thumbnailUrl } : u,
      ),
    })),

  setError: (id, errorMessage) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, status: 'failed', errorMessage } : u,
      ),
    })),

  cancelUpload: (id) =>
    set((state) => {
      const item = state.uploads.find((u) => u.id === id)

      if (item) {
        item.cancelController.abort()
      }

      return { uploads: state.uploads.filter((u) => u.id !== id) }
    }),

  retryUpload: (id) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id
          ? {
              ...u,
              status: 'pending',
              progress: 0,
              speed: 0,
              uploadedBytes: 0,
              eta: null,
              errorMessage: null,
            }
          : u,
      ),
    })),

  clearCompleted: () =>
    set((state) => ({
      uploads: state.uploads.filter((u) => u.status !== 'ready' && u.status !== 'failed'),
    })),

  clearAll: () => set({ uploads: [] }),
}))
