import React, { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import * as vocabularyService from '../services/vocabularyService';

interface AddWordBookFormProps {
  onCreated?: (id: string) => void;
  onCancel: () => void;
}

export const AddWordBookForm: React.FC<AddWordBookFormProps> = ({ onCreated, onCancel }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user?.uid) {
      setError('サインインが必要です');
      return;
    }

    if (!name.trim()) {
      setError('単語帳名を入力してください');
      return;
    }

    setLoading(true);
    try {
      const id = await vocabularyService.addWordBook(name, description, user.uid);
      // 成功時はコールバックで親に通知
      if (onCreated) onCreated(id);
      // フォームをリセット
      setName('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || '単語帳の追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">新しい単語帳を追加</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            単語帳名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="例: 英検単語帳"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">説明（任意）</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="この単語帳についての説明を入力してください（例: 2級対策など）"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 px-4 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '追加中...' : '単語帳を追加'}
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
