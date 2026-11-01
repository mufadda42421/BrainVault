export type VaultCategory = 
  | 'All'
  | 'Work' 
  | 'Study' 
  | 'Tech & Code' 
  | 'Ideas & Thoughts' 
  | 'Research' 
  | 'Personal' 
  | 'Books & Reading' 
  | 'Projects'
  | 'Other';

export interface NoteItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  folderId?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export type VaultItemType = 'url' | 'article' | 'youtube' | 'image' | 'pdf' | 'document' | 'idea' | 'research';

export interface VaultItem {
  id: string;
  userId: string;
  type: VaultItemType;
  title: string;
  url?: string;
  description: string;
  content?: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  id: string;
  userId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type JournalMood = 'great' | 'good' | 'neutral' | 'reflective' | 'challenging';

export interface JournalEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  mood: JournalMood;
  reflectionPrompt?: string;
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  theme?: 'dark' | 'light' | 'system';
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface ConnectionResult {
  sourceTitle: string;
  targetTitle: string;
  connectionReason: string;
  suggestedAction?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  referencedNotes?: { id: string; title: string }[];
}

export type ActiveView = 
  | 'dashboard'
  | 'notes'
  | 'vault'
  | 'assistant'
  | 'collections'
  | 'favorites'
  | 'journal'
  | 'archive'
  | 'trash'
  | 'settings';
