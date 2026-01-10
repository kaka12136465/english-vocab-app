// 基本的な単語データ型
export interface Word {
  id: string;
  english: string;
  japanese: string[];
  synonyms: string[];
  antonyms: string[];
  exampleSentence: string;
  pronunciation: string;
  audioUrl: string;
  createdAt?: Date; // 作成日時（オプション）
  wordBookId: string; // この単語を所有している単語帳のID
}

// 単語帳データ型
export interface WordBook {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  ownerId: string; // 単語帳の所有者ユーザーID
}

// ユーザーの学習進捗データ型
export interface UserProgress {
  id: string; // userId_wordId の形式
  userId: string;
  wordId: string;
  status: ProgressStatus;
  correctCount: number;
  totalAttempts: number;
  lastAttempted: Date;
}

// 進捗ステータス
export type ProgressStatus = 'weak' | 'normal' | 'strong';

// クイズの種類
export type QuizMode = 'english-to-japanese' | 'japanese-to-english' | 'audio-to-japanese';

// クイズ問題データ型
export interface QuizQuestion {
  word: Word;
  mode: QuizMode;
}

// クイズ結果データ型
export interface QuizResult {
  wordId: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  mode: QuizMode;
}

// クイズセッションデータ型
export interface QuizSession {
  questions: QuizQuestion[];
  currentIndex: number;
  results: QuizResult[];
  startedAt: Date;
}
