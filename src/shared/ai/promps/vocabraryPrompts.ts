export const REQUEST_WORD_INFO_PROMPT = (word: string) => 
    `英単語「${word}」の情報を教えてください。
    出力以下の形式の部分のみでお願いします。「\`\`\`json」などは不要です。
    {
    "english": "英単語",
    "japanese": [日本語訳5つを含めた配列],
    "synonyms": [すべての類義語を英語で表した配列],
    "antonyms": [すべての対義語を英語で表した配列],
    "exampleEnSentence": "英語の例文",
    "exampleJaSentence": "例文の日本語訳",
    "partOfSpeech": [すべての品詞(英語)],
    "pronunciation": "発音記号"
    }`

export const REQUEST_CHECK_ANSWER_PROMPT = (word: string, userAnswer: string) =>
    `ユーザーの回答「${userAnswer}」が英単語「${word}」の意味として正しいかどうかを判断してください。
    類義語や対義語も考慮して、正しい場合は「true」、誤りがある場合は「false」とだけ答えてください。
    `