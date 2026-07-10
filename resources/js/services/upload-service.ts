import type { SignedUpload, MediaStatus } from '@/types/media';

const API_BASE = '/api';

export async function requestSignedUpload(
    mimeType: string,
    size: number,
    originalName: string,
): Promise<SignedUpload> {
    const response = await fetch(`${API_BASE}/media/video/sign`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({
            mime_type: mimeType,
            size,
            original_name: originalName,
        }),
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));

        throw new Error(
            body.message || `Failed to sign upload (${response.status})`,
        );
    }

    const json = await response.json();

    return json.data as SignedUpload;
}

export async function uploadToCloudinary(
    file: File,
    signed: SignedUpload,
    onProgress: (percentage: number) => void,
    signal: AbortSignal,
): Promise<{ mediaUuid: string; mediaId: number }> {
    return new Promise((resolve, reject) => {
        console.log(signed, signed.eager)
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signed.api_key);
        formData.append('public_id', signed.public_id);
        formData.append('folder', signed.folder);
        formData.append('signature', signed.signature);
        formData.append('timestamp', String(signed.timestamp));
        formData.append('upload_preset', signed.upload_preset);
        formData.append('eager', signed.eager);
        formData.append('eager_async', 'true');
        formData.append('eager_notification_url', signed.eager_notification_url);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', signed.url, true);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve({
                    mediaUuid: signed.media_uuid,
                    mediaId: signed.media_id,
                });
            } else {
                let message = `Upload failed (${xhr.status})`;

                try {
                    const body = JSON.parse(xhr.responseText);
                    message = body.error?.message || message;
                } catch {
                    /* ignore parse error */
                }

                reject(new Error(message));
            }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.onabort = () => reject(new Error('Upload cancelled'));

        signal.addEventListener('abort', () => {
            xhr.abort();
            reject(new Error('Upload cancelled'));
        });

        xhr.send(formData);
    });
}

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
