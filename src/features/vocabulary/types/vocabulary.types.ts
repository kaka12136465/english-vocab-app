import { Word } from '@/types';

// 単語追加フォームのデータ
export interface AddWordFormData {
  english: string;
  japanese: string[];
  synonyms: string[];
  antonyms: string[];
  exampleSentence: string;
  pronunciation: string;
}

// ユーザー個別の単語（マイ単語帳）
export interface UserWord extends Word {
  userId: string;
  isPublic: boolean; // 他のユーザーと共有するか
  createdAt: Date;
}

export interface EditWordFormData extends AddWordFormData{
  
}

// 単語の検証結果
export interface WordValidationResult {
  isValid: boolean;
  errors: string[];
}
