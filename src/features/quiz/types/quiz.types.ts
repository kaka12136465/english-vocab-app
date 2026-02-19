import { Word} from '@/types';

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

// クイズの設定
export interface QuizSetting{
  quizMode: QuizMode; // クイズモード(英->和, 和->英, 音声->和)
  wordBookId: string; // 単語帳のID
  quizRange: [number, number]; // クイズの出題範囲(単語番号quizRange[0]~quizRange[1]の出題範囲)
  numberOfQuiz: number; // クイズの数
}

// ユーザーごとのクイズデータ
export interface UserQuizData {
  userId: string; // ユーザーID
  lastPlayQuizSetting: QuizSetting; // 前回このユーザが行ったクイズの設定
  wordWeaknesses: Record<string, boolean>; // 単語の得手不得手のリスト(登録外の単語は未学習単語)<単語ID, 
}
export const emptyUserQuizData: UserQuizData ={
  userId: "",
  lastPlayQuizSetting: {
    quizMode: 'english-to-japanese',
    wordBookId: '',
    quizRange: [0,0],
    numberOfQuiz: 0
  },
  wordWeaknesses: {},
}

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
