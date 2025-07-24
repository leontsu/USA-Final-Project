import fs from 'fs';
import path from 'path';

// あらゆるエラーを捕まえるための最終手段
process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err, origin) => {
  console.error('CRITICAL: Uncaught Exception:', err, 'origin:', origin);
});

// パス問題を解決
const filePath = '/var/www/html/USA-Final-Project/data/sample.json';
const historicalRecords = JSON.parse(fs.readFileSync(filePath, 'utf8'));

import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({ origin: ["https://lazyta-toru.net"] }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// APIキーが読み込めているかを確認
console.log("Attempting to use API Key starting with:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 5) : "undefined");

async function getEta({ weather, period, userTime }) {
  const messages = [
    {
      role: "system",
      content: `You are “SFC-Punctuality-Predictor,” an expert travel-time forecaster for students commuting to Keio SFC.
                • Goal: Using the **current time**, current weather, comparable historical commute records, and the target class period, estimate:
                  – The ETA (arrival time at SFC) in 24-hour “HH:MM” format.
                  – A qualitative lateness-risk level ("低", "中", or "危").
                  – A short, actionable comment in Japanese (≤ 50 characters).
                • Output **must** be a single JSON object that matches this exact schema:
                  { "ETA": "HH:MM", "risk": "低|中|危", "comment": "string" }
                • Think through the data silently; **do NOT** include your reasoning—only return the JSON object.
                • If any required field is missing or malformed, respond with:
                  { "error": "説明文" }`
    },
    {
      role: "user",
      content: JSON.stringify({ weather, historicalRecords, period, userTime })
    }
  ];
  const completion = await openai.chat.completions.create({
    model: "gpt-4o", // 正しいモデル名
    response_format: { type: "json_object" },
    messages
  });
  return completion.choices[0].message.content;
}

app.post('/api/gpt', async (req, res) => {
  try {
    const { weather, period, userTime } = req.body;
    if (!weather || !period || !userTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const gptResponseString = await getEta({ weather, period, userTime });
    let responseData;
    try {
      responseData = JSON.parse(gptResponseString);
    } catch (e) {
      console.error("GPT returned a non-JSON string:", gptResponseString);
      return res.json({
        ETA: "00:00",
        risk: "エラー",
        comment: gptResponseString
      });
    }
    return res.json(responseData);
  } catch (err) {
    // ★★★ 最後の念押しで、エラーログを詳細に出力 ★★★
    console.error("APIルートで致命的なエラー:", err);
    return res.status(500).json({
      ETA: "00:00",
      risk: "エラー",
      comment: `サーバーで致命的なエラーが発生しました: ${err.message}`
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});