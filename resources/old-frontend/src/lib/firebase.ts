// Mocked Firebase for Uloak
// No real connection to external services

export const db: any = {};
export const auth: any = {
    currentUser: null,
};

export enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
}

export function handleFirestoreError(
    error: unknown,
    operationType: OperationType,
    path: string | null,
) {
    console.error('Mock Firestore Error: ', operationType, path, error);
}

export const signInWithGoogle = async () => {
    return {
        email: 'user@uloak.com',
        displayName: 'Mock User',
        uid: 'mock-uid-123',
    };
};

export const logout = async () => {
    localStorage.removeItem('uloak_user');
};

export const doc = (...args: any[]) => ({});
export const getDoc = async (...args: any[]) => ({
    exists: () => false,
    data: () => ({}),
});
