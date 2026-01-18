import { useState, useCallback } from 'react';
import { Word, QuizMode } from '@/types';
import { QuizAnswer, QuizState } from '../types/quiz.types';
import * as quizService from '../services/quizService';
import {getProgressStats, updateUserProgress } from '@/features/userProgress/services/progressService';
import { checkCorrectTranslation } from '../services/quizService';
import { updateWord } from '@/features/vocabulary/services/wordBookService';

/**
 * クイズ機能を管理するカスタムフック
 */
export const useQuiz = (userId: string | null) => {
  const [quizState, setQuizState] = useState<QuizState>({
    config: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    isComplete: false,
  });

  const [initialQuizState, setInitialQuizState] = useState<QuizState>(quizState);

  /**
   * クイズを開始
   */
  const startQuiz = useCallback((words: Word[], mode: QuizMode, wordCount: number) => {
    const selectedWords = words.slice(0, wordCount);
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

    setInitialQuizState(newQuizState);
    setQuizState(newQuizState);
    return newQuizState;
  }, []);
  

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
      correctAnswers: currentQuestion.correctAnswers,
    };

    setQuizState(prev => ({
      ...prev,
      answers: prev.answers.concat([answer])
    }))
    /*
    */
    return isCorrect;
  }, [quizState, userId]);

  /**
   * 「次へ」ボタンを押すと呼ばれる。
   *  もし最後の問題でなければ、quizStateのindexをインクリメントする。
   *  最後の問題ならisCompleteをtrueにする。
   */
  const nextQuestion = useCallback(async () => {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    } else {
      setQuizState(prev => ({
        ...prev,
        isComplete: true
      }))
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
   * クイズをリセット
   */
  const resetQuiz =() => {
    setQuizState(initialQuizState);
  };

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
    const regex = /^[ぁ-んァ-ヶー一-龠々〆〤]+$/;
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
    setQuizState(prev => ({
      ...prev,
    }));

    return isCorrect;
  }, [quizState.answers])

  const addJpToEnWord = useCallback(async (word:Word, japanese:string) => {
    await updateWord(word.id, {...word, japanese:word.japanese.concat([japanese])});
  }, [quizState.answers])

  return {
    quizState,
    currentQuestion: quizState.questions[quizState.currentQuestionIndex],
    startQuiz,
    submitAnswer,
    nextQuestion,
    resetQuiz,
    playQuestionAudio,
    getQuizSummary,
    setQuizState,
    checkUserAnswer,
    addJpToEnWord,
  };
};
