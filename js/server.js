import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// この3行で、server.jsの場所を基準に絶対パスを生成します
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const historicalRecords = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'sample.json'), 'utf8')
);

import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

// app.use(cors()); // ← こちらをコメントアウト
app.use(express.json());

//開発環境ではここをコメントアウト
app.use(cors({
    origin: ["https://lazyta-toru.net"], // ← あなたのサイトのドメイン名を指定
    methods: ["POST"],
    allowedHeaders: ["Content-Type"]
  }));

  

  /*本番環境ではここをコメントアウト
const corsOptions = {
  origin: 'http://127.0.0.1:5500' // 開発用フロントエンドのオリジンを許可
};*/

app.use(cors(corsOptions));
app.use(express.json());


//コメントアウトはここまで
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});



// Use this for production - avoids CORS errors
// app.use(cors({
//     origin: ["https://your-frontend.example.com"],
//     methods: ["POST"],
//     allowedHeaders: ["Content-Type", "Authorization"]
//   }));


// This code: Station --> SFC
async function getEta({ weather, period, userTime }) {
  const messages = [
    {
      role: "system",
      content: `You are “SFC‑Punctuality‑Predictor,” an expert travel‑time forecaster for students commuting to Keio SFC.
                • Goal: Using the current weather(weather), comparable historical commute records, the current time and day of the week (userTime) and the target class period(period).

                Start time of each period is as follows:
                Period1 9:25~
                Period2 11:10~
                Period3 13:00~
                Period4 14:45~
                Period5 16:30~
                Period6 18:15~

                 
                Your objective is to estimate:
                  – The ETA (arrival time at SFC) in 24‑hour “HH:MM” format.
                  – A qualitative lateness‑risk level ("低", "中", or "危").
                  – A short, actionable comment in Japanese (≤ 50 characters).
                • Output must be a single JSON object that matches this exact schema:
                  { "ETA": "HH:MM", "risk": "低|中|危", "comment": "string" }
                • Think through the data silently; do NOT include your reasoning—only return the JSON object.
                • If any required field is missing or malformed, respond with:
                  { "comment": "エラーが発生しました。{説明文はここ}" }`
    },
    {
      role: "user",
      content: JSON.stringify({ weather, historicalRecords, period, userTime })
    }
  ];
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    response_format: { type: "json_object" },
    messages
  });
  return completion.choices[0].message.content;
}

app.post('/api/gpt', async (req, res) => {
  try {
    const { weather, period, userTime } = req.body;
    if (!weather || !period || !userTime) {
      return res.status(400).json({ error: "Missing required fields: weather, period, userTime" });
    }
    const response = await getEta({ weather, period, userTime });
    return res.json({ response });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}); 