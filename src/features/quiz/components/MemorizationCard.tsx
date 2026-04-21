import React, { useEffect } from 'react';
import { Word } from '@/types';
import { playAudio } from '../services/quizService';

interface MemorizationCardProps {
  word: Word;
  wordIndex: number;    // グループ内の0-baseインデックス
  groupSize: number;
  groupIndex: number;   // 0-base
  totalGroups: number;
  isLastInGroup: boolean;
  hasPrev?: boolean;
  autoPlayAudio?: boolean;
  volume?: number;      // 0.0 〜 1.0
  onNext: () => void;
  onPrev?: () => void;
}

export const MemorizationCard: React.FC<MemorizationCardProps> = ({
  word,
  wordIndex,
  groupSize,
  groupIndex,
  totalGroups,
  isLastInGroup,
  hasPrev = false,
  autoPlayAudio = false,
  volume = 1,
  onNext,
  onPrev,
}) => {
  // 単語が変わったときに自動再生
  useEffect(() => {
    if (autoPlayAudio) playAudio(word.english, 'en-US', volume);
  }, [word]);

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
        <div className="flex items-center justify-center gap-3 mb-1">
          <p className="text-3xl font-bold text-gray-800">{word.english}</p>
          <button
            type="button"
            onClick={() => playAudio(word.english, 'en-US', volume)}
            className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
            title="音声を再生"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
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

      <div className="flex gap-3">
        {hasPrev && onPrev && (
          <button
            onClick={onPrev}
            className="flex-none py-3 px-5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
          >
            ← 前へ
          </button>
        )}
        <button
          onClick={onNext}
          autoFocus
          className="flex-1 py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        >
          {isLastInGroup ? 'クイズを開始' : '次の単語へ →'}
        </button>
      </div>
    </div>
  );
};
