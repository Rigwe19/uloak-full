export interface FeedStory {
    id: number;
    title: string;
    type: string;
    description: string;
    author: string;
    email?: string;
    thumbnail: string | null;
    file_url: string | null;
    assets: { url: string; type: string; title: string }[];
    tags: string[];
    date: string;
    comments?: any[];
    comments_count?: number;
    follow_ups?: any[];
}

export interface FeedFilter {
    tab: string;
    tag: string | null;
    viewMode: 'grid' | 'list';
}

export interface PlaybackMemory {
    position: number;
    muted: boolean;
    volume: number;
    speed: number;
    timestamp: number;
}

export interface PaginatedResponse {
    data: FeedStory[];
    next_cursor: string | null;
    path: string;
    per_page: number;
}
