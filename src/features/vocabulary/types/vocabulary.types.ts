import { WordData } from '@/types';

export interface EditWordFormData extends WordData{
  
}

// 単語の検証結果
export interface WordValidationResult {
  isValid: boolean;
  errors: string[];
}
