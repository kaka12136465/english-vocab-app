export const REQUEST_WORD_INFO_PROMPT = (word: string) => 
    `英単語「${word}」の情報を教えてください。
    出力以下の形式で、「\`\`\`json」などは不要です。
    {
    "english": "英単語",
    "japanese": [日本語訳5つを含めた配列],
    "synonyms": [すべての類義語を英語で表した配列(5つまで)],
    "antonyms": [すべての対義語を英語で表した配列(5つまで)],
    "exampleEnSentence": "英語の例文(100文字まで)",
    "exampleJaSentence": "例文の日本語訳(100文字まで)",
    "partOfSpeech": [すべての品詞(日本語)],
    "pronunciation": "発音記号"
    }`

export const REQUEST_CHECK_ANSWER_PROMPT = (word: string, userAnswer: string) =>
    `ユーザーの回答「${userAnswer}」が英単語「${word}」の意味として正しいかどうかを判断してください。
    品詞も考慮して、正しい場合は「true」、誤りがある場合は「false」とだけ答えてください。
    `

export const REQUEST_TRANSLATE_PROMPT = (text: string) =>
    `以下の英文を自然な日本語に翻訳してください。翻訳文のみを返してください。\n"${text}"`