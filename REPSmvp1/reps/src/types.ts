export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  completions: string[]; // ISO date strings (YYYY-MM-DD)
  streak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
}

export interface AppState {
  username: string;
  habits: Habit[];
  theme: 'light' | 'dark';
}
