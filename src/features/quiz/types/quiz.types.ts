import { Word, QuizMode} from '@/types';

// クイズの設定
export interface QuizConfig {
  mode: QuizMode;
  wordCount: number;
  includeWeak?: boolean;
  includeNormal?: boolean;
  includeStrong?: boolean;
}

// クイズの問題
export interface QuizQuestionData {
  word: Word;
  question: string;
  correctAnswers: string[]; // 複数の正解を許容
}

// クイズの回答
export interface QuizAnswer {
  questionIndex: number;
  userAnswer: string;
  isCorrect: boolean;
  word: Word;
}

// クイズのステート
export interface QuizState {
  config: QuizConfig | null;
  questions: QuizQuestionData[];
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  isComplete: boolean;
}
