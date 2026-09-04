export interface ValidationResult {
    valid: boolean;
    error?: string;
}

const MAX_VIDEO_SIZE = 700 * 1024 * 1024;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_VIDEO_MIMES = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
];
const ALLOWED_IMAGE_MIMES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
];
const ALLOWED_AUDIO_MIMES = [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
];
const ALLOWED_DOCUMENT_MIMES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
];

export function validateVideo(file: File): ValidationResult {
    if (!file || file.size === 0) {
        return { valid: false, error: 'No file selected.' };
    }

    const baseMime = file.type.split(';')[0].trim().toLowerCase();
    if (!ALLOWED_VIDEO_MIMES.includes(baseMime) && !ALLOWED_VIDEO_MIMES.includes(file.type)) {
        return {
            valid: false,
            error: `Unsupported video format: ${file.type || 'unknown'}. Use MP4, MOV, AVI, or WebM.`,
        };
    }

    if (file.size > MAX_VIDEO_SIZE) {
        return {
            valid: false,
            error: `File too large (${formatSize(file.size)}). Maximum size is 500MB.`,
        };
    }

    return { valid: true };
}

export function validateImage(file: File): ValidationResult {
    if (!file || file.size === 0) {
        return { valid: false, error: 'No file selected.' };
    }

    const baseMime = file.type.split(';')[0].trim().toLowerCase();
    if (!ALLOWED_IMAGE_MIMES.includes(baseMime) && !ALLOWED_IMAGE_MIMES.includes(file.type)) {
        return {
            valid: false,
            error: `Unsupported image format: ${file.type || 'unknown'}. Use JPEG, PNG, WebP, or GIF.`,
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File too large (${formatSize(file.size)}). Maximum size is 50MB.`,
        };
    }

    return { valid: true };
}

export function validateAudio(file: File): ValidationResult {
    if (!file || file.size === 0) {
        return { valid: false, error: 'No file selected.' };
    }

    const baseMime = file.type.split(';')[0].trim().toLowerCase();
    if (!ALLOWED_AUDIO_MIMES.includes(baseMime) && !ALLOWED_AUDIO_MIMES.includes(file.type)) {
        return {
            valid: false,
            error: `Unsupported audio format: ${file.type || 'unknown'}. Use MP3, WAV, OGG, or AAC.`,
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File too large (${formatSize(file.size)}). Maximum size is 50MB.`,
        };
    }

    return { valid: true };
}

export function validateDocument(file: File): ValidationResult {
    if (!file || file.size === 0) {
        return { valid: false, error: 'No file selected.' };
    }

    if (!ALLOWED_DOCUMENT_MIMES.includes(file.type)) {
        return {
            valid: false,
            error: `Unsupported document format: ${file.type || 'unknown'}. Use PDF, DOC, DOCX, or TXT.`,
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File too large (${formatSize(file.size)}). Maximum size is 50MB.`,
        };
    }

    return { valid: true };
}

export function validateFile(
    file: File,
    mediaType: 'photo' | 'video' | 'audio' | 'document',
): ValidationResult {
    switch (mediaType) {
        case 'photo':
            return validateImage(file);
        case 'video':
            return validateVideo(file);
        case 'audio':
            return validateAudio(file);
        case 'document':
            return validateDocument(file);
    }
}

export function formatSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds: number | null): string {
    if (seconds === null || seconds === undefined) {
        return '--:--';
    }

    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);

    return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatSpeed(bytesPerSecond: number): string {
    if (bytesPerSecond < 1024) {
        return `${bytesPerSecond.toFixed(0)} B/s`;
    }

    if (bytesPerSecond < 1024 * 1024) {
        return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    }

    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
}

export function formatEta(seconds: number | null): string {
    if (seconds === null || seconds === undefined || !isFinite(seconds)) {
        return '';
    }

    if (seconds < 60) {
        return `${Math.ceil(seconds)}s`;
    }

    if (seconds < 3600) {
        return `${Math.ceil(seconds / 60)}m`;
    }

    return `${Math.ceil(seconds / 3600)}h`;
}
