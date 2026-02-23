import { useState, useCallback } from 'react';
import { WordData, Word } from '@/types';
import { EditWordFormData } from '../types/vocabulary.types';
import * as vocabularyService from '../services/vocabularyService';
import * as wordBookService from '../services/wordBookService';
import { Timestamp } from 'firebase/firestore';

/**
 * 単語管理を行うカスタムフック
 */
export const useVocabulary = (wordBookId: string | null) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 指定の単語帳にある単語をwordsへ読み込み
   */
  const loadWordsInWordBook = useCallback(async () => {
    if (!wordBookId) return;

    setLoading(true);
    setError(null);

    try {
      const words = await wordBookService.getWordsInWordBook(wordBookId);
      setWords(words);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [wordBookId]);

  /**
   * 単語帳に新しい単語を追加
   */
  const addWord = useCallback(async (
    formData: WordData
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
        createdAt: Timestamp.now(),
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
   * 単語帳内の単語を検索
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

  /**
   * 単語データを更新する
   */
  const updateWordInWordBook = useCallback(async (oldWordId:string, newWord:EditWordFormData) => {
    // 単語データがなければエラーを返す
    try{
      if(!words.find(word => word.id === oldWordId)){
        console.error("単語が存在しません");
        throw new Error("単語が存在しません");
      }
      await wordBookService.updateWord(oldWordId, newWord);
      return true;
    }catch(err){
      console.error(err);
      throw new Error("単語の更新に失敗しました");
    }
  }, [words]);

  return {
    words,
    loading,
    error,
    loadWordsInWordBook,
    addWord,
    searchWords,
    updateWordInWordBook,
  };
};
