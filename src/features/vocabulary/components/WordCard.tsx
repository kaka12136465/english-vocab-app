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
    <div  onClick={() => setShowDetails(!showDetails)} className="cursor-pointer bg-white rounded-lg shadow hover:shadow-md transition-shadow pt-2 pb-2 pl-4 pr-4">
      <div className="flex justify-between items-start">
        <p className="text-lg font-bold text-gray-800">{word.index}. {word.english}</p>
        
        <div className="flex gap-6">
          <button
            className="text-sm mt-1 text-primary-600 hover:text-primary-700 font-medium"
          >
            {showDetails ? '閉じる' : '詳細'}
          </button>
        </div>
      </div>

      <div className="pt-2 space-y-2">
        {showDetails && (
          <>
            <div className="flex gap-6">
              <p className="flex-1 text-gray-800">{word.japanese.join(', ')}</p>
            </div>
            {word.pronunciation && (
              <div className="">
                <p className="text-sm text-gray-500">[{word.pronunciation}]</p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("音声");
                    const utterance = new SpeechSynthesisUtterance(word.english);
                    utterance.lang = "en-US";
                    speechSynthesis.speak(utterance);
                  }} 
                >再生</button>
              </div>
            )}
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

            <div className="flex justify-end gap-6">
              <button 
                onClick={async () => {await onDeleteWord(word.id); setEdittingWord(null); setShowEditForm(false);}}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                削除
              </button> 

              <button
                onClick={() => {setEdittingWord(word);setShowEditForm(true);setShowAddForm(false);}}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                編集
              </button>
            </div>

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