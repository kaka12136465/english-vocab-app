import { useCallback } from 'react';
import { Word, QuizMode} from '@/types';
import { QuizAnswer, QuizQuestionData, QuizState } from '../types/quiz.types';
import * as quizService from '../services/quizService';
import {getProgressStats, updateUserProgress } from '@/features/userProgress/services/progressService';
import { checkCorrectTranslation } from '../services/quizService';
import { getWordsInWordBook, updateWord } from '@/features/vocabulary/services/wordBookService';

interface useQuizProps {
  userId: string | null;
  wordBookId: string;
  mode: QuizMode;
  words: Word[];  // 指定単語帳の全単語
  wordCount: number; // 出題数
  quizRange?: [number, number]; // 出題範囲(指定しないなら全範囲)
  quizState: QuizState;
  setTargetWords: (words: Word[]) => void;
  setMode: (mode: QuizMode) => void;
  setWordCount: (wordCount: number) => void;
  setQuizState: (quizState: QuizState) => void;
}

interface useQuizReturnProps{
  currentQuestion: QuizQuestionData;
  initializeQuiz: () => Promise<void>;
  submitAnswer:(userAnswer: string) => Promise<boolean>;
  nextQuestion:() => Promise<void>;
  resetQuiz: (words: Word[]) => void;
  playQuestionAudio:() => void;
  getQuizSummary: () => quizService.QuizSummary;
  checkUserAnswer: () => Promise<boolean>;
  addJpToEnWord: (word: Word, japanese: string) => Promise<void>;
}

/**
 * クイズ機能を管理するカスタムフック
 */
export const useQuiz: (data: useQuizProps) => useQuizReturnProps = ({userId, wordBookId, words, mode, wordCount, quizRange, quizState, setTargetWords, setMode, setWordCount, setQuizState}) => {
  setMode;
  setWordCount;
  /**
   * クイズをリセット
   * 与えられた単語リストからwordCount分の単語をランダムに選び、クイズを初期化する
   */
  const resetQuiz = useCallback((words: Word[]) => {
    if(!mode){
      console.error("クイズのモードが選択されていません");
      return;
    }

    // ランダムにシャッフル
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const selectedWords = shuffled.slice(0, Math.min(wordCount, shuffled.length));
    const questions = selectedWords.map(word => 
      quizService.generateQuestion(word, mode)
    );

    const newQuizState: QuizState = {
      config: { mode, wordCount },
      questions: questions,
      currentQuestionIndex: 0,
      answers: [],
      isComplete: false,
    };

    setQuizState(newQuizState);
  }, [mode, wordCount, words]);

  /**
   * クイズを初期化する
   * 指定の単語帳から全単語を取得し、そこからquizRangeに基づいて単語を抽出する
   */
  const initializeQuiz = useCallback(async () => {
    if(!mode){
      console.error("クイズのモードが選択されていません");
      return;
    }

    const words = await getWordsInWordBook(wordBookId);
    const range = quizRange ? [Math.max(1, Number(quizRange[0])), Math.min(words.length, Number(quizRange[1]))] : [0, words.length];
    const rangeWords = words.filter((word) => {
      return word.index >= range[0] && word.index <= range[1];
    });
    
    if(rangeWords.length === 0){
      console.error("指定された範囲に単語が存在しません");
      alert("指定された範囲に単語が存在しません");
      throw new Error("指定された範囲に単語が存在しません");
    }

    await setTargetWords(rangeWords);
    await resetQuiz(rangeWords);
  }, [mode, wordCount]);

  

  /**
   * 「回答する」ボタンを押すと呼ばれる
   *  解答の正誤を確かめ、その結果をquizState.answerに追加する。
   *  
   */
  const submitAnswer = useCallback(async (userAnswer: string): Promise<boolean> => {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    if (!currentQuestion) return false;

    const isCorrect = quizService.checkAnswer(userAnswer, currentQuestion.correctAnswers);

    const answer: QuizAnswer = {
      questionIndex: quizState.currentQuestionIndex,
      userAnswer,
      isCorrect,
      word: currentQuestion.word,
    };

    setQuizState({
      ...quizState,
      answers: quizState.answers.concat([answer])
    });
    return isCorrect;
  }, [quizState, userId]);

  /**
   * 「次へ」ボタンを押すと呼ばれる。
   *  もし最後の問題でなければ、quizStateのindexをインクリメントする。
   *  最後の問題ならisCompleteをtrueにする。
   */
  const nextQuestion = useCallback(async () => {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      setQuizState({
        ...quizState,
        currentQuestionIndex: quizState.currentQuestionIndex + 1
      });
    } else {
      setQuizState({
        ...quizState,
        isComplete: true
      })
      // 進捗を更新（ユーザーがログイン中の場合）
      if (userId) {
        quizState.answers.forEach(async answer => {
          try {
            await updateUserProgress(
              userId,
              quizState.questions[answer.questionIndex].word.id,
              answer.isCorrect
            );
          } catch (error) {
            console.error('Failed to update progress:', error);
          }
        });
      }
      console.log(userId ? await getProgressStats(userId) : "ユーザーなし");
    }
  }, [quizState]);



  /**
   * 音声を再生
   */
  const playQuestionAudio = useCallback(() => {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    if (currentQuestion && quizState.config?.mode === 'audio-to-japanese') {
      quizService.playAudio(currentQuestion.word.english);
    }
  }, [quizState]);

  /**
   * クイズサマリーを取得
   */
  const getQuizSummary = useCallback(() => {
    const correctCount = quizState.answers.filter(a => a.isCorrect).length;
    return quizService.calculateQuizSummary(quizState.questions.length, correctCount);
  }, [quizState]);

  /**
   * 回答が不正解の場合に、本当に不正解かAIに判断させる
   */
  const checkUserAnswer = useCallback(async () => {
    const latestAnswer = quizState.answers[quizState.answers.length - 1];
    const question = quizState.questions[latestAnswer.questionIndex];
    if(latestAnswer.isCorrect){
      console.error("正解してる場合はAIチェックをできません。", latestAnswer);
      return true;
    }

    // 回答が日本語化確認
    const regex = /^[ぁ-んァ-ヶー一-龠々〆〤～]+$/;
    if(!regex.test(latestAnswer.userAnswer)){
      console.error("回答は日本語のみである必要があります。");
      return false;
    }
    const resultText = await checkCorrectTranslation(question.word.english, latestAnswer.userAnswer);
    const isCorrect = resultText === "true" ? true : false;
    console.log(isCorrect);
    if(!isCorrect){
      console.log("間違ってます");
      return isCorrect;
    }
    
    latestAnswer.isCorrect = true;
    setQuizState({
      ...quizState,
    });

    return isCorrect;
  }, [quizState.answers])

  const addJpToEnWord = useCallback(async (word:Word, japanese:string) => {
    await updateWord(word.id, {...word, japanese:word.japanese.concat([japanese])});
  }, [quizState.answers])

  return {
    currentQuestion: quizState.questions[quizState.currentQuestionIndex],
    initializeQuiz,
    submitAnswer,
    nextQuestion,
    resetQuiz,
    playQuestionAudio,
    getQuizSummary,
    checkUserAnswer,
    addJpToEnWord,
  };
};
