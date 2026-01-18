export const requestGemini = async (prompt: string): Promise<string> => {
  try{
    const response = await fetch(
      "https://us-central1-englishwordlearning-d636b.cloudfunctions.net/useGemini",
      {
        method: "POST",
        body: prompt,
      }
    );
    if(!response.ok){
      console.error("https://us-central1-englishwordlearning-d636b.cloudfunctions.net/useGeminiレスポンスが正常に受け取れませんでした。");
      console.error(response);
      throw new Error("HTTPSリクエストの失敗");
    }

    const jsonData = await response.json();
    if(!jsonData.success){
      console.error("AIからのレスポンスが正常に受け取れませんでした。");
      console.error(jsonData);
      throw new Error("AIへのリクエスト失敗");
    }

    const resultText = jsonData.geminiResponse.candidates[0].content.parts[0].text;
    return resultText;
  }catch(err){
    console.error(err);
    throw new Error("「" + prompt + "」のGeminiリクエストに失敗しました。");
  }
}