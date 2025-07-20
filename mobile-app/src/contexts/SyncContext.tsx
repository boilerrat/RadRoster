import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useNetwork } from './NetworkContext';

type SyncStatus = 'synced' | 'pending' | 'failed' | 'syncing';

interface SyncContextType {
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  pendingChanges: number;
  syncData: () => Promise<void>;
  addPendingChange: (change: any) => void;
  clearPendingChanges: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

interface SyncProviderProps {
  children: ReactNode;
}

export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState<number>(0);
  const { isOnline } = useNetwork();

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingChanges > 0) {
      syncData();
    }
  }, [isOnline, pendingChanges]);

  const syncData = async (): Promise<void> => {
    if (!isOnline) {
      setSyncStatus('failed');
      return;
    }

    try {
      setSyncStatus('syncing');

      // TODO: Implement actual sync logic
      // This is a stub for Day 1
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate sync

      setSyncStatus('synced');
      setLastSyncTime(new Date());
      setPendingChanges(0);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('failed');
    }
  };

  const addPendingChange = (change: any): void => {
    setPendingChanges((prev) => prev + 1);
    setSyncStatus('pending');
  };

  const clearPendingChanges = (): void => {
    setPendingChanges(0);
    setSyncStatus('synced');
  };

  const value: SyncContextType = {
    syncStatus,
    lastSyncTime,
    pendingChanges,
    syncData,
    addPendingChange,
    clearPendingChanges,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
