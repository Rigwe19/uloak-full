import { useEffect, useRef } from 'react';

const REVERB_URL = import.meta.env.VITE_REVERB_URL as string | undefined;
const REVERB_KEY = import.meta.env.VITE_REVERB_KEY as string | undefined;

export function useMediaRealtime(uuid: string | null, onStatusChange: (status: string) => void) {
  const fallbackRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!uuid) return;

    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    const url = REVERB_URL ? `${protocol}://${REVERB_URL}/app/${REVERB_KEY}` : null;

    if (!url) {
      // Fallback: poll every 3s
      fallbackRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/media/${uuid}`, {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          });

          if (!res.ok) throw new Error();

          const { data } = await res.json();

          if (data.status === 'ready' || data.status === 'failed') {
            onStatusChange(data.status);
          }
        } catch {
          // silent
        }
      }, 3000);

      return () => {
        if (fallbackRef.current) clearInterval(fallbackRef.current);
      };
    }
  }, [uuid, onStatusChange]);
}
// </parameter>
// <task_progress>
// - [x] 3. Update MediaRepository::createFromUpload() — accept status/processing_started_at/thumbnail
// - [x] 2. Rewrite ProcessMediaVideo job — ffmpeg pipeline + status ready/failed + events (cleaned up)
// - [x] 1. Refactor LocalFfmpegVideoProcessor::upload() — async (store + poster + create with status:processing + dispatch)
// - [x] 4. MediaController: add thumbnail URL + status to uploadVideo response
// - [x] 5. upload-service.ts: fix uuid mapping + add uploadProgress() helper
// - [ ] 6. use-media-upload.ts: wire video processing state + progress
// - [ ] 7. Add Reverb Echo hook/use-media-realtime.ts with poll fallback
// - [ ] 8. UploadQueueItem.tsx: poster thumbnail + processing progress (remove console.log)
// - [ ] 9. AnnexMemoryModal: allow save while status processing
// - [ ] 10. Add Reverb: composer reverb, pnpm echo+pusher-js, config/broadcasting.php, .env.example keys
// - [ ] 11. Write Pest feature test for async video upload + job (status processing → ready/failed)
// - [ ] 12. Run pint + tests + tsc/eslint
// </parameter>
// </write_to_file>