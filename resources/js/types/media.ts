export type ProcessingState =
    | 'pending'
    | 'queued'
    | 'uploading'
    | 'processing'
    | 'ready'
    | 'failed';

export interface UploadItem {
    id: string;
    file: File;
    previewUrl: string;
    status: ProcessingState;
    progress: number;
    speed: number;
    uploadedBytes: number;
    totalBytes: number;
    eta: number | null;
    mediaUuid: string | null;
    mediaId: number | null;
    thumbnailUrl: string | null;
    errorMessage: string | null;
    cancelController: AbortController;
    startedAt: number | null;
}

export interface SignedUpload {
    url: string;
    public_id: string;
    folder: string;
    signature: string;
    timestamp: number;
    upload_preset: string;
    api_key: string;
    media_uuid: string;
    media_id: number;
    eager: string;
    eager_notification_url: string;
}

export interface MediaStatus {
    id: string;
    original_name: string;
    mime_type: string;
    width: number | null;
    height: number | null;
    size: number;
    type: string;
    url: string | null;
    thumbnail: string | null;
    preview: string | null;
    status: string;
    provider: string;
    duration: number | null;
    sprite: Record<string, unknown> | null;
    failed_reason: string | null;
}

export interface UploadCallbacks {
    onProgress?: (itemId: string, percentage: number) => void;
    onComplete?: (itemId: string, mediaUuid: string, mediaId: number) => void;
    onError?: (itemId: string, error: string) => void;
}
