import { motion } from 'framer-motion';

interface UploadProgressProps {
  percentage: number
  speed: number
  eta: number | null
  status: string
}

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) {
return `${bytesPerSecond.toFixed(0)} B/s`
}

  if (bytesPerSecond < 1024 * 1024) {
return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`
}

  return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`
}

export function UploadProgress({ percentage, speed, eta, status }: UploadProgressProps) {
  const displayPercentage = Math.min(percentage, 100)

  return (
    <div className="w-full space-y-2">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent-gold to-amber-400"
          initial={{ width: 0 }}
          animate={{ width: `${displayPercentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
        <span>{displayPercentage}%</span>
        {status === 'uploading' && (
          <span>
            {eta !== null && isFinite(eta) ? `${Math.ceil(eta)}s remaining` : speed > 0 ? `${formatSpeed(speed)}` : ''}
          </span>
        )}
        {status === 'processing' && (
          <span>Processing...</span>
        )}
      </div>
    </div>
  )
}
