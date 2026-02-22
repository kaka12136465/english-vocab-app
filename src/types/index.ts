import { Timestamp } from "firebase/firestore";


// 単語追加フォームのデータ
export interface AddWordFormData {
  english: string;
  japanese: string[];
  synonyms: string[];
  antonyms: string[];
  exampleEnSentence: string;
  exampleJaSentence: string;
  partOfSpeech: string[];
  pronunciation: string;
  index: number;
  description: string;
}

export const defaultAddWordFormData: AddWordFormData = {
    english: '',
    japanese: [''],
    synonyms: [],
    antonyms: [],
    exampleEnSentence: '',
    exampleJaSentence: '',
    partOfSpeech: [],
    pronunciation: '',
    index: 0,
    description: ''
  };

// 基本的な単語データ型
export interface Word extends AddWordFormData {
  id: string;
  audioUrl: string;
  createdAt?: Timestamp; // 作成日時（オプション）
  wordBookId: string; // この単語を所有している単語帳のID
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


