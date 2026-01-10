import { db } from "@/lib/firebase";
import { Word, WordBook } from "@/types";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";

const WORD_BOOKS_COLLECTION = "wordBooks";
const WORDS_COLLECTION = "words";


/**
 * 指定の単語帳にある単語を取得
 * @param wordBookId 
 * @returns 
 */
export const getWordsInWordBook = async (wordBookId: string): Promise<Word[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, WORDS_COLLECTION));
    return querySnapshot.docs
        .map(doc => {
            if (doc.data().wordBookId === wordBookId) {
                return { id: doc.id, ...doc.data() } as Word;
            }
        })
        .filter((word): word is Word => word !== undefined);
  } catch (error) {
    console.error("Error fetching word books:", error);
    throw new Error("単語帳一覧の取得に失敗しました");
  }
};

export const addWordToWordBook = async (
  word: Omit<Word, 'id'>,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, WORDS_COLLECTION), {
        ...word
    });

    return docRef.id;
  } catch (error: any) {
    console.error("Error adding word to word book:", error);
    throw new Error(error.message || "単語の追加に失敗しました");
  }
};

export const checkDuplicateWordInWordBook = async (
  wordBookId: string,
  english: string
): Promise<boolean> => {
  try {
    const querySnapshot = await getDocs(collection(db, WORDS_COLLECTION));
    const duplicate = querySnapshot.docs.find(doc => {
        const data = doc.data();
        return data.wordBookId === wordBookId && data.english.toLowerCase() === english.toLowerCase();
    });
    return !!duplicate;
  } catch (error) {
    console.error("Error checking duplicate word:", error);
    throw new Error("単語の重複チェックに失敗しました");
  }
};