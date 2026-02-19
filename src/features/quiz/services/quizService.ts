import { Word } from '@/types';
import { emptyUserQuizData, QuizMode, QuizQuestionData, QuizSetting, UserQuizData } from '../types/quiz.types';
import { requestGemini } from '@/lib/geminiRequestService';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * クイズの問題文を生成
 */
export const generateQuestion = (word: Word, mode: QuizMode): QuizQuestionData => {
  switch (mode) {
    case 'english-to-japanese':
      return {
        word,
        question: word.english,
        correctAnswers: word.japanese,
      };
    
    case 'japanese-to-english':
      return {
        word,
        question: word.japanese[0], // 最初の日本語訳を使用
        correctAnswers: [word.english],
      };
    
    case 'audio-to-japanese':
      return {
        word,
        question: `音声を聞いて日本語訳を答えてください`,
        correctAnswers: word.japanese,
      };
    
    default:
      throw new Error('Invalid quiz mode');
  }
};

/**
 * ユーザーの回答が正解かどうかをチェック
 */
export const checkAnswer = (
  userAnswer: string,
  correctAnswers: string[]
): boolean => {
  const normalizedUserAnswer = userAnswer.trim().toLowerCase();
  
  return correctAnswers.some(correctAnswer => {
    const normalizedCorrectAnswer = correctAnswer.trim().toLowerCase();
    return normalizedUserAnswer === normalizedCorrectAnswer;
  });
};

/**
 * 和訳の正誤確認
 * 英単語と日本単語が与えられ、その日本単語が英単語の和訳として正しいか判別する
 */
export const checkCorrectTranslation = async (english: string, japanese: string) => {
  try{
    if(english.length > 100){
      throw new Error("英単語の入力が長すぎます。100文字以下にしてください。");
    }
    const prompt = english + "の和訳として「"+japanese+"」は正しい？\n条件：\n1. 意味が一致していること\n2. 品詞が一致していること（形容詞→形容詞的訳、名詞→名詞的訳、副詞→副詞的訳など）\ntrue,falseのみ出力";

    const response = await requestGemini(prompt);
    return response;
  }catch(err){
    console.error(err);
    throw new Error("和訳のチェックに失敗しました。");
  }
}

/**
 * 音声を再生（Web Speech API使用）
 */
export const playAudio = (text: string, lang: string = 'en-US'): void => {
  if ('speechSynthesis' in window) {
    // 既存の音声を停止
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8; // 少しゆっくり再生
    utterance.pitch = 1;
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.error('Web Speech API is not supported in this browser');
    alert('お使いのブラウザは音声再生に対応していません');
  }
};

/**
 * 音声再生を停止
 */
export const stopAudio = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * クイズ結果のサマリーを計算
 */
export interface QuizSummary {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
}

export const calculateQuizSummary = (
  totalQuestions: number,
  correctAnswers: number
): QuizSummary => {
  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers: totalQuestions - correctAnswers,
    accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
  };


};

export const updateLastPlayQuizSettingOfUser = async (userId: string, quizSetting: QuizSetting) => {
  const docRef = doc(db, "userQuizDatas", userId);
  await updateDoc(docRef, {lastPlayQuizSetting: quizSetting});
}

export const updateWordWeaknessForUser = async (userQuizData: UserQuizData, word: Word, isWeak: boolean) => {
  const docRef = doc(db, "userQuizDatas", userQuizData.userId);
  await updateDoc(docRef, {
    [`wordWeaknesses.${word.id}`]: isWeak,
  });
  console.log("登録", word.english, isWeak);
}

export const fetchUserQuizData = async (userId: string): Promise<UserQuizData> => {
  const docRef = doc(db, "userQuizDatas", userId);
  const userQuizData = (await getDoc(docRef)).data();
  return userQuizData as UserQuizData;
}

export const resisterNewUserQuizData = async (userId: string): Promise<void> => {
  const docRef = doc(db, "userQuizDatas", userId);
  await setDoc(docRef, {...emptyUserQuizData, userId: userId});
}