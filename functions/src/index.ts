import {onRequest} from "firebase-functions/v2/https";
import {GoogleGenAI} from "@google/genai";
import * as logger from "firebase-functions/logger";

// function/.envのGEMINI_API_KEY="APIKEY"からAPIキーを取得
export const useGemini = onRequest(async (req, res) => {
  // CORSヘッダーはtryブロックの外で最初に設定する
  res.set("Access-Control-Allow-Origin", "https://englishwordlearning-d636b.web.app");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // OPTIONSリクエスト（プリフライト）には204を返して終了
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const ai = new GoogleGenAI({});
    const body = req.body;
    const prompt = body.prompt;
    const temperature = body.temperature || 0.1; // デフォルトは0.1
    const maxOutputTokens = body.maxOutputTokens || 1000; // デフォルトは1000
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        temperature: temperature,
        maxOutputTokens: maxOutputTokens,
      },
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

// テスト環境用
export const testGemini = onRequest(async (req, res) => {
  // CORSヘッダーはtryブロックの外で最初に設定する
  res.set("Access-Control-Allow-Origin", "http://localhost:5173");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // OPTIONSリクエスト（プリフライト）には204を返して終了
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const ai = new GoogleGenAI({});
    const body = req.body;
    console.log("Geminiリクエストの受信:", body);
    const prompt = body.prompt;
    const temperature = body.temperature || 0.1; // デフォルトは0.1
    const maxOutputTokens = body.maxOutputTokens || 1000; // デフォルトは1000
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        temperature: temperature,
        maxOutputTokens: maxOutputTokens,
      },
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
