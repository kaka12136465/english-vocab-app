import React, { useEffect, useState} from 'react';
import { QuizMode, WordBook } from '@/types';
import { getAllWordBooks } from '@/features/vocabulary/services/vocabularyService';

interface HomePageProps {
  onStartQuiz: (mode: QuizMode, quizRange: [number, number], wordCount: number, wordBookId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({onStartQuiz}) => {
  const [selectedMode, setSelectedMode] = useState<QuizMode>('english-to-japanese');
  const [selectedWordBookIndex, setSelectedWordBookIndex] = useState<number>(0);
  const [wordCount, setWordCount] = useState(10);
  const [wordBooks, setWordBooks] = useState<WordBook[]>([]);
  const [quizRange, setQuizRange] = useState<[string, string]>(['1', '100']);

  const quizModes: { value: QuizMode; label: string; description: string; icon: string }[] = [
    {
      value: 'english-to-japanese',
      label: '英語 → 日本語', 
      description: '英 → 和',
      icon: '🇬🇧 → 🇯🇵',
    },
    {
      value: 'japanese-to-english',
      label: '日本語 → 英語',
      description: '和 → 英',
      icon: '🇯🇵 → 🇬🇧',
    },
    {
      value: 'audio-to-japanese',
      label: '音声 → 日本語',
      description: '英音声 → 和',
      icon: '🔊 → 🇯🇵',
    },
  ];

  const modeMap = new Map<string, string>()
  quizModes.map((value) => {
    modeMap.set(value.description, value.value);
  })

  useEffect (() => {
    const fetchWordBooks = async () => {
      const wordBooks: WordBook[] = await getAllWordBooks();

      wordBooks.sort((a, b) => {return a.createdAt?.toMillis() - b.createdAt?.toMillis()})
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
    onStartQuiz(selectedMode, [Number(quizRange[0]), Number(quizRange[1])], wordCount, wordBooks[selectedWordBookIndex].id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 pt-16">
      {/* ヘッダー */}
      

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-4 mb-8">
            {/* 単語帳選択 */}
            <select 
              value={selectedWordBookIndex} 
              onChange={(e) => {setSelectedWordBookIndex(Number(e.target.value));}}
              className="px-4 py-2 border rounded"
            >
              {wordBooks.map((item: WordBook, index) => (
                <option key={index} value={index}>
                  {item.name}
                </option>
                ))}
            </select>
            

            {/* モード選択 */}
          </div>

          <select 
            value={selectedMode} 
            onChange={(e) => {setSelectedMode(modeMap.get(e.target.value ?? "英 → 和") as QuizMode);}}
            className="px-4 py-2 border rounded"
          >
            {Array.from(modeMap.keys()).map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
              ))}
          </select>
          <div className="my-6">
            <input
              type="number"
              value={quizRange[0]}
              onChange={(e) => setQuizRange([e.target.value, quizRange[1]])}
              className="w-20 px-2 py-1 ml-4 mr-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            〜
            <input
              type="number"
              value={quizRange[1]}
              onChange={(e) => setQuizRange([quizRange[0], e.target.value])}
              className="w-20 px-2 py-1 ml-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* 出題数設定 */}
          <div className="flex flex-row mb-8">
            <label className="block pt-1 text-sm font-medium text-gray-700 mb-2">
              出題数：
            </label>
            <select
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="p-1 mb-2 border rounded "
            >
              {[...Array(10)].map((_, i) => (
                <option key={(i+1)*5} value={(i+1)*5}>
                  {(i+1)*5}問
                </option>
              ))}
            </select>
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
