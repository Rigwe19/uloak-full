export type Person = {
    id: number;
    uuid: string;
    type: string;
    living_status: string;
    is_featured: boolean;
    is_owner: boolean;
    name: string;
    legal_name?: string;
    nickname?: string;
    gender?: string;
    birth_date?: string;
    death_date?: string;
    birth_place?: string;
    biography?: string;
    age_visibility: string;
    avatar_url?: string | null;
};

export type PersonStats = {
    stories: number;
    photos: number;
    videos: number;
    relationships: number;
    timeline_events: number;
    contributions: number;
};

export type RelationshipNode = {
    id: number;
    person_id: number;
    name: string;
    relationship_type: string;
    kind: string;
    status: string;
    direction: 'outgoing' | 'incoming';
    called_them?: string;
    called_me?: string;
    closeness?: number;
};

export type FamilyTree = {
    person: PersonNode;
    ancestors: TreeNode[];
    descendants: TreeNode[];
    siblings: SiblingNode[];
    spouses: SpouseNode[];
};

export type PersonNode = {
    id: number;
    uuid: string;
    name: string;
    living_status: string;
    type: string;
};

export type TreeNode = {
    person: PersonNode;
    relationship_type: string;
    kind: string;
    ancestors?: TreeNode[];
    descendants?: TreeNode[];
};

export type SiblingNode = {
    person: PersonNode;
    kind: string;
};

export type SpouseNode = {
    person: PersonNode;
    status: string;
};

export type TimelineEvent = {
    id: number;
    person_id: number;
    event_type: string;
    title: string;
    description?: string;
    date?: string;
    location?: string;
    media?: any;
    sort_order: number;
    created_at: string;
};

export type PermissionEntry = {
    id: number;
    person_id: number;
    grantee_type: string;
    grantee_id?: number;
    ability: string;
    allowed: boolean;
    inherited_from?: string;
};

export type ConsentEntry = {
    id: number;
    person_id: number;
    consent_type: string;
    status: string;
    version: number;
    evidence?: string;
    expires_at?: string;
    withdrawn_at?: string;
};