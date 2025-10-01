export interface Question {
  id: number | string;
  q: string;
  a: string[];
}

export interface GameConfig {
  id: string;
  targetImage: string;
  targetTheme: string;
  targetName: string;
  targetMeaning: string;
  questions: Question[];
}

export interface Notification {
  title: string;
  message: string;
}

export interface CompletedPuzzle {
  id: string;
  name: string;
  completedAt: string; // ISO date string
}
