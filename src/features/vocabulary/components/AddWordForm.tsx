import React, { useState } from 'react';
import { AddWordFormData } from '../types/vocabulary.types';

interface AddWordFormProps {
  onSubmit: (formData: AddWordFormData, isPublic: boolean) => Promise<boolean>;
  onCancel: () => void;
}

export const AddWordForm: React.FC<AddWordFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<AddWordFormData>({
    english: '',
    japanese: [''],
    synonyms: [],
    antonyms: [],
    exampleSentence: '',
    pronunciation: '',
  });
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 日本語訳の追加
  const addJapaneseField = () => {
    setFormData(prev => ({
      ...prev,
      japanese: [...prev.japanese, ''],
    }));
  };

  // 日本語訳の削除
  const removeJapaneseField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      japanese: prev.japanese.filter((_, i) => i !== index),
    }));
  };

  // 日本語訳の更新
  const updateJapanese = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      japanese: prev.japanese.map((j, i) => (i === index ? value : j)),
    }));
  };

  // 類義語の追加
  const addSynonym = () => {
    setFormData(prev => ({
      ...prev,
      synonyms: [...prev.synonyms, ''],
    }));
  };

  // 対義語の追加
  const addAntonym = () => {
    setFormData(prev => ({
      ...prev,
      antonyms: [...prev.antonyms, ''],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await onSubmit(formData, isPublic);
      if (success) {
        // フォームをリセット
        setFormData({
          english: '',
          japanese: [''],
          synonyms: [],
          antonyms: [],
          exampleSentence: '',
          pronunciation: '',
        });
        setIsPublic(false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">新しい単語を追加</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        {/* 英単語 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            英単語 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.english}
            onChange={(e) => setFormData(prev => ({ ...prev, english: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="例: apple"
            required
          />
        </div>

        {/* 日本語訳 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            日本語訳 <span className="text-red-500">*</span>
          </label>
          {formData.japanese.map((jp, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={jp}
                onChange={(e) => updateJapanese(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="例: りんご"
                required={index === 0}
              />
              {formData.japanese.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeJapaneseField(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  削除
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addJapaneseField}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            + 日本語訳を追加
          </button>
        </div>

        {/* 発音記号 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            発音記号
          </label>
          <input
            type="text"
            value={formData.pronunciation}
            onChange={(e) => setFormData(prev => ({ ...prev, pronunciation: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="例: ˈæp.əl"
          />
        </div>

        {/* 類義語 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            類義語（任意）
          </label>
          {formData.synonyms.map((syn, index) => (
            <input
              key={index}
              type="text"
              value={syn}
              onChange={(e) => {
                const newSynonyms = [...formData.synonyms];
                newSynonyms[index] = e.target.value;
                setFormData(prev => ({ ...prev, synonyms: newSynonyms }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
              placeholder="例: fruit"
            />
          ))}
          <button
            type="button"
            onClick={addSynonym}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            + 類義語を追加
          </button>
        </div>

        {/* 対義語 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            対義語（任意）
          </label>
          {formData.antonyms.map((ant, index) => (
            <input
              key={index}
              type="text"
              value={ant}
              onChange={(e) => {
                const newAntonyms = [...formData.antonyms];
                newAntonyms[index] = e.target.value;
                setFormData(prev => ({ ...prev, antonyms: newAntonyms }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
              placeholder="例: vegetable"
            />
          ))}
          <button
            type="button"
            onClick={addAntonym}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            + 対義語を追加
          </button>
        </div>

        {/* 例文 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            例文（任意）
          </label>
          <textarea
            value={formData.exampleSentence}
            onChange={(e) => setFormData(prev => ({ ...prev, exampleSentence: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="例: I eat an apple every day."
            rows={3}
          />
        </div>

        {/* 公開設定 */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-700">
            この単語を他のユーザーと共有する（将来実装予定）
          </label>
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 px-4 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '追加中...' : '単語を追加'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
};
