import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { useAuth } from './AuthContext';
import { NoteItem, VaultItem, CollectionItem, JournalEntry, VaultCategory } from '../types';

interface DataContextType {
  notes: NoteItem[];
  vaultItems: VaultItem[];
  collections: CollectionItem[];
  journals: JournalEntry[];
  loading: boolean;
  saveStatus: 'saved' | 'saving' | 'offline';

  // Notes CRUD
  createNote: (note: Partial<NoteItem>) => Promise<NoteItem>;
  updateNote: (id: string, updates: Partial<NoteItem>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>; // soft delete to trash
  restoreNote: (id: string) => Promise<void>;
  permanentlyDeleteNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;
  toggleFavoriteNote: (id: string) => Promise<void>;
  toggleArchiveNote: (id: string) => Promise<void>;

  // Vault Items CRUD
  createVaultItem: (item: Partial<VaultItem>) => Promise<VaultItem>;
  updateVaultItem: (id: string, updates: Partial<VaultItem>) => Promise<void>;
  deleteVaultItem: (id: string) => Promise<void>; // soft delete
  restoreVaultItem: (id: string) => Promise<void>;
  permanentlyDeleteVaultItem: (id: string) => Promise<void>;
  toggleFavoriteVaultItem: (id: string) => Promise<void>;
  toggleArchiveVaultItem: (id: string) => Promise<void>;

  // Collections CRUD
  createCollection: (col: Partial<CollectionItem>) => Promise<CollectionItem>;
  updateCollection: (id: string, updates: Partial<CollectionItem>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;

  // Journal CRUD
  createJournalEntry: (journal: Partial<JournalEntry>) => Promise<JournalEntry>;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;

  // Quick stats
  stats: {
    totalNotes: number;
    totalVaultItems: number;
    totalCollections: number;
    totalFavorites: number;
    totalArchived: number;
    totalTrash: number;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function safeId(): string {
  return 'bv_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline'>('saved');

  // Load cached data immediately on mount or user switch
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setVaultItems([]);
      setCollections([]);
      setJournals([]);
      setLoading(false);
      return;
    }

    try {
      const cachedNotes = localStorage.getItem(`bv_notes_${user.uid}`);
      if (cachedNotes) setNotes(JSON.parse(cachedNotes));

      const cachedVault = localStorage.getItem(`bv_vault_${user.uid}`);
      if (cachedVault) setVaultItems(JSON.parse(cachedVault));

      const cachedCols = localStorage.getItem(`bv_cols_${user.uid}`);
      if (cachedCols) setCollections(JSON.parse(cachedCols));

      const cachedJournals = localStorage.getItem(`bv_journals_${user.uid}`);
      if (cachedJournals) setJournals(JSON.parse(cachedJournals));
    } catch (e) {
      console.warn('Failed to read local cache:', e);
    }
  }, [user]);

  // Firestore real-time listeners
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const notesPath = `users/${user.uid}/notes`;
    const vaultPath = `users/${user.uid}/vault_items`;
    const colsPath = `users/${user.uid}/collections`;
    const journalsPath = `users/${user.uid}/journals`;

    const unsubs: (() => void)[] = [];

    // 1. Notes listener
    try {
      const qNotes = query(collection(db, notesPath));
      const unsubNotes = onSnapshot(
        qNotes,
        (snap) => {
          const list: NoteItem[] = [];
          snap.forEach((docSnap) => {
            list.push(docSnap.data() as NoteItem);
          });
          setNotes(list);
          try {
            localStorage.setItem(`bv_notes_${user.uid}`, JSON.stringify(list));
          } catch {}
          setLoading(false);
        },
        (error) => {
          console.error('Error listening to notes:', error);
          handleFirestoreError(error, OperationType.GET, notesPath);
        }
      );
      unsubs.push(unsubNotes);
    } catch (err) {
      console.warn('Notes onSnapshot setup error:', err);
    }

    // 2. Vault items listener
    try {
      const qVault = query(collection(db, vaultPath));
      const unsubVault = onSnapshot(
        qVault,
        (snap) => {
          const list: VaultItem[] = [];
          snap.forEach((docSnap) => {
            list.push(docSnap.data() as VaultItem);
          });
          setVaultItems(list);
          try {
            localStorage.setItem(`bv_vault_${user.uid}`, JSON.stringify(list));
          } catch {}
        },
        (error) => {
          console.error('Error listening to vault items:', error);
          handleFirestoreError(error, OperationType.GET, vaultPath);
        }
      );
      unsubs.push(unsubVault);
    } catch (err) {
      console.warn('Vault onSnapshot setup error:', err);
    }

    // 3. Collections listener
    try {
      const qCols = query(collection(db, colsPath));
      const unsubCols = onSnapshot(
        qCols,
        (snap) => {
          const list: CollectionItem[] = [];
          snap.forEach((docSnap) => {
            list.push(docSnap.data() as CollectionItem);
          });
          setCollections(list);
          try {
            localStorage.setItem(`bv_cols_${user.uid}`, JSON.stringify(list));
          } catch {}
        },
        (error) => {
          console.error('Error listening to collections:', error);
          handleFirestoreError(error, OperationType.GET, colsPath);
        }
      );
      unsubs.push(unsubCols);
    } catch (err) {
      console.warn('Collections onSnapshot setup error:', err);
    }

    // 4. Journals listener
    try {
      const qJournals = query(collection(db, journalsPath));
      const unsubJournals = onSnapshot(
        qJournals,
        (snap) => {
          const list: JournalEntry[] = [];
          snap.forEach((docSnap) => {
            list.push(docSnap.data() as JournalEntry);
          });
          setJournals(list);
          try {
            localStorage.setItem(`bv_journals_${user.uid}`, JSON.stringify(list));
          } catch {}
        },
        (error) => {
          console.error('Error listening to journals:', error);
          handleFirestoreError(error, OperationType.GET, journalsPath);
        }
      );
      unsubs.push(unsubJournals);
    } catch (err) {
      console.warn('Journals onSnapshot setup error:', err);
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [user]);

  // Notes operations
  const createNote = async (partial: Partial<NoteItem>): Promise<NoteItem> => {
    if (!user) throw new Error('Authentication required to create notes');
    setSaveStatus('saving');
    const id = partial.id || safeId();
    const newNote: NoteItem = {
      id,
      userId: user.uid,
      title: (partial.title || 'Untitled Note').trim().slice(0, 256),
      content: (partial.content || '').slice(0, 100000),
      category: (partial.category || 'Ideas & Thoughts').slice(0, 64),
      tags: (partial.tags || []).slice(0, 10).map((t) => t.trim().slice(0, 32)),
      isPinned: !!partial.isPinned,
      isFavorite: !!partial.isFavorite,
      isArchived: !!partial.isArchived,
      isDeleted: false,
      folderId: partial.folderId || '',
      attachments: (partial.attachments || []).slice(0, 5),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docPath = `users/${user.uid}/notes/${id}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'notes', id), newNote);
      setSaveStatus('saved');
      return newNote;
    } catch (error) {
      setSaveStatus('offline');
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  };

  const updateNote = async (id: string, updates: Partial<NoteItem>) => {
    if (!user) throw new Error('Authentication required');
    setSaveStatus('saving');
    const docPath = `users/${user.uid}/notes/${id}`;
    const cleanedUpdates: Partial<NoteItem> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (cleanedUpdates.title) {
      cleanedUpdates.title = cleanedUpdates.title.trim().slice(0, 256);
    }
    if (cleanedUpdates.content) {
      cleanedUpdates.content = cleanedUpdates.content.slice(0, 100000);
    }

    try {
      await setDoc(doc(db, 'users', user.uid, 'notes', id), cleanedUpdates, { merge: true });
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('offline');
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  };

  const deleteNote = async (id: string) => {
    await updateNote(id, { isDeleted: true });
  };

  const restoreNote = async (id: string) => {
    await updateNote(id, { isDeleted: false });
  };

  const permanentlyDeleteNote = async (id: string) => {
    if (!user) return;
    const docPath = `users/${user.uid}/notes/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notes', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  };

  const togglePinNote = async (id: string) => {
    const item = notes.find((n) => n.id === id);
    if (item) {
      await updateNote(id, { isPinned: !item.isPinned });
    }
  };

  const toggleFavoriteNote = async (id: string) => {
    const item = notes.find((n) => n.id === id);
    if (item) {
      await updateNote(id, { isFavorite: !item.isFavorite });
    }
  };

  const toggleArchiveNote = async (id: string) => {
    const item = notes.find((n) => n.id === id);
    if (item) {
      await updateNote(id, { isArchived: !item.isArchived });
    }
  };

  // Vault Items operations
  const createVaultItem = async (partial: Partial<VaultItem>): Promise<VaultItem> => {
    if (!user) throw new Error('Authentication required');
    setSaveStatus('saving');
    const id = partial.id || safeId();
    const newItem: VaultItem = {
      id,
      userId: user.uid,
      type: partial.type || 'url',
      title: (partial.title || 'Saved Vault Item').trim().slice(0, 256),
      url: (partial.url || '').slice(0, 2048),
      description: (partial.description || '').slice(0, 5000),
      content: (partial.content || '').slice(0, 50000),
      category: (partial.category || 'Research').slice(0, 64),
      tags: (partial.tags || []).slice(0, 10).map((t) => t.trim().slice(0, 32)),
      isFavorite: !!partial.isFavorite,
      isArchived: !!partial.isArchived,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docPath = `users/${user.uid}/vault_items/${id}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'vault_items', id), newItem);
      setSaveStatus('saved');
      return newItem;
    } catch (error) {
      setSaveStatus('offline');
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  };

  const updateVaultItem = async (id: string, updates: Partial<VaultItem>) => {
    if (!user) return;
    setSaveStatus('saving');
    const docPath = `users/${user.uid}/vault_items/${id}`;
    try {
      await setDoc(
        doc(db, 'users', user.uid, 'vault_items', id),
        { ...updates, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('offline');
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  };

  const deleteVaultItem = async (id: string) => {
    await updateVaultItem(id, { isDeleted: true });
  };

  const restoreVaultItem = async (id: string) => {
    await updateVaultItem(id, { isDeleted: false });
  };

  const permanentlyDeleteVaultItem = async (id: string) => {
    if (!user) return;
    const docPath = `users/${user.uid}/vault_items/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'vault_items', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  };

  const toggleFavoriteVaultItem = async (id: string) => {
    const item = vaultItems.find((v) => v.id === id);
    if (item) {
      await updateVaultItem(id, { isFavorite: !item.isFavorite });
    }
  };

  const toggleArchiveVaultItem = async (id: string) => {
    const item = vaultItems.find((v) => v.id === id);
    if (item) {
      await updateVaultItem(id, { isArchived: !item.isArchived });
    }
  };

  // Collections operations
  const createCollection = async (partial: Partial<CollectionItem>): Promise<CollectionItem> => {
    if (!user) throw new Error('Authentication required');
    const id = partial.id || safeId();
    const newCol: CollectionItem = {
      id,
      userId: user.uid,
      name: (partial.name || 'New Collection').trim().slice(0, 128),
      description: (partial.description || '').slice(0, 1000),
      icon: partial.icon || 'folder',
      color: partial.color || '#a855f7',
      itemCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docPath = `users/${user.uid}/collections/${id}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'collections', id), newCol);
      return newCol;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  };

  const updateCollection = async (id: string, updates: Partial<CollectionItem>) => {
    if (!user) return;
    const docPath = `users/${user.uid}/collections/${id}`;
    try {
      await setDoc(
        doc(db, 'users', user.uid, 'collections', id),
        { ...updates, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  };

  const deleteCollection = async (id: string) => {
    if (!user) return;
    const docPath = `users/${user.uid}/collections/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'collections', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  };

  // Journal operations
  const createJournalEntry = async (partial: Partial<JournalEntry>): Promise<JournalEntry> => {
    if (!user) throw new Error('Authentication required');
    const id = partial.id || safeId();
    const today = new Date().toISOString().split('T')[0];
    const newEntry: JournalEntry = {
      id,
      userId: user.uid,
      date: partial.date || today,
      title: (partial.title || 'Daily Reflection').trim().slice(0, 256),
      content: (partial.content || '').slice(0, 50000),
      mood: partial.mood || 'good',
      reflectionPrompt: (partial.reflectionPrompt || '').slice(0, 500),
      tags: (partial.tags || []).slice(0, 10).map((t) => t.trim().slice(0, 32)),
      isPrivate: partial.isPrivate ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docPath = `users/${user.uid}/journals/${id}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'journals', id), newEntry);
      return newEntry;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  };

  const updateJournalEntry = async (id: string, updates: Partial<JournalEntry>) => {
    if (!user) return;
    const docPath = `users/${user.uid}/journals/${id}`;
    try {
      await setDoc(
        doc(db, 'users', user.uid, 'journals', id),
        { ...updates, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  };

  const deleteJournalEntry = async (id: string) => {
    if (!user) return;
    const docPath = `users/${user.uid}/journals/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'journals', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  };

  // Computed statistics
  const stats = useMemo(() => {
    const activeNotes = notes.filter((n) => !n.isDeleted && !n.isArchived);
    const activeVault = vaultItems.filter((v) => !v.isDeleted && !v.isArchived);
    const favNotes = activeNotes.filter((n) => n.isFavorite).length;
    const favVault = activeVault.filter((v) => v.isFavorite).length;
    const archNotes = notes.filter((n) => n.isArchived && !n.isDeleted).length;
    const archVault = vaultItems.filter((v) => v.isArchived && !v.isDeleted).length;
    const trashNotes = notes.filter((n) => n.isDeleted).length;
    const trashVault = vaultItems.filter((v) => v.isDeleted).length;

    return {
      totalNotes: activeNotes.length,
      totalVaultItems: activeVault.length,
      totalCollections: collections.length,
      totalFavorites: favNotes + favVault,
      totalArchived: archNotes + archVault,
      totalTrash: trashNotes + trashVault,
    };
  }, [notes, vaultItems, collections]);

  return (
    <DataContext.Provider
      value={{
        notes,
        vaultItems,
        collections,
        journals,
        loading,
        saveStatus,
        createNote,
        updateNote,
        deleteNote,
        restoreNote,
        permanentlyDeleteNote,
        togglePinNote,
        toggleFavoriteNote,
        toggleArchiveNote,
        createVaultItem,
        updateVaultItem,
        deleteVaultItem,
        restoreVaultItem,
        permanentlyDeleteVaultItem,
        toggleFavoriteVaultItem,
        toggleArchiveVaultItem,
        createCollection,
        updateCollection,
        deleteCollection,
        createJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        stats,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
