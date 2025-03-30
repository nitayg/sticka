
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface IntakeLogEntry {
  timestamp: number;
  albumId: string;
  albumName: string;
  source: string;
  sourceDetails?: string;
  newStickers: (number | string)[];
  newDuplicates: (number | string)[];
  updatedDuplicates: (number | string)[];
}

interface IntakeLogState {
  intakeLog: IntakeLogEntry[];
  addLogEntry: (entry: Omit<IntakeLogEntry, 'timestamp'>) => void;
  clearLog: () => void;
  getRecentEntries: (limit: number) => IntakeLogEntry[];
}

export const useIntakeLogStore = create<IntakeLogState>()(
  persist(
    (set, get) => ({
      intakeLog: [],
      
      addLogEntry: (entry) => set((state) => ({
        intakeLog: [
          {
            ...entry,
            timestamp: Date.now(),
          },
          ...state.intakeLog,
        ]
      })),
      
      clearLog: () => set({ intakeLog: [] }),
      
      // Added helper method to get only the most recent entries
      // This helps minimize memory usage when displaying logs
      getRecentEntries: (limit) => {
        const { intakeLog } = get();
        return intakeLog.slice(0, limit);
      }
    }),
    {
      name: 'sticker-intake-log',
    }
  )
);
