import React from 'react';
import { Word } from '@/types';

interface MemorizationCardProps {
  word: Word;
  wordIndex: number;    // グループ内の0-baseインデックス
  groupSize: number;
  groupIndex: number;   // 0-base
  totalGroups: number;
  isLastInGroup: boolean;
  onNext: () => void;
}

export const MemorizationCard: React.FC<MemorizationCardProps> = ({
  word,
  wordIndex,
  groupSize,
  groupIndex,
  totalGroups,
  isLastInGroup,
  onNext,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* 進捗 */}
      <div className="mb-4 flex justify-between text-sm text-gray-500">
        <span>グループ {groupIndex + 1} / {totalGroups}</span>
        <span>{wordIndex + 1} / {groupSize}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((wordIndex + 1) / groupSize) * 100}%` }}
        />
      </div>

      {/* 単語カード */}
      <div className="text-center mb-6">
        <p className="text-3xl font-bold text-gray-800 mb-1">{word.english}</p>
        {word.pronunciation && (
          <p className="text-sm text-gray-400 mb-2">[{word.pronunciation}]</p>
        )}
        {word.partOfSpeech.length > 0 && (
          <p className="text-xs text-gray-400 mb-3">{word.partOfSpeech.join(' / ')}</p>
        )}
        <p className="text-xl text-blue-700 font-semibold mb-4">
          {word.japanese.join('、')}
        </p>
        {word.description && (
          <p className="text-sm text-gray-600 mb-4">{word.description}</p>
        )}
        {(word.exampleEnSentence || word.exampleJaSentence) && (
          <div className="text-left bg-gray-50 rounded-lg px-4 py-3 space-y-1">
            {word.exampleEnSentence && (
              <p className="text-sm text-gray-600">{word.exampleEnSentence}</p>
            )}
            {word.exampleJaSentence && (
              <p className="text-sm text-gray-400">{word.exampleJaSentence}</p>
            )}
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        autoFocus
        className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
      >
        {isLastInGroup ? 'クイズを開始' : '次の単語へ'}
      </button>
    </div>
  );
};
