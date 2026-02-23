import React, { useState, useEffect } from 'react';
import { QuizQuestionData, UserQuizData} from '../types/quiz.types';
import { Word } from '@/types';

interface QuizCardProps {
  question: QuizQuestionData;
  questionNumber: number;
  totalQuestions: number;
  onSubmit: (answer: string) => Promise<boolean>;
  onNext: () => void;
  isAudioMode: boolean;
  onPlayAudio?: () => void;
  onCheckAnswer: () => Promise<boolean>;
  onAddJpToEnWord: (word: Word, japanese:string) => Promise<void>;
  resisterWordWeakness: (word:Word, isWeak: boolean) => Promise<void>;
  userQuizData: UserQuizData;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onSubmit,
  onNext,
  isAudioMode,
  onPlayAudio,
  onCheckAnswer,
  onAddJpToEnWord,
  resisterWordWeakness,
  userQuizData,
}) => {

  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCheckButtonClicked, setIsCheckButtonClicked] = useState(false);
  const [isAddJpButtonClicked, setIsAddJpButtonClicked] = useState(false);
  const [isWeak, setIsWeak] = useState<boolean>(userQuizData.wordWeaknesses[question.word.id] ?? false);

  // 問題が変わったらリセット
  useEffect(() => {
    setUserAnswer('');
    setIsSubmitted(false);
    setIsCorrect(null);
    setIsWeak(userQuizData.wordWeaknesses[question.word.id] ?? false);
  }, [question]);

  useEffect(() => {
    if(isCorrect || isCheckButtonClicked) return;
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        handleAiCheck();
      }
    }
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isSubmitted, isCheckButtonClicked])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setIsAddJpButtonClicked(false);
    setIsCheckButtonClicked(false);
    try {
      const correct = await onSubmit(userAnswer);
      if(userQuizData.wordWeaknesses[question.word.id] == undefined){
        resisterWordWeakness(question.word, !correct);
        setIsWeak(!correct);
      }
      setIsCorrect(correct);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('回答の送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const handleAiCheck = async () => {
    setLoading(true);
    if(isCorrect || isCheckButtonClicked) return;
    try{
      const correct = await onCheckAnswer();
      setIsCorrect(correct);
    }catch(err){
      console.error('Error checking answer:', err);
      alert('AIチェック中にエラーが発生しました');
    }finally{
      setIsCheckButtonClicked(true);
      setLoading(false);
    }
  }

  const handleAddJp = async () => {
    setLoading(true);
    await onAddJpToEnWord(question.word, userAnswer);
    setLoading(false);
    setIsAddJpButtonClicked(true);
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* 進捗表示 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            問題 {questionNumber} / {totalQuestions}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((questionNumber / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* 問題文 */}
      <div className="mb-6">
        {isAudioMode ? (
          <div className="text-center">
            <p className="text-lg font-medium text-gray-800 mb-4">
              {question.question}
            </p>
            <button
              onClick={onPlayAudio}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 mx-auto"
              type="button"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              音声を再生
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800 mb-2">
              {question.question}
            </p>
            {question.word.pronunciation && (
              <p className="text-sm text-gray-500">[{question.word.pronunciation}]</p>
            )}

            {/* 例文表示 */}
            <div className="flex flex-col justify-center gap-y-2 px-4 py-3 bg-gray-50 rounded-lg mt-4">
              
              {question.word.exampleEnSentence && (
                  <span className="text-sm text-gray-600">{question.word.exampleEnSentence}</span>
              )}

              {/* 例文の日本語訳 */}
              {isSubmitted && question.word.exampleJaSentence && (
                  <span className="text-sm text-gray-600">{question.word.exampleJaSentence}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 回答フォーム */}
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value.replace(/〜/g, "～"))}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="回答を入力してください"
              disabled={loading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '送信中...' : '回答する'}
          </button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={(e) => {handleNext(e); setIsCheckButtonClicked(false)}}>
          {/* 結果表示 */}
          <div
            className={`p-4 rounded-lg ${
              isCorrect
                ? 'bg-green-100 border border-green-300'
                : 'bg-red-100 border border-red-300'
            }`}
          >
            <div
              className={`text-lg font-bold mb-2 flex items-center gap-4 ${
                isCorrect ? 'text-green-800' : 'text-red-800'
              }`}
            >
              <div>
                {isCorrect ? '正解！' : '不正解'}
              </div>
              { !isCorrect && !isCheckButtonClicked &&
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleAiCheck}
                  className={`${
                    loading
                      ? "text-sm text-gray-700 mt-1" 
                      : "px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 whitespace-nowrap"
                    }`}
                >
                  {loading ? "判定中..." : "AIチェック"}
                </button>
              }
              { !isCorrect && isCheckButtonClicked &&
                <p className="text-sm text-gray-700 mt-1">結果は変わりませんでした</p>
              }
              {
                isCorrect && isCheckButtonClicked && !isAddJpButtonClicked &&
                <button
                  type='button'
                  disabled={loading}
                  onClick={handleAddJp}
                  className={`${
                    loading
                      ? "text-sm text-gray-700 mt-1" 
                      : "px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 whitespace-nowrap"
                    }`}
                  >
                  {loading ? "追加中..." : "和訳を追加"}
                </button>
              }
              {
                isCorrect && isCheckButtonClicked && isAddJpButtonClicked &&
                <p className="text-sm text-gray-700 mt-1">追加完了</p>
              }
              <div className="flex ml-auto"/>
                <p className="font-normal text-sm text-gray-700">苦手</p>
                <input
                  type="checkbox"
                  checked={isWeak}
                  onChange={async (e) => {
                    setIsWeak(e.target.checked);
                    resisterWordWeakness(question.word, e.target.checked);
                  }}
                  className="size-4"
                />
              </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-700 mt-1">
                あなたの回答: <span className="font-medium">{userAnswer}</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-1">
              正解: <span className="font-medium">{question.correctAnswers.join(', ')}</span>
            </p>
            
          </div>

          {/* 次へボタン */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            autoFocus
          >
            {loading ? "ロード中..." : questionNumber < totalQuestions ? "次の問題へ" : "結果を表示する"}
          </button>
        </form>
      )}
    </div>
  );
};
