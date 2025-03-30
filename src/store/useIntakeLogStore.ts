
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IntakeLogEntry {
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
}

export const useIntakeLogStore = create<IntakeLogState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'sticker-intake-log',
    }
  )
);
