import { db } from "@/lib/firebase";
import { defaultWord, Word } from "@/types";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

/**
 * 
 * @param originalData 
 * @param convertedData 
 * @param logic originalDataの属性を、convertedDataのどの属性に当てはめるか決定するロジック
 * @param defaultNewData originalDataの属性がnullやundefinedだった場合に、convertedDataの属性に入れるデフォルトの値
 * @returns convertedDataの属性に、originalDataの属性を当てはめた新しいオブジェクト
 */
export const convertDataType = async (originalData: any, logic: Record<string, string>, defaultNewData: any): Promise<any> => {
    const newData: any = defaultNewData ? { ...defaultNewData } : {};
    
    for (const [originalKey, newKey] of Object.entries(logic)) {
        if (originalData[originalKey] !== null && originalData[originalKey] !== undefined && logic[originalKey] !== "") {
            newData[newKey] = originalData[originalKey];
        }
    }
    return newData;
}

interface OldWord {
  id: string;
  english: string;
  japanese: string[];
  synonyms: string[];
  antonyms: string[];
  exampleSentence: string;
  pronunciation: string; // 発音
  audioUrl: string;
  createdAt?: Timestamp; // 作成日時（オプション）
  wordBookId: string; // この単語を所有している単語帳のID
  index: number; // インデックス
  description: string; // 単語の補足説明
}
export const convertOldWordToNewWord = async (oldWord: OldWord, wordId: string): Promise<any> => {
    const logic: Record<string, string> = {
        english: "english",
        japanese: "japanese",
        synonyms: "synonyms",
        antonyms: "antonyms",
        exampleSentence: "exampleEnSentence",
        pronunciation: "pronunciation",
        audioUrl: "",
        createdAt: "createdAt",
        wordBookId: "wordBookId",
        index: "index",
        description: "description"
    };
    return convertDataType(oldWord, logic, { ...defaultWord, id: wordId });
}

export const convert = async (word: Word) => {
    const DocRef = doc(db, "words", word.id);
    const docSnap = await getDoc(DocRef);
    if (docSnap.exists()) {
        const oldWordData = docSnap.data() as OldWord;
        const newWordData = await convertOldWordToNewWord(oldWordData, docSnap.id);
        console.log("id", docSnap.id);
        console.log("変換後のデータ:", newWordData);
        setDoc(DocRef, newWordData);
    } else {
        console.log("No such document!");
    }
}