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