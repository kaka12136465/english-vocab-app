import React from 'react';
import { QuizAnswer } from '../types/quiz.types';
import { QuizSummary } from '../services/quizService';

interface QuizResultProps {
  summary: QuizSummary;
  answers: QuizAnswer[];
  onRestart: () => void;
  onBackToHome: () => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  summary,
  answers,
  onRestart,
  onBackToHome,
}) => {
  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyMessage = (accuracy: number): string => {
    if (accuracy === 100) return '完璧です！';
    if (accuracy >= 80) return '素晴らしい！';
    if (accuracy >= 60) return 'よくできました！';
    if (accuracy >= 40) return 'もう少し頑張りましょう！';
    return '復習が必要です';
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">クイズ完了！</h2>
        <p className="text-gray-600">お疲れ様でした</p>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-1">出題数</p>
          <p className="text-3xl font-bold text-gray-800">{summary.totalQuestions}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-1">正解数</p>
          <p className="text-3xl font-bold text-green-600">{summary.correctAnswers}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-1">不正解数</p>
          <p className="text-3xl font-bold text-red-600">{summary.incorrectAnswers}</p>
        </div>
      </div>

      {/* 正答率 */}
      <div className="mb-8 text-center">
        <p className="text-sm text-gray-600 mb-2">正答率</p>
        <p className={`text-5xl font-bold mb-2 ${getAccuracyColor(summary.accuracy)}`}>
          {Math.round(summary.accuracy)}%
        </p>
        <p className="text-lg text-gray-700">{getAccuracyMessage(summary.accuracy)}</p>
      </div>

      {/* 詳細結果 */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">詳細結果</h3>
        <div className="space-y-3">
          {answers.map((answer, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                answer.isCorrect
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  問題 {index + 1}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-bold rounded ${
                    answer.isCorrect
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  }`}
                >
                  {answer.isCorrect ? '正解' : '不正解'}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-1">
                あなたの回答: <span className="font-medium">{answer.userAnswer}</span>
              </p>
              {!answer.isCorrect && (
                <p className="text-sm text-gray-700">
                  正解: <span className="font-medium">{answer.correctAnswers.join(', ')}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRestart}
          className="flex-1 py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          もう一度挑戦
        </button>
        <button
          onClick={onBackToHome}
          className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  );
};
