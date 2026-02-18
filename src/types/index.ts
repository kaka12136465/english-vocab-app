import { Timestamp } from "firebase/firestore";

// 基本的な単語データ型
export interface Word {
  id: string;
  english: string;
  japanese: string[];
  synonyms: string[];
  antonyms: string[];
  exampleSentence: string;
  pronunciation: string; // 発音
  audioUrl: string;
  createdAt?: Timestamp; // 作成日時（オプション）
  wordBookId: string; // この単語を所有している単語帳のID
  index: number; // インデックス
  description: string; // 単語の補足説明
}

export interface QuizSetting{
  quizMode: QuizMode; // クイズモード(英->和, 和->英, 音声->和)
  wordBookId: string; // 単語帳のID
  quizRange: [number, number]; // クイズの出題範囲(単語番号quizRange[0]~quizRange[1]の出題範囲)
  numberOfQuiz: number; // クイズの数
}

export interface UserData {
  userId: string; // ユーザーID
  lastPlayQuizSetting: QuizSetting; // 前回このユーザが行ったクイズの設定
  weakWordIds: string[]; // 苦手単語のIDリスト
  notWeakWordIds: string[]; // 苦手ではない単語のIDリスト(登録外の単語は未学習単語)
}

// 単語帳データ型
export interface WordBook {
  id: string;
  name: string;
  description?: string;
  createdAt: Timestamp;
  ownerId: string; // 単語帳の所有者ユーザーID
  wordsCnt: number; // 単語数
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
