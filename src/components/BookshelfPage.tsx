import React, { useState, useEffect } from 'react';
import { AddWordBookForm } from '@/features/vocabulary/components/AddWordBookForm';
import { useWordBook } from '@/features/vocabulary/hooks/useBookshelf';
import { WordBookCard } from '@/features/vocabulary/components/WordBookCard';

interface WordBooksPageProps {
  userId: string;
  onBack: () => void;
  onOpenWords: (wordBookId:string) => void;
}

export const WordBooksPage: React.FC<WordBooksPageProps> = ({onBack, onOpenWords }) => {
  const { wordBooks, loading, error, loadAllWordBooks } = useWordBook();
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadAllWordBooks();
  }, []);



  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 pt-16">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              戻る
            </button>
            <h1 className="text-2xl font-bold text-gray-800">単語帳</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {/* 追加ボタン */}
        {!showAddForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              単語帳を追加
            </button>
          </div>
        )}

        {/* 追加フォーム */}
        {showAddForm && (
          <div className="mb-6">
            <AddWordBookForm
              onCreated={() => setShowAddForm(false)}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* ローディング */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        )}

        {/* 単語リスト */}
        {!loading && wordBooks.length === 0 && !showAddForm && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <p className="text-gray-600 text-lg mb-2">まだ単語帳が登録されていません</p>
            <p className="text-gray-500 text-sm">「新しい単語帳を追加」ボタンから登録してみましょう</p>
          </div>
        )}

        {!loading && wordBooks.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                登録単語帳: {wordBooks.length}件
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wordBooks.map((wordBook) => (
                <WordBookCard key={wordBook.id} wordBook={wordBook} onOpenWords={onOpenWords} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};


