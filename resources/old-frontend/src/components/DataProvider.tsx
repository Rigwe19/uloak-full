import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
    mockRooms as initialRooms,
    mockStories as initialStories,
    Room,
    Story,
    User,
    mockUsers,
} from '../data/mockData';

interface DataContextType {
    rooms: Room[];
    stories: Story[];
    addRoom: (room: Omit<Room, 'id' | 'storyCount' | 'members'>) => void;
    addStory: (story: Omit<Story, 'id'>) => void;
    updateRoom: (roomId: string, updates: Partial<Room>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [rooms, setRooms] = useState<Room[]>(initialRooms);
    const [stories, setStories] = useState<Story[]>(initialStories);

    const addRoom = (roomData: Omit<Room, 'id' | 'storyCount' | 'members'>) => {
        const newRoom: Room = {
            ...roomData,
            id: `r-${Date.now()}`,
            storyCount: 0,
            members: [mockUsers[0]], // Assuming current user is the first mock user
        };
        setRooms((prev) => [...prev, newRoom]);
    };

    const addStory = (storyData: Omit<Story, 'id'>) => {
        const newStory: Story = {
            ...storyData,
            id: `s-${Date.now()}`,
        };
        setStories((prev) => [newStory, ...prev]);

        // Also update room story count if we can find which room it belongs to
        // In this mock, we'll just assume it's for whatever room is currently active or matched by name/context
        // But for now, just adding to the global list is enough for "persist until refresh"
    };

    const updateRoom = (roomId: string, updates: Partial<Room>) => {
        setRooms((prev) =>
            prev.map((r) => (r.id === roomId ? { ...r, ...updates } : r)),
        );
    };

    return (
        <DataContext.Provider
            value={{ rooms, stories, addRoom, addStory, updateRoom }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
