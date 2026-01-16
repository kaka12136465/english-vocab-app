import { requestGemini } from "@/lib/geminiRequestService";

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
  
  console.log("fetch from", `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)

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

  console.log("発音", entry.phonetics)
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

export const translateEnToJp = async (enWord: string): Promise<string> => {
  try{
    const prompt = enWord + "のすべての和訳のみをカンマ区切りで3つ"
    return requestGemini(prompt);
  }catch(err){
    console.error(err);
    throw new Error(enWord + "の日本語への翻訳に失敗しました");
  }
}