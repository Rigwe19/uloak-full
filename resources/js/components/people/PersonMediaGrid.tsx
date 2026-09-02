import { Image, Video, FileText } from 'lucide-react';
import React from 'react';
import type { PersonMedia } from '@/types/person';

export default function PersonMediaGrid({ items }: { items: any[] }) {
    if (items.length === 0) {
        return (
            <div className="py-16 text-center text-sm text-text-muted italic">
                No media items yet.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((pm) => (
                <div
                    key={pm.id}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-border-subtle bg-surface"
                >
                    {pm.media?.type === 'image' ? (
                        <img
                            src={`/media/image/${pm.media.uuid}/300.jpg`}
                            alt=""
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : pm.media?.type === 'video' ? (
                        <div className="flex h-full w-full items-center justify-center bg-surface">
                            <Video size={32} className="text-text-muted/50" />
                        </div>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-surface">
                            <FileText
                                size={32}
                                className="text-text-muted/50"
                            />
                        </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="text-[10px] font-medium text-white capitalize">
                            {pm.role?.replace(/_/g, ' ')}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
