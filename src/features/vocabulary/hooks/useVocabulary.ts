import { useState, useCallback } from 'react';
import { Word } from '@/types';
import { AddWordFormData, UserWord } from '../types/vocabulary.types';
import * as vocabularyService from '../services/vocabularyService';
import * as wordBookService from '../services/wordBookService';

/**
 * 単語管理を行うカスタムフック
 */
export const useVocabulary = (wordBookId: string | null) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 指定の単語帳にある単語を読み込み
   */
  const loadWordsInWordBook = useCallback(async () => {
    if (!wordBookId) return;

    setLoading(true);
    setError(null);

    try {
      const words = await wordBookService.getWordsInWordBook(wordBookId);
      console.log("loaded words", words);
      setWords(words);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [wordBookId]);

  /**
   * 新しい単語を追加
   */
  const addWord = useCallback(async (
    formData: AddWordFormData
  ): Promise<boolean> => {

    setLoading(true);
    setError(null);

    try {
      // 重複チェック
      const isDuplicate = await wordBookService.checkDuplicateWordInWordBook(
        wordBookId!,
        formData.english
      );

      if (isDuplicate) {
        setError('この単語は既に登録されています');
        return false;
      }

      // 単語を追加
      await wordBookService.addWordToWordBook({
        ...formData,
        wordBookId: wordBookId!,
        createdAt: new Date(),
        audioUrl: '',
      });

      // 単語リストを再読み込み
      await loadWordsInWordBook();

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [wordBookId, loadWordsInWordBook]);

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
  console.log("words", words);

  return {
    words,
    loading,
    error,
    loadWordsInWordBook,
    addWord,
    searchWords,
  };
};
