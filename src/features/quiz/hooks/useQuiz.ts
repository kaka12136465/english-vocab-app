import { useState, useCallback } from 'react';
import { Word, QuizMode } from '@/types';
import { QuizState, QuizConfig, QuizAnswer } from '../types/quiz.types';
import * as quizService from '../services/quizService';
import * as progressService from '@/features/userProgress/services/progressService';

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
    setInitialQuizState({
      config: { mode, wordCount },
      questions: questions,
      currentQuestionIndex: 0,
      answers: [],
      isComplete: false,
    });

    console.log("Starting quiz with questions:", questions);
    
    setQuizState(initialQuizState);
  }, []);
  

  /**
   * 回答を提出
   */
  const submitAnswer = useCallback(async (userAnswer: string) => {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = quizService.checkAnswer(userAnswer, currentQuestion.correctAnswers);

    const answer: QuizAnswer = {
      questionIndex: quizState.currentQuestionIndex,
      userAnswer,
      isCorrect,
      correctAnswers: currentQuestion.correctAnswers,
    };

    // 進捗を更新（ユーザーがログイン中の場合）
    if (userId) {
      try {
        await progressService.updateUserProgress(
          userId,
          currentQuestion.word.id,
          isCorrect
        );
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }

    // 回答を記録
    const newAnswers = [...quizState.answers, answer];
    const isLastQuestion = quizState.currentQuestionIndex === quizState.questions.length - 1;

    setQuizState(prev => ({
      ...prev,
      answers: newAnswers,
      currentQuestionIndex: isLastQuestion ? prev.currentQuestionIndex : prev.currentQuestionIndex + 1,
      isComplete: isLastQuestion,
    }));

    return isCorrect;
  }, [quizState, userId]);

  /**
   * 次の問題へ進む
   */
  const nextQuestion = useCallback(() => {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    }
  }, [quizState.currentQuestionIndex, quizState.questions.length]);

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

  return {
    quizState,
    currentQuestion: quizState.questions[quizState.currentQuestionIndex],
    startQuiz,
    submitAnswer,
    nextQuestion,
    resetQuiz,
    playQuestionAudio,
    getQuizSummary,
  };
};
