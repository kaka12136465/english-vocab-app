/**
 * Firestore にサンプル単語データを追加するスクリプト
 * 
 * 使用方法:
 * 1. Firebase Console でプロジェクトを作成
 * 2. Firestore を有効化
 * 3. Firebase Console の Firestore セクションで以下のデータを手動で追加
 * 
 * または、Firebase Admin SDK を使用して以下のデータをインポート
 */

export const sampleWords = [
  {
    english: "apple",
    japanese: ["りんご", "リンゴ"],
    synonyms: [],
    antonyms: [],
    exampleSentence: "I eat an apple every day.",
    pronunciation: "ˈæp.əl",
    audioUrl: ""
  },
  {
    english: "book",
    japanese: ["本", "書籍"],
    synonyms: ["publication", "volume"],
    antonyms: [],
    exampleSentence: "This is an interesting book.",
    pronunciation: "bʊk",
    audioUrl: ""
  },
  {
    english: "cat",
    japanese: ["猫", "ネコ"],
    synonyms: ["feline"],
    antonyms: ["dog"],
    exampleSentence: "The cat is sleeping on the sofa.",
    pronunciation: "kæt",
    audioUrl: ""
  },
  {
    english: "dog",
    japanese: ["犬", "イヌ"],
    synonyms: ["canine", "puppy"],
    antonyms: ["cat"],
    exampleSentence: "My dog loves to play fetch.",
    pronunciation: "dɔːɡ",
    audioUrl: ""
  },
  {
    english: "easy",
    japanese: ["簡単な", "易しい"],
    synonyms: ["simple", "effortless"],
    antonyms: ["difficult", "hard"],
    exampleSentence: "This test is very easy.",
    pronunciation: "ˈiː.zi",
    audioUrl: ""
  },
  {
    english: "friend",
    japanese: ["友達", "友人"],
    synonyms: ["companion", "buddy"],
    antonyms: ["enemy", "foe"],
    exampleSentence: "She is my best friend.",
    pronunciation: "frend",
    audioUrl: ""
  },
  {
    english: "good",
    japanese: ["良い", "優れた"],
    synonyms: ["excellent", "great"],
    antonyms: ["bad", "poor"],
    exampleSentence: "That's a good idea!",
    pronunciation: "ɡʊd",
    audioUrl: ""
  },
  {
    english: "happy",
    japanese: ["幸せな", "嬉しい"],
    synonyms: ["joyful", "cheerful"],
    antonyms: ["sad", "unhappy"],
    exampleSentence: "I am happy to see you.",
    pronunciation: "ˈhæp.i",
    audioUrl: ""
  },
  {
    english: "house",
    japanese: ["家", "住宅"],
    synonyms: ["home", "residence"],
    antonyms: [],
    exampleSentence: "They live in a big house.",
    pronunciation: "haʊs",
    audioUrl: ""
  },
  {
    english: "important",
    japanese: ["重要な", "大切な"],
    synonyms: ["significant", "crucial"],
    antonyms: ["unimportant", "trivial"],
    exampleSentence: "This is an important meeting.",
    pronunciation: "ɪmˈpɔː.tənt",
    audioUrl: ""
  },
  {
    english: "learn",
    japanese: ["学ぶ", "習得する"],
    synonyms: ["study", "acquire"],
    antonyms: ["forget", "unlearn"],
    exampleSentence: "I want to learn English.",
    pronunciation: "lɜːn",
    audioUrl: ""
  },
  {
    english: "love",
    japanese: ["愛", "愛する"],
    synonyms: ["affection", "adore"],
    antonyms: ["hate", "dislike"],
    exampleSentence: "I love my family.",
    pronunciation: "lʌv",
    audioUrl: ""
  },
  {
    english: "music",
    japanese: ["音楽", "曲"],
    synonyms: ["melody", "tune"],
    antonyms: [],
    exampleSentence: "I enjoy listening to music.",
    pronunciation: "ˈmjuː.zɪk",
    audioUrl: ""
  },
  {
    english: "new",
    japanese: ["新しい", "新品の"],
    synonyms: ["fresh", "recent"],
    antonyms: ["old", "ancient"],
    exampleSentence: "I bought a new car.",
    pronunciation: "njuː",
    audioUrl: ""
  },
  {
    english: "person",
    japanese: ["人", "人物"],
    synonyms: ["individual", "human"],
    antonyms: [],
    exampleSentence: "He is a kind person.",
    pronunciation: "ˈpɜː.sən",
    audioUrl: ""
  },
  {
    english: "school",
    japanese: ["学校"],
    synonyms: ["educational institution"],
    antonyms: [],
    exampleSentence: "Children go to school every day.",
    pronunciation: "skuːl",
    audioUrl: ""
  },
  {
    english: "time",
    japanese: ["時間", "時刻"],
    synonyms: ["period", "duration"],
    antonyms: [],
    exampleSentence: "What time is it now?",
    pronunciation: "taɪm",
    audioUrl: ""
  },
  {
    english: "water",
    japanese: ["水"],
    synonyms: ["liquid", "aqua"],
    antonyms: [],
    exampleSentence: "I drink water every morning.",
    pronunciation: "ˈwɔː.tər",
    audioUrl: ""
  },
  {
    english: "work",
    japanese: ["仕事", "働く"],
    synonyms: ["job", "employment"],
    antonyms: ["rest", "leisure"],
    exampleSentence: "I work at a bank.",
    pronunciation: "wɜːk",
    audioUrl: ""
  },
  {
    english: "world",
    japanese: ["世界", "地球"],
    synonyms: ["globe", "earth"],
    antonyms: [],
    exampleSentence: "People all over the world love music.",
    pronunciation: "wɜːld",
    audioUrl: ""
  }
];

/**
 * Firebase Console での手動追加手順:
 * 
 * 1. Firebase Console にアクセス
 * 2. プロジェクトを選択
 * 3. Firestore Database に移動
 * 4. "コレクションを開始" をクリック
 * 5. コレクションID: "words" と入力
 * 6. 上記の各オブジェクトをドキュメントとして追加
 *    - ドキュメントIDは自動生成
 *    - 各フィールドを手動で追加
 * 
 * または、Firebase Admin SDK を使用:
 * 
 * ```javascript
 * import admin from 'firebase-admin';
 * import { sampleWords } from './sampleData';
 * 
 * const db = admin.firestore();
 * const batch = db.batch();
 * 
 * sampleWords.forEach((word) => {
 *   const docRef = db.collection('words').doc();
 *   batch.set(docRef, word);
 * });
 * 
 * await batch.commit();
 * ```
 */
