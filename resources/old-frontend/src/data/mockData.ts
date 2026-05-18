export interface User {
    id: string;
    name: string;
    avatar: string;
}

export interface Story {
    id: string;
    title: string;
    thumbnail: string;
    type: 'video' | 'voice' | 'photo' | 'document' | 'collection';
    author: string;
    date: string;
    description?: string;
    duration?: string;
    fileUrl?: string;
    audioUrl?: string;
    tags?: string[];
    assets?: {
        type: 'photo' | 'video' | 'document';
        url: string;
        title?: string;
    }[];
}

export interface Room {
    id: string;
    name: string;
    thumbnail: string;
    storyCount: number;
    members: User[];
    description: string;
}

export const mockUsers: User[] = [
    {
        id: '1',
        name: 'Adebayo',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    {
        id: '2',
        name: 'Chinwe',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    {
        id: '3',
        name: 'Kelechi',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    },
    {
        id: '4',
        name: 'Mama Adeyemi',
        avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80',
    },
];

export const mockNotifications = [
    {
        id: 'n1',
        type: 'reaction',
        title: 'New Reaction',
        message: 'Mama Adeyemi loved "The First Harvest" story.',
        time: '2 hours ago',
        unread: true,
        user: mockUsers[3],
    },
    {
        id: 'n2',
        type: 'story',
        title: 'New Story Added',
        message: 'Chinwe shared "Our First Trip to Lagos".',
        time: '5 hours ago',
        unread: true,
        user: mockUsers[1],
    },
    {
        id: 'n3',
        type: 'room',
        title: 'New Member',
        message: "Kelechi joined the Elders' Voices room.",
        time: '1 day ago',
        unread: false,
        user: mockUsers[2],
    },
];

export const mockStories: Story[] = [
    {
        id: 's1',
        title: "Grandma's Wedding Story",
        thumbnail:
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
        type: 'video',
        author: 'Adebayo',
        date: 'Oct 24, 2023',
        description:
            "A beautiful retelling of Grandma and Grandpa's wedding day in Benin City, 1968.",
        duration: '12:45',
        tags: ['Wedding', 'Nigeria', 'Family'],
    },
    {
        id: 's2',
        title: 'The First Journey to Lagos',
        thumbnail:
            'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&q=80',
        type: 'video',
        author: 'Chinwe',
        date: 'Nov 12, 2023',
        description:
            "Archive footage and narration about the family's first relocation to the coastal city.",
        duration: '08:20',
        tags: ['Travel', 'Lagos', 'History'],
    },
    {
        id: 's3',
        title: 'Arrival in London, 1974',
        thumbnail:
            'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
        type: 'photo',
        author: 'Adebayo',
        date: 'Jan 04, 1974',
        description:
            'A restored polaroid from the cold January morning the family landed at Heathrow.',
        tags: ['Migration', 'London', 'Archives'],
    },
];

export const mockRooms: Room[] = [
    {
        id: 'r1',
        name: "Elders' Voices",
        thumbnail:
            'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80',
        storyCount: 24,
        members: mockUsers,
        description: 'Oral histories and wisdom from our family veterans.',
    },
    {
        id: 'r2',
        name: 'Cultural Roots',
        thumbnail:
            'https://images.unsplash.com/photo-1523733566457-60d397e4205c?w=800&q=80',
        storyCount: 12,
        members: mockUsers.slice(0, 2),
        description: 'Documenting our traditions, recipes, and ancestral home.',
    },
    {
        id: 'r3',
        name: 'The Diaspora Journey',
        thumbnail:
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
        storyCount: 38,
        members: mockUsers,
        description:
            'Migration stories, first impressions, and building a new life.',
    },
    {
        id: 'r4',
        name: 'Legacy Films',
        thumbnail:
            'https://images.unsplash.com/photo-1492691523567-6119201a3bb6?w=800&q=80',
        storyCount: 5,
        members: mockUsers.slice(1),
        description: 'Professionally curated cinematic family documentaries.',
    },
];
