import type { MediaStatus } from '@/types/media';

const API_BASE = '/api';

/**
 * Initialize upload and upload file directly to local storage.
 * Returns the media uuid, id, and thumbnail URL after successful upload.
 * Video processing happens asynchronously in the background.
 */
export async function requestSignedUpload(
    file: File,
    mediaType: 'photo' | 'video' | 'audio' | 'document',
): Promise<{
    media_uuid: string;
    media_id: number;
    thumbnail_url: string | null;
    status: string;
}> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120_000);

    try {
        const endpoint =
            mediaType === 'video'
                ? `${API_BASE}/media/videos/upload`
                : `${API_BASE}/media/images/upload`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'include',
            body: createFileFormData(file),
            signal: controller.signal,
        });

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));

            throw new Error(
                body.message || `Failed to upload (${response.status})`,
            );
        }

        const json = await response.json();

        return {
            media_uuid: json.data.uuid,
            media_id: json.data.id,
            thumbnail_url: json.data.thumbnail_url ?? null,
            status: json.data.status,
        };
    } finally {
        clearTimeout(timeoutId);
    }
}

function createFileFormData(file: File): FormData {
    const fd = new FormData();
    fd.append('file', file);

    return fd;
}

/**
 * Poll media status until processing is complete.
 * Returns the media status with updated progress.
 */
export async function pollMediaStatus(
    uuid: string,
    onProgress: (percentage: number) => void,
    signal: AbortSignal,
): Promise<MediaStatus> {
    const maxAttempts = 600; // 2 minutes max
    const intervalMs = 2000; // Check every 2 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (signal.aborted) {
            throw new Error('Upload polling cancelled');
        }

        try {
            const status = await fetchMediaStatus(uuid);

            // Map status to percentage
            let percentage = 0;

            if (status.status === 'ready') {
                percentage = 100;
                onProgress(100);

                return status;
            } else if (status.status === 'failed') {
                throw new Error(status.failed_reason || 'Processing failed');
            } else if (
                status.status === 'processing' ||
                status.status === 'uploading'
            ) {
                percentage = status.progress ?? 50;
                onProgress(percentage);
            } else if (status.status === 'queued') {
                percentage = 25; // Waiting in queue
                onProgress(25);
            }

            await new Promise((resolve) => setTimeout(resolve, intervalMs));
        } catch (error) {
            if (signal.aborted) {
                throw new Error('Upload polling cancelled');
            }

            throw error;
        }
    }

    throw new Error('Upload polling timed out');
}

/**
 * Fetch media status from the server.
 */
export async function fetchMediaStatus(uuid: string): Promise<MediaStatus> {
    const response = await fetch(`${API_BASE}/media/${uuid}`, {
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Media not found');
        }

        throw new Error(`Failed to fetch media status (${response.status})`);
    }

    const json = await response.json();

    return json.data as MediaStatus;
}

export function generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getFilePreviewUrl(file: File): string {
    return URL.createObjectURL(file);
}

export function revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
}
