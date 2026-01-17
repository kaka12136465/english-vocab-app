import { useState } from "react";
import { Word } from "@/types";
import { Timestamp } from "firebase/firestore";
// 単語カードコンポーネント
interface WordCardProps {
  word: Word;
  onDeleteWord: (wordId: string) => Promise<string>;
  setShowAddForm: (isShow: boolean) => void;
  setShowEditForm: (isShow: boolean) => void;
  setEdittingWord: (edittingWord: Word | null) => void;
}

export const WordCard: React.FC<WordCardProps> = ({ word, onDeleteWord, setShowAddForm, setShowEditForm, setEdittingWord}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
      <p>{word.index}</p>
      <div className="flex justify-between items-start mb-2">
        <span>
          <h3 className="text-xl font-bold text-gray-800">{word.english}</h3>
          {word.pronunciation && (
            <p className="text-sm text-gray-500">[{word.pronunciation}]</p>
          )}
        </span>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={async () => {await onDeleteWord(word.id); setEdittingWord(null); setShowEditForm(false);}}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium color-red"
          >
            削除
          </button> 

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {showDetails ? '閉じる' : '詳細'}
          </button>

          <button
            onClick={() => {setEdittingWord(word);setShowEditForm(true);setShowAddForm(false);}}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            編集
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-gray-800">{word.japanese.join(', ')}</p>
        </div>

        {showDetails && (
          <>
            {word.synonyms.length > 0 && (
              <div>
                <p className="text-sm text-gray-600">類義語:</p>
                <p className="text-gray-800">{word.synonyms.join(', ')}</p>
              </div>
            )}

            {word.antonyms.length > 0 && (
              <div>
                <p className="text-sm text-gray-600">対義語:</p>
                <p className="text-gray-800">{word.antonyms.join(', ')}</p>
              </div>
            )}

            {word.exampleSentence && (
              <div>
                <p className="text-sm text-gray-600">例文:</p>
                <p className="text-gray-800 italic">{word.exampleSentence}</p>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                登録日: {word.createdAt instanceof Timestamp ? word.createdAt.toDate().toLocaleDateString('ja-JP'): '不明'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};