import { requestGemini } from "@/shared/ai/services/geminiRequestService";
import { REQUEST_TRANSLATE_PROMPT, REQUEST_WORD_INFO_PROMPT } from "@/shared/ai/promps/vocabraryPrompts";
import { Word } from "@/types";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// wordScrapingService.ts
interface ScrapingWordData {
  english: string;
  japanese: Set<string>;
  synonyms: Set<string>;
  antonyms: Set<string>;
  exampleSentence: string;
  pronunciation: string;
  isFound: boolean;
}

interface DictionaryAPIResponse {
  word: string;
  phonetics: any[];
  meanings: Array<{
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }>;
    synonyms?: string[];
    antonyms?: string[];
  }>;
}

export async function scrapeWord(word: string): Promise<ScrapingWordData> {
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
  );

  if (!response.ok) {
    if (response.status === 404){
      return {
          isFound: false,
          english: "",
          synonyms: new Set<string>(),
          antonyms: new Set<string>(),
          pronunciation: "",
          japanese: new Set<string>(),
          exampleSentence: "",
      }
    }
    throw new Error("API request failed");
  }

  const data: DictionaryAPIResponse[] = await response.json();
  const entry = data[0];

  let pronunciation: string = "";
  const allSynonyms = new Set<string>();
  const allAntonyms = new Set<string>();
  const meanings: Set<string> = new Set<string>();
  const examples: string[] = [];
  const isFound: boolean = true;

  entry.phonetics.forEach((phonetic) => {
    if(phonetic.text) pronunciation = phonetic.text;
  });

  entry.meanings.forEach((meaning) => {
    meaning.definitions.forEach((def) => {
      meanings.add(def.definition);
      if (def.example) examples.push(def.example);
      def.synonyms?.forEach((s) => allSynonyms.add(s));
      def.antonyms?.forEach((a) => allAntonyms.add(a));
    });
    meaning.synonyms?.forEach((s) => allSynonyms.add(s));
    meaning.antonyms?.forEach((a) => allAntonyms.add(a));
  });

  return {
    english: entry.word,
    japanese: meanings, // 英語の定義
    synonyms: allSynonyms,
    antonyms: allAntonyms,
    exampleSentence: examples[0] || "",
    pronunciation: pronunciation,
    isFound,
  };
}

export const requestWordInfo = async (enWord: string): Promise<string> => {
  if (enWord.length > 100) {
    throw new Error("入力が長すぎます。100文字以下にしてください。");
  }

  // 辞書APIとAIを並列実行
  const [dictResult, aiResult] = await Promise.allSettled([
    scrapeWord(enWord),
    (async () => {
      const prompt = REQUEST_WORD_INFO_PROMPT(enWord);
      const response = await requestGemini(prompt);
      const match = response.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AIからのレスポンスが不正です。");
      return JSON.parse(match[0]);
    })(),
  ]);

  if (aiResult.status === 'rejected') {
    console.error(aiResult.reason);
    throw new Error(enWord + "の日本語への翻訳に失敗しました");
  }

  const wordInfo = aiResult.value;

  // 辞書APIの結果で発音・類義語・対義語・例文を補完
  if (dictResult.status === 'fulfilled' && dictResult.value.isFound) {
    const dict = dictResult.value;
    if (dict.pronunciation) wordInfo.pronunciation = dict.pronunciation;
    if (dict.synonyms.size > 0) wordInfo.synonyms = [...dict.synonyms].slice(0, 5);
    if (dict.antonyms.size > 0) wordInfo.antonyms = [...dict.antonyms].slice(0, 5);
    if (dict.exampleSentence) wordInfo.exampleEnSentence = dict.exampleSentence;
  }

  return JSON.stringify(wordInfo);
}

export const translateEnToJa = async (text: string): Promise<string> => {
  if (!text.trim()) throw new Error("翻訳する文章を入力してください");
  const prompt = REQUEST_TRANSLATE_PROMPT(text);
  const response = await requestGemini(prompt);
  return response.trim();
}

export const addWordInfo = async (word: Word): Promise<void> => {
  try{
    const wordInfoStr = await requestWordInfo(word.english);
    const wordInfo = JSON.parse(wordInfoStr);
    const japaneseSet = new Set<string>([...(word.japanese ?? []), ...(wordInfo.japanese ?? [])]);
    const newWord: Word = {
      english: word.english && word.english !== "" ? word.english : wordInfo.english ?? "",
      japanese: Array.from(japaneseSet),
      synonyms: wordInfo.synonyms ?? [],
      antonyms: wordInfo.antonyms ?? [],
      exampleEnSentence: wordInfo.exampleEnSentence ?? "",
      exampleJaSentence: wordInfo.exampleJaSentence ?? "",
      partOfSpeech: wordInfo.partOfSpeech ?? [],
      pronunciation: wordInfo.pronunciation ?? "",
      index: word.index ?? wordInfo.index ?? 0,
      description: word.description ?? "",
      id: word.id,
      wordBookId: word.wordBookId,
      createdAt: word.createdAt
    };
    const DocRef = doc(db, "words", word.id);
    await setDoc(DocRef, newWord);
  }catch(err){
    console.error(err);
    throw new Error(word.english + "の情報の取得に失敗しました");
  }
}