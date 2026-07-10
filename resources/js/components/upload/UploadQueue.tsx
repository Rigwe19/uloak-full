import { AnimatePresence } from 'framer-motion';
import type { UploadItem } from '@/types/media';
import { UploadQueueItem } from './UploadQueueItem';

interface UploadQueueProps {
  uploads: UploadItem[]
  onCancel?: (id: string) => void
  onRetry?: (id: string) => void
  onRemove?: (id: string) => void
  emptyMessage?: string
}

export function UploadQueue({ uploads, onCancel, onRetry, onRemove, emptyMessage }: UploadQueueProps) {
  if (uploads.length === 0) {
    return emptyMessage ? (
      <p className="py-4 text-center text-xs text-text-muted">{emptyMessage}</p>
    ) : null
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {uploads.map((item) => (
          <UploadQueueItem
            key={item.id}
            item={item}
            onCancel={onCancel}
            onRetry={onRetry}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
