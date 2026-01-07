import { useState, useCallback } from 'react';
import { Word } from '@/types';
import { AddWordFormData, UserWord } from '../types/vocabulary.types';
import * as vocabularyService from '../services/vocabularyService';

/**
 * 単語管理を行うカスタムフック
 */
export const useVocabulary = (userId: string | null) => {
  const [words, setWords] = useState<Word[]>([]);
  const [userWords, setUserWords] = useState<UserWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 全ての単語を読み込み（共通 + ユーザー個別）
   */
  const loadAllWords = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const allWords = await vocabularyService.getAllWordsForUser(userId);
      setWords(allWords);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * ユーザーの単語のみ読み込み
   */
  const loadUserWords = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const words = await vocabularyService.getUserWords(userId);
      setUserWords(words);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * 新しい単語を追加
   */
  const addWord = useCallback(async (
    formData: AddWordFormData,
    isPublic: boolean = false
  ): Promise<boolean> => {
    if (!userId) {
      setError('ログインが必要です');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // 重複チェック
      const isDuplicate = await vocabularyService.checkDuplicateWord(
        userId,
        formData.english
      );

      if (isDuplicate) {
        setError('この単語は既に登録されています');
        return false;
      }

      // 単語を追加
      await vocabularyService.addUserWord(userId, formData, isPublic);

      // 単語リストを再読み込み
      await loadAllWords();
      await loadUserWords();

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, loadAllWords, loadUserWords]);

  /**
   * 単語を検索
   */
  const searchWords = useCallback(async (searchTerm: string): Promise<Word[]> => {
    setLoading(true);
    setError(null);

    try {
      const results = await vocabularyService.searchWords(searchTerm);
      return results;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    words,
    userWords,
    loading,
    error,
    loadAllWords,
    loadUserWords,
    addWord,
    searchWords,
  };
};
