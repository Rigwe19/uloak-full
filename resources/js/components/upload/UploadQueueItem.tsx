import { motion } from 'framer-motion';
import { X, RotateCcw, FileVideo, FileImage, FileAudio, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useProcessingStatus } from '@/hooks/use-processing-status';
import type { UploadItem } from '@/types/media';
import { formatSize } from '@/utils/media-validation';
import { UploadProgress } from './UploadProgress';
import { UploadStatusBadge } from './UploadStatusBadge';

interface UploadQueueItemProps {
  item: UploadItem
  onCancel?: (id: string) => void
  onRetry?: (id: string) => void
  onRemove?: (id: string) => void
}

function FileTypeIcon({ mimeType, size = 20 }: { mimeType: string; size?: number }) {
  const icons: Record<string, LucideIcon> = {
    video: FileVideo,
    image: FileImage,
    audio: FileAudio,
  }

  const prefix = mimeType.split('/')[0]
  const Icon = icons[prefix] || FileText

  return <Icon size={size} />
}

export function UploadQueueItem({ item, onCancel, onRetry, onRemove }: UploadQueueItemProps) {
  useProcessingStatus(item.mediaUuid)
  const isImage = item.file.type.startsWith('image/')
  const isActive = item.status === 'uploading' || item.status === 'processing' || item.status === 'queued'
  const isFinished = item.status === 'ready'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-bg-dark/50 p-4"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface">
        {isImage && item.previewUrl ? (
          <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <FileTypeIcon mimeType={item.file.type} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-xs font-medium text-text-primary">
            {item.file.name}
          </span>
          {!isActive && <UploadStatusBadge status={item.status} />}
        </div>
        <span className="text-[10px] text-text-muted">{formatSize(item.file.size)}</span>

        {(item.status === 'uploading' || item.status === 'processing') && (
          <UploadProgress
            percentage={item.progress}
            speed={item.speed}
            eta={item.eta}
            status={item.status}
          />
        )}
        {item.status === 'processing' && (
          <div className="flex items-center gap-2">
            <UploadStatusBadge status="processing" />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {item.status === 'failed' && onRetry && (
          <button
            onClick={() => onRetry(item.id)}
            className="rounded-full p-2 text-text-muted transition-colors hover:text-accent-gold"
            title="Retry"
          >
            <RotateCcw size={14} />
          </button>
        )}
        {isActive && onCancel && (
          <button
            onClick={() => onCancel(item.id)}
            className="rounded-full p-2 text-text-muted transition-colors hover:text-red-400"
            title="Cancel"
          >
            <X size={14} />
          </button>
        )}
        {isFinished && onRemove && (
          <button
            onClick={() => onRemove(item.id)}
            className="rounded-full p-2 text-text-muted transition-colors hover:text-red-400"
            title="Remove"
          >
            <X size={14} />
          </button>
        )}
        {!isActive && !isFinished && onRemove && (
          <button
            onClick={() => onRemove(item.id)}
            className="rounded-full p-2 text-text-muted transition-colors hover:text-red-400"
            title="Remove"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </motion.div>
  )
}
