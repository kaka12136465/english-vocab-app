import React, { useEffect, useState} from 'react';
import { QuizMode, WordBook } from '@/types';
import { getAllWordBooks } from '@/features/vocabulary/services/vocabularyService';

interface HomePageProps {
  userName: string | null;
  onStartQuiz: (mode: QuizMode, wordCount: number, wordBookId: string) => void;
  onLogout: () => void;
  onOpenWordBooks: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ userName, onStartQuiz, onLogout,onOpenWordBooks }) => {
  const [selectedMode, setSelectedMode] = useState<QuizMode>('english-to-japanese');
  const [selectedWordBookIndex, setSelectedWordBookIndex] = useState<number>(0);
  const [wordCount, setWordCount] = useState(10);
  const [wordBooks, setWordBooks] = useState<WordBook[]>([]);

  const quizModes: { value: QuizMode; label: string; description: string; icon: string }[] = [
    {
      value: 'english-to-japanese',
      label: '英語 → 日本語',
      description: '英単語を見て日本語訳を答える',
      icon: '🇬🇧 → 🇯🇵',
    },
    {
      value: 'japanese-to-english',
      label: '日本語 → 英語',
      description: '日本語訳を見て英単語を答える',
      icon: '🇯🇵 → 🇬🇧',
    },
    {
      value: 'audio-to-japanese',
      label: '音声 → 日本語',
      description: '音声を聞いて日本語訳を答える',
      icon: '🔊 → 🇯🇵',
    },
  ];

  useEffect (() => {
    const fetchWordBooks = async () => {
      const wordBooks: WordBook[] = await getAllWordBooks();
      console.log(wordBooks);
      setWordBooks(wordBooks);
    }
    fetchWordBooks();
  }, []);

  const handleStartQuiz = () => {
    if (wordCount < 1 || wordCount > 50) {
      alert('出題数は1〜50の範囲で設定してください');
      return;
    }
    if(wordBooks.length === 0){
      console.error("単語帳が存在しません");
      return;
    }
    console.log("selectedWordBookId", wordBooks[selectedWordBookIndex].id);
    onStartQuiz(selectedMode, wordCount, wordBooks[selectedWordBookIndex].id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">英単語学習アプリ</h1>
            <div className="flex items-center gap-4">
              {userName && (
                <span className="text-sm text-gray-600">
                  ようこそ、<span className="font-medium">{userName}</span>さん
                </span>
              )}
              <button
                onClick={onOpenWordBooks}
                className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                単語帳
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* タイトル */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              クイズモードを選択
            </h2>
            <p className="text-gray-600">
              学習したいモードを選んでクイズを開始しましょう
            </p>
          </div>
          
          
          <div className="space-y-4 mb-8">
            {/* 単語帳選択 */}
            <select 
              value={selectedWordBookIndex} 
              onChange={(e) => {setSelectedWordBookIndex(Number(e.target.value));console.log(wordBooks[Number(e.target.value)]);}}
              className="px-4 py-2 border rounded"
            >
              {wordBooks.map((item: WordBook, index) => (
                <option key={index} value={index}>
                  {item.name}
                </option>
                ))}
            </select>

            {/* モード選択 */}
            {quizModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setSelectedMode(mode.value)}
                className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                  selectedMode === mode.value
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{mode.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {mode.label}
                    </h3>
                    <p className="text-sm text-gray-600">{mode.description}</p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedMode === mode.value
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedMode === mode.value && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* 出題数設定 */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出題数: {wordCount}問
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5問</span>
              <span>15問</span>
              <span>30問</span>
            </div>
          </div>

          {/* スタートボタン */}
          <button
            onClick={handleStartQuiz}
            className="w-full py-4 px-6 bg-primary-600 text-white text-lg font-bold rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all shadow-lg hover:shadow-xl"
          >
            クイズを開始
          </button>
        </div>

        {/* 統計情報（将来的に実装） */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-sm text-gray-600 mb-1">学習済み単語</p>
            <p className="text-3xl font-bold text-primary-600">-</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-sm text-gray-600 mb-1">平均正答率</p>
            <p className="text-3xl font-bold text-green-600">-</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-sm text-gray-600 mb-1">総出題数</p>
            <p className="text-3xl font-bold text-gray-800">-</p>
          </div>
        </div>
      </main>
    </div>
  );
};
