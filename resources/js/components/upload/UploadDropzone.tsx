import { Upload } from 'lucide-react';
import type { ChangeEvent, DragEvent } from 'react';
import React, { useRef, useState } from 'react';

interface UploadDropzoneProps {
    onFilesSelected: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxSizeMB?: number;
    label?: string;
    disabled?: boolean;
}

export function UploadDropzone({
    onFilesSelected,
    accept,
    multiple = true,
    maxSizeMB = 50,
    label,
    disabled = false,
}: UploadDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length > 0) {
            onFilesSelected(files);
        }

        e.target.value = '';
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();

        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) {
            return;
        }

        const files = Array.from(e.dataTransfer.files);

        if (files.length > 0) {
            onFilesSelected(files);
        }
    };

    return (
        <div
            onClick={() => {
                if (!disabled) {
                    fileInputRef.current?.click();
                }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-all ${
                isDragging
                    ? 'border-accent-gold/60 bg-accent-gold/10'
                    : 'border-border-subtle bg-bg-dark/50 hover:border-accent-gold/40 hover:bg-accent-gold/5'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
            <Upload className="mx-auto mb-4 text-text-muted" size={40} />
            <span className="block text-sm font-medium text-text-primary">
                {label || 'Click to browse or drag and drop'}
            </span>
            <span className="mt-2 block text-xs text-text-muted">
                Max file size: {maxSizeMB}MB
            </span>
            {isDragging && (
                <span className="mt-3 block text-xs font-bold text-accent-gold">
                    Drop files here
                </span>
            )}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                multiple={multiple}
                accept={accept}
                disabled={disabled}
            />
        </div>
    );
}
