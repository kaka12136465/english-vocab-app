import React, { useState } from 'react';
import { translateEnToJa } from '@/features/vocabulary/services/wordSearchingService';
import { useNavigate } from 'react-router-dom';

export const TranslationPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError('');
    setTranslatedText('');
    try {
      const result = await translateEnToJa(inputText);
      setTranslatedText(result);
    } catch {
      setError('翻訳に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 pt-16">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
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
            <h1 className="text-2xl font-bold text-gray-800">英文翻訳</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
          {/* 入力欄 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">英文</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                  e.preventDefault();
                  handleTranslate();
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={5}
              placeholder="翻訳したい英文を入力してください..."
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1 text-right">Ctrl + Enter で翻訳</p>
          </div>

          {/* 翻訳ボタン */}
          <button
            onClick={handleTranslate}
            disabled={loading || !inputText.trim()}
            className="w-full py-3 px-6 bg-primary-600 text-white text-lg font-bold rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '翻訳中...' : '翻訳する'}
          </button>

          {/* エラー */}
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>
          )}

          {/* 翻訳結果 */}
          {translatedText && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">日本語訳</label>
              <div className="relative w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 whitespace-pre-wrap text-gray-800 leading-relaxed">
                {translatedText}
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(translatedText)}
                  className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
                  title="コピー"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
