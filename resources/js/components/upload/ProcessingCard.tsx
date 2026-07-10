import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useProcessingStatus } from '@/hooks/use-processing-status';

interface ProcessingCardProps {
  mediaUuid: string
  title?: string
}

export function ProcessingCard({ mediaUuid, title }: ProcessingCardProps) {
  const { isProcessing, isReady, isFailed, status } = useProcessingStatus(mediaUuid)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center"
    >
      {isProcessing && (
        <>
          <Loader2 size={24} className="animate-spin text-amber-400" />
          <div>
            <p className="text-sm font-medium text-text-primary">
              {title || 'Processing media...'}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              This may take a few moments
            </p>
          </div>
        </>
      )}
      {isReady && (
        <p className="text-sm font-medium text-emerald-400">Media ready</p>
      )}
      {isFailed && (
        <div>
          <p className="text-sm font-medium text-red-400">Processing failed</p>
          {status?.url && (
            <p className="mt-1 text-xs text-text-muted">
              Original file may still be available
            </p>
          )}
        </div>
      )}
    </motion.div>
  )
}
