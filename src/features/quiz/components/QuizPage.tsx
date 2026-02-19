import React, { useEffect, useState } from 'react';
import { QuizCard } from '@/features/quiz/components/QuizCard';
import { QuizResult } from '@/features/quiz/components/QuizResult';
import { useQuiz } from '@/features/quiz/hooks/useQuiz';
import { Word } from '@/types';
import { emptyUserQuizData, QuizSetting, QuizState, UserQuizData } from '@/features/quiz/types/quiz.types';
import { User } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';

interface QuizPageProps {
  user: User | null;
}



export const QuizPage: React.FC<QuizPageProps> = ({ user }) => {
  user;
  const [targetWords, setTargetWords] = useState<Word[]>([]);
  const [quizState, setQuizState] = useState<QuizState>({
    config: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    isComplete: false,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const {gettedUserQuizData, quizSetting} = location.state as {
    gettedUserQuizData: UserQuizData, 
    quizSetting: QuizSetting
  } ?? {
    gettedUserQuizData: emptyUserQuizData,
    quizSetting: emptyUserQuizData.lastPlayQuizSetting
  };

  const [userQuizData, setUserQuizData] = useState<UserQuizData>(gettedUserQuizData);

  const {
    currentQuestion,
    initializeQuiz,
    submitAnswer,
    nextQuestion,
    resetQuiz,
    playQuestionAudio,
    getQuizSummary,
    checkUserAnswer,
    addJpToEnWord,
    resisterWordWeakness
  } = useQuiz({
    userQuizData,
    quizSetting,
    quizState,
    setTargetWords,
    setQuizState,
    setUserQuizData
  });

  useEffect(() => {
    const start = async () => {
      try {
        await initializeQuiz();
      } catch (error) {
        console.error("Error fetching words:", error);
      }
    };
    start();
  }, []);

  if (quizState.isComplete) {
    const summary = getQuizSummary();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 pt-16">
        <QuizResult
          summary={summary}
          answers={quizState.answers}
          onRestart={resetQuiz}
          targetWords={targetWords}
          setTargetWords={setTargetWords}
        />
      </div>
    );
  }

  // クイズ実施中の場合
  if (currentQuestion && quizState.config) {
    const isAudioMode = quizState.config.mode === 'audio-to-japanese';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 pt-16">
        {/* 戻るボタン */}
        <div className="max-w-2xl mx-auto mb-4">
          <button
            onClick={() => navigate("/quizSetting")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            クイズの設定に戻る
          </button>
        </div>

        <QuizCard
          question={currentQuestion}
          questionNumber={quizState.currentQuestionIndex + 1}
          totalQuestions={quizState.questions.length}
          onSubmit={submitAnswer}
          onNext={nextQuestion}
          isAudioMode={isAudioMode}
          onPlayAudio={isAudioMode ? playQuestionAudio : undefined}
          onCheckAnswer={checkUserAnswer}
          onAddJpToEnWord={addJpToEnWord}
          resisterWordWeakness={resisterWordWeakness}
          userQuizData={userQuizData}
        />
      </div>
    );
  }

  // データがない場合（通常は発生しない）
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center pt-16">
      <div className="text-center">
        <p className="text-xl text-gray-600 mb-4">クイズデータの読み込み中...</p>
        <button
          onClick={() => navigate("/quizSetting")}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          クイズの設定に戻る
        </button>
      </div>
    </div>
  );
};
