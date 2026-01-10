import { WordBook } from "@/types";
import { useState } from "react";

// 単語カードコンポーネント
interface WordBookCardProps {
  wordBook: WordBook;
  onOpenWords: (wordBookId: string) => void;
}

export const WordBookCard: React.FC<WordBookCardProps> = ({ wordBook, onOpenWords }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center">
        <button
            className="text-xl font-bold text-gray-800 flex-1 text-left"
            onClick={() => onOpenWords(wordBook.id)}
        >
            {wordBook.name}
        </button>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-primary-600 hover:text-primary-800 focus:outline-none shirink-0"
        >
          {showDetails ? '閉じる' : '詳細'}
        </button>
      </div>
      {showDetails && (
        <div className="mt-4 text-gray-600">
          <p>{wordBook.description || '説明はありません'}</p>
          <p className="mt-2 text-sm text-gray-500">
            作成日: {wordBook.createdAt ? new Date(wordBook.createdAt).toLocaleDateString() : '不明'}
          </p>
        </div>
      )}
    </div>
  );
};