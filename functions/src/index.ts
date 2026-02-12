import {onRequest} from "firebase-functions/v2/https";
import {GoogleGenAI} from "@google/genai";
import * as logger from "firebase-functions/logger";

// function/.envのGEMINI_API_KEY="APIKEY"からAPIキーを取得
export const useGemini = onRequest(async (req, res) => {
  try {
    // 本番環境では削除
    // res.set("Access-Control-Allow-Origin", "http://localhost:5173");

    res.set("Access-Control-Allow-Origin", "https://englishwordlearning-d636b.web.app");
    res.set("Access-Control-Allow-Methods", "POST");
    const ai = new GoogleGenAI({});
    const prompt = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    // レスポンスを返す
    res.json({
      success: true,
      message: "Geminiリクエスト成功！",
      geminiResponse: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Gemini APIエラー:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "不明なエラー",
    });
  }
});
