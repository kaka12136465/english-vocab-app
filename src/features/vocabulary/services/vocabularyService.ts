import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Word, WordBook } from '@/types';
import { AddWordFormData, UserWord, WordValidationResult } from '../types/vocabulary.types';

const WORDS_COLLECTION = 'words';
const USER_WORDS_COLLECTION = 'userWords';
const WORD_BOOKS_COLLECTION = 'wordBooks';

/**
 * データベースにある単語IDから単語データを取得
 */
export const getWordById = async (wordId: string): Promise<Word | null> => {
  try {
    const docRef = doc(db, WORDS_COLLECTION, wordId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Word;
    }
    return null;
  } catch (error) {
    console.error('Error fetching word:', error);
    throw new Error('単語の取得に失敗しました');
  }
};

/**
 * データベース内の全ての単語を取得
 */
export const getAllWords = async (): Promise<Word[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, WORDS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Word[];
  } catch (error) {
    console.error('Error fetching words:', error);
    throw new Error('単語一覧の取得に失敗しました');
  }
};

/**
 * データベースからランダムに指定数の単語を取得
 */
export const getRandomWords = async (count: number): Promise<Word[]> => {
  try {
    const allWords = await getAllWords();
    
    // Fisher-Yates シャッフルアルゴリズム
    const shuffled = [...allWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, Math.min(count, shuffled.length));
  } catch (error) {
    console.error('Error fetching random words:', error);
    throw new Error('ランダム単語の取得に失敗しました');
  }
};

/**
 * 指定されたIDリストに対応する単語をデータベースから取得し、単語リストを返す
 */
export const getWordsByIds = async (wordIds: string[]): Promise<Word[]> => {
  try {
    const words: Word[] = [];
    
    for (const wordId of wordIds) {
      const word = await getWordById(wordId);
      if (word) {
        words.push(word);
      }
    }
    
    return words;
  } catch (error) {
    console.error('Error fetching words by IDs:', error);
    throw new Error('単語の取得に失敗しました');
  }
};

/**
 * データベースから単語検索（英語または日本語）
 */
export const searchWords = async (searchTerm: string): Promise<Word[]> => {
  try {
    const allWords = await getAllWords();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return allWords.filter(word => 
      word.english.toLowerCase().includes(lowerSearchTerm) ||
      word.japanese.some(jp => jp.includes(searchTerm))
    );
  } catch (error) {
    console.error('Error searching words:', error);
    throw new Error('単語検索に失敗しました');
  }
};

/**
 * 単語データの検証
 */
export const validateWord = (formData: AddWordFormData): WordValidationResult => {
  const errors: string[] = [];

  // 英単語のチェック
  if (!formData.english.trim()) {
    errors.push('英単語は必須です');
  } else if (!/^[a-zA-Z\s-]+$/.test(formData.english)) {
    errors.push('英単語は英字のみで入力してください');
  }

  // 日本語訳のチェック
  if (formData.japanese.length === 0 || !formData.japanese[0].trim()) {
    errors.push('日本語訳は少なくとも1つ必要です');
  }

  // 例文のチェック（任意だが、入力されている場合はチェック）
  if (formData.exampleSentence && formData.exampleSentence.length > 200) {
    errors.push('例文は200文字以内で入力してください');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * すべての単語帳を取得
 */
export const getAllWordBooks = async (): Promise<WordBook[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, WORD_BOOKS_COLLECTION));
    return querySnapshot.docs.map(doc => {
        if(doc.data()) return {
        id: doc.id,
        ...doc.data()
    } as WordBook;
    }).filter(Boolean) as WordBook[];
  } catch (error) {
    console.error('Error fetching word books:', error);
    throw new Error('単語帳の取得に失敗しました');
  }
};

/**
 * 単語帳を追加
 */
export const addWordBook = async (
  name: string,
  description: string,
  ownerId: string
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, WORD_BOOKS_COLLECTION), {
      name: name.trim(),
      description: description.trim(),
      ownerId,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error: any) {
    console.error('Error adding word book:', error);
    throw new Error(error.message || '単語帳の追加に失敗しました');
  }
};

/**
 * 指定したIDの単語をデータベースから削除
 */
export const deleteWord = async (wordId: string) => {
  try{
    await deleteDoc(doc(db, WORDS_COLLECTION, wordId));
    console.log("データを削除しました", wordId);
    return wordId;
  }catch (error: any) {
    console.error("Error delete word:", error);
    throw new Error(error.message || "単語の削除に失敗しました")
  }
}








export const getAllUserWordBooks = async (userId: string): Promise<WordBook[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, WORD_BOOKS_COLLECTION));
    return querySnapshot.docs.map(doc => {
        if(doc.data() && doc.data().uid == userId) return {
        id: doc.id,
        ...doc.data()
    } as WordBook;
    }).filter(Boolean) as WordBook[];
  } catch (error) {
    console.error('Error fetching word books:', error);
    throw new Error('単語帳の取得に失敗しました');
  }
};

/**
 * ユーザー個別の単語を追加（マイ単語帳）
 */
export const addUserWord = async (
  userId: string,
  formData: AddWordFormData,
  isPublic: boolean = false
): Promise<string> => {
  try {
    // バリデーション
    const validation = validateWord(formData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const wordData: Omit<UserWord, 'id' | 'createdAt'> = {
      userId,
      english: formData.english.trim().toLowerCase(),
      japanese: formData.japanese.filter(j => j.trim()).map(j => j.trim()),
      synonyms: formData.synonyms.filter(s => s.trim()).map(s => s.trim()),
      antonyms: formData.antonyms.filter(a => a.trim()).map(a => a.trim()),
      exampleSentence: formData.exampleSentence.trim(),
      pronunciation: formData.pronunciation.trim(),
      audioUrl: '',
      isPublic,
      wordBookId: '', // 必要に応じて単語帳IDを設定
    };

    const docRef = await addDoc(collection(db, USER_WORDS_COLLECTION), {
      ...wordData,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error: any) {
    console.error('Error adding user word:', error);
    throw new Error(error.message || '単語の追加に失敗しました');
  }
};

/**
 * ユーザーの単語一覧を取得
 */
export const getUserWords = async (userId: string): Promise<UserWord[]> => {
  try {
    const q = query(
      collection(db, "userWords"),
      where('userId', '==', userId),
      //orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as UserWord;
    });
  } catch (error) {
    console.error('Error fetching user words:', error);
    throw new Error('ユーザー単語の取得に失敗しました');
  }
};


/**
 * ユーザーの単語と共通単語を統合して取得
 */
export const getAllWordsForUser = async (userId: string): Promise<Word[]> => {
  try {
    
    const [commonWords, userWords] = await Promise.all([
      getAllWords(),
      getUserWords(userId),
    ]);

    
    

    // ユーザーの単語をWord型に変換してマージ
    const userWordsAsWords: Word[] = userWords.map(uw => ({
      id: uw.id,
      english: uw.english,
      japanese: uw.japanese,
      synonyms: uw.synonyms,
      antonyms: uw.antonyms,
      exampleSentence: uw.exampleSentence,
      pronunciation: uw.pronunciation,
      audioUrl: uw.audioUrl,
      createdAt: uw.createdAt,
      wordBookId: uw.wordBookId,
    }));

    return [...commonWords, ...userWordsAsWords];
  } catch (error) {
    console.error('Error fetching all words for user:', error);
    throw new Error('単語データの取得に失敗しました');
  }
};

/**
 * 重複チェック（同じ英単語が既に存在するか）
 */
export const checkDuplicateWord = async (
  userId: string,
  english: string
): Promise<boolean> => {
  try {
    const normalizedEnglish = english.trim().toLowerCase();

    // 共通単語での重複チェック
    const allWords = await getAllWords();
    const commonDuplicate = allWords.some(
      word => word.english.toLowerCase() === normalizedEnglish
    );

    if (commonDuplicate) return true;

    // ユーザー単語での重複チェック
    const userWords = await getUserWords(userId);
    const userDuplicate = userWords.some(
      word => word.english.toLowerCase() === normalizedEnglish
    );

    return userDuplicate;
  } catch (error) {
    console.error('Error checking duplicate word:', error);
    return false;
  }
};
