// wordScrapingService.ts
interface ScrapingWordData {
  english: string;
  japanese: string[];
  synonyms: string[];
  antonyms: string[];
  exampleSentence: string;
  pronunciation: string;
  isFound: boolean;
}

interface DictionaryAPIResponse {
  word: string;
  phonetic?: string;
  meanings: Array<{
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }>;
  }>;
}

export async function scrapeWeblio(word: string): Promise<ScrapingWordData> {
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
  );

  if (!response.ok) {
    if (response.status === 404){
      return {
          isFound: false,
          english: "",
          synonyms: [],
          antonyms: [],
          pronunciation: "",
          japanese: [],
          exampleSentence: "",
      }
    }
    throw new Error("API request failed");
  }

  const data: DictionaryAPIResponse[] = await response.json();
  const entry = data[0];

  const allSynonyms = new Set<string>();
  const allAntonyms = new Set<string>();
  const meanings: string[] = [];
  const examples: string[] = [];
  const isFound: boolean = true;

  entry.meanings.forEach((meaning) => {
    meaning.definitions.forEach((def) => {
      meanings.push(def.definition);
      if (def.example) examples.push(def.example);
      def.synonyms?.forEach((s) => allSynonyms.add(s));
      def.antonyms?.forEach((a) => allAntonyms.add(a));
    });
  });

  return {
    english: entry.word,
    japanese: meanings, // 英語の定義
    synonyms: Array.from(allSynonyms),
    antonyms: Array.from(allAntonyms),
    exampleSentence: examples[0] || "",
    pronunciation: entry.phonetic || "",
    isFound,
  };
}