import React, { useEffect, useState } from 'react';
import { QuizCard } from '@/features/quiz/components/QuizCard';
import { QuizResult } from '@/features/quiz/components/QuizResult';
import { useQuiz } from '@/features/quiz/hooks/useQuiz';
import { QuizMode } from '@/types';
import { QuizState } from '@/features/quiz/types/quiz.types';
import { getWordsInWordBook } from '@/features/vocabulary/services/wordBookService';

interface QuizPageProps {
  userId: string | null;
  onBackToHome: () => void;
  mode: QuizMode;
  wordCount: number;
  wordBookId: string;
}

export const QuizPage: React.FC<QuizPageProps> = ({ userId, onBackToHome, mode, wordCount, wordBookId }) => {
  // quizStateの変更が反映されていない
  const {
    quizState: initialQuizState,
    currentQuestion,
    submitAnswer,
    nextQuestion,
    resetQuiz,
    playQuestionAudio,
    getQuizSummary,
    startQuiz,
  } = useQuiz(userId);
  const [quizState, setQuizState] = useState<QuizState>(initialQuizState);
  console.log("quizState",quizState.currentQuestionIndex, quizState);

  useEffect(() => {
    const start = async () => {
      try {
        if (!userId) return;
        console.log("wordBook", wordBookId);
        const words = await getWordsInWordBook(wordBookId);

        // ランダムにシャッフル
        const shuffled = [...words].sort(() => 0.5 - Math.random());
        const selectedWords = shuffled.slice(0, Math.min(wordCount, shuffled.length));

        // ここでquizStateを変更したい
        const newQuizState = startQuiz(selectedWords, mode, wordCount);
        setQuizState(newQuizState);
      } catch (error) {
        console.error("Error fetching words:", error);
      }
    };
    start(); 
  }, []);


  // クイズが完了している場合は結果画面を表示
  if (quizState.isComplete) {
    const summary = getQuizSummary();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
        <QuizResult
          summary={summary}
          answers={quizState.answers}
          onRestart={resetQuiz}
          onBackToHome={onBackToHome}
        />
      </div>
    );
  }

  // クイズ実施中の場合
  if (currentQuestion && quizState.config) {
    const isAudioMode = quizState.config.mode === 'audio-to-japanese';
    console.log("currentQuizState", quizState);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
        {/* 戻るボタン */}
        <div className="max-w-2xl mx-auto mb-4">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            ホームに戻る
          </button>
        </div>

        <QuizCard
          question={currentQuestion}
          questionNumber={quizState.currentQuestionIndex + 1}
          totalQuestions={quizState.questions.length}
          onSubmit={async (answer) => {
            const {newQuizState: newQuizState, isCorrect: isCorrect} = await submitAnswer(answer) ?? {newQuizState: quizState, isCorrect: false};
            setQuizState(newQuizState);
            return {newQuizState, isCorrect};
          }}
          onNext={nextQuestion}
          isAudioMode={isAudioMode}
          onPlayAudio={isAudioMode ? playQuestionAudio : undefined}
        />
      </div>
    );
  }

  // データがない場合（通常は発生しない）
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl text-gray-600 mb-4">クイズデータの読み込み中...</p>
        <button
          onClick={onBackToHome}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  );
};
