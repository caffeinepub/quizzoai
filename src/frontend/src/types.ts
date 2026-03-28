export type Screen = "setup" | "test" | "result" | "profile";
export type MarksType = "1mark" | "2mark" | "5mark";
export type Board = "CBSE" | "RBSE" | "ICSE" | "Other";

export interface QuizConfig {
  className: string;
  board: Board;
  book: string;
  chapter: string;
  numQuestions: number;
  marksType: MarksType;
}

export interface Question {
  id: number;
  type: MarksType;
  question: string;
  options?: string[];
  correctAnswer: string;
}

export interface TestState {
  config: QuizConfig;
  questions: Question[];
  answers: Record<number, string>;
  submitted: boolean;
  startTime: number;
}

export interface HistoryEntry {
  id: string;
  date: string;
  className: string;
  board: string;
  book: string;
  chapter: string;
  score: number;
  total: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  provider: "google" | "facebook" | "guest";
  avatar?: string;
}
