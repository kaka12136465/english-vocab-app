import { Word } from '@/types';
import { Timestamp } from 'firebase/firestore';

// 単語追加フォームのデータ
export interface AddWordFormData {
  english: string;
  japanese: string[];
  synonyms: string[];
  antonyms: string[];
  exampleSentence: string;
  pronunciation: string;
  index: number;
  description: string;
}

// ユーザー個別の単語（マイ単語帳）
export interface UserWord extends Word {
  userId: string;
  isPublic: boolean; // 他のユーザーと共有するか
  createdAt: Timestamp;
}

export interface EditWordFormData extends AddWordFormData{
  
}

// 単語の検証結果
export interface WordValidationResult {
  isValid: boolean;
  errors: string[];
}
