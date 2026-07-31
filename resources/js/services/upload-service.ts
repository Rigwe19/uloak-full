import type { SignedUpload, MediaStatus } from '@/types/media';

const API_BASE = '/api';

const RESOURCE_TYPE_MAP: Record<string, string> = {
    photo: 'image',
    video: 'video',
    audio: 'video',
    document: 'raw',
};

// Files above this size will be uploaded in 20MB chunks
const CHUNK_THRESHOLD = 100 * 1024 * 1024; // 100MB
const CHUNK_SIZE = 20 * 1024 * 1024; // 20MB per chunk

export async function requestSignedUpload(
    mimeType: string,
    size: number,
    originalName: string,
    mediaType?: string,
): Promise<SignedUpload> {
    const resourceType = mediaType ? RESOURCE_TYPE_MAP[mediaType] ?? 'auto' : 'video';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    try {
        const response = await fetch(`${API_BASE}/media/sign`, {
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
                resource_type: resourceType,
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));

            throw new Error(
                body.message || `Failed to sign upload (${response.status})`,
            );
        }

        const json = await response.json();

        return json.data as SignedUpload;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Upload a file to Cloudinary.
 *
 * For files > 100MB, the file is sliced into 20MB chunks and uploaded
 * sequentially with Content-Range headers so no single request hangs
 * for too long. Each chunk has its own 5-minute timeout.
 */
export async function uploadToCloudinary(
    file: File,
    signed: SignedUpload,
    onProgress: (percentage: number) => void,
    signal: AbortSignal,
): Promise<{ mediaUuid: string; mediaId: number }> {
    if (file.size <= CHUNK_THRESHOLD) {
        return uploadSingle(file, signed, onProgress, signal);
    }

    return uploadChunked(file, signed, onProgress, signal);
}

/**
 * Single-shot upload for files under the chunk threshold.
 */
function uploadSingle(
    file: File,
    signed: SignedUpload,
    onProgress: (percentage: number) => void,
    signal: AbortSignal,
): Promise<{ mediaUuid: string; mediaId: number }> {
    return new Promise((resolve, reject) => {
        const formData = buildFormData(file, signed);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', signed.url, true);
        xhr.timeout = 30 * 60 * 1000; // 30 min for single large uploads

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve({ mediaUuid: signed.media_uuid, mediaId: signed.media_id });
            } else {
                reject(new Error(parseCloudinaryError(xhr)));
            }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.ontimeout = () => reject(new Error('Upload timed out. Try a smaller file or a more stable connection.'));
        xhr.onabort = () => reject(new Error('Upload cancelled'));

        signal.addEventListener('abort', () => { xhr.abort(); reject(new Error('Upload cancelled')); }, { once: true });

        xhr.send(formData);
    });
}

/**
 * Chunked upload for files over the threshold.
 *
 * Slices the file into 20MB chunks and sends each as a separate POST
 * with a Content-Range header. Progress is reported cumulatively.
 */
async function uploadChunked(
    file: File,
    signed: SignedUpload,
    onProgress: (percentage: number) => void,
    signal: AbortSignal,
): Promise<{ mediaUuid: string; mediaId: number }> {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = `uloak_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        if (signal.aborted) {
            throw new Error('Upload cancelled');
        }

        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const isLast = chunkIndex === totalChunks - 1;

        await uploadChunk(chunk, signed, start, end, file.size, uploadId, isLast, signal);

        const loaded = Math.min(start + CHUNK_SIZE, file.size);
        const pct = Math.round((loaded / file.size) * 100);
        onProgress(Math.min(pct, 100));
    }

    return { mediaUuid: signed.media_uuid, mediaId: signed.media_id };
}

function uploadChunk(
    chunk: Blob,
    signed: SignedUpload,
    start: number,
    end: number,
    totalSize: number,
    uploadId: string,
    isLast: boolean,
    signal: AbortSignal,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const formData = buildFormDataChunked(chunk, signed, isLast);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', signed.url, true);
        xhr.timeout = 5 * 60 * 1000; // 5 min per chunk

        xhr.setRequestHeader('Content-Range', `bytes ${start}-${end - 1}/${totalSize}`);
        xhr.setRequestHeader('X-Unique-Upload-Id', uploadId);

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
            } else {
                reject(new Error(parseCloudinaryError(xhr)));
            }
        };

        xhr.onerror = () => reject(new Error('Network error during chunk upload'));
        xhr.ontimeout = () => reject(new Error(`Chunk ${Math.floor(start / (20 * 1024 * 1024)) + 1} timed out.`));
        xhr.onabort = () => reject(new Error('Upload cancelled'));

        signal.addEventListener('abort', () => { xhr.abort(); reject(new Error('Upload cancelled')); }, { once: true });

        xhr.send(formData);
    });
}

function buildFormData(file: File | Blob, signed: SignedUpload): FormData {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('api_key', signed.api_key);
    fd.append('public_id', signed.public_id);
    fd.append('folder', signed.folder);
    fd.append('signature', signed.signature);
    fd.append('timestamp', String(signed.timestamp));
    fd.append('upload_preset', signed.upload_preset);
    fd.append('eager', signed.eager);
    fd.append('eager_async', 'true');
    fd.append('eager_notification_url', signed.eager_notification_url);
    return fd;
}

function buildFormDataChunked(chunk: Blob, signed: SignedUpload, isLast: boolean): FormData {
    const fd = new FormData();
    fd.append('file', chunk);
    fd.append('api_key', signed.api_key);
    fd.append('public_id', signed.public_id);
    fd.append('folder', signed.folder);
    fd.append('signature', signed.signature);
    fd.append('timestamp', String(signed.timestamp));
    fd.append('upload_preset', signed.upload_preset);
    fd.append('eager', signed.eager);
    fd.append('eager_async', 'true');
    fd.append('eager_notification_url', signed.eager_notification_url);
    if (isLast) {
        fd.append('chunk_overwrite', 'true');
    }
    return fd;
}

function parseCloudinaryError(xhr: XMLHttpRequest): string {
    try {
        const body = JSON.parse(xhr.responseText);
        return body.error?.message || `Upload failed (${xhr.status})`;
    } catch {
        return `Upload failed (${xhr.status})`;
    }
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