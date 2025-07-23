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

app.use(express.json());

//開発環境ではここをコメントアウト
app.use(cors({
  origin: ["https://lazyta-toru.net"], // ← あなたのサイトのドメイン名を指定
  methods: ["POST"],
  allowedHeaders: ["Content-Type"]
}));
//開発環境の時のコメントアウトはここまで

/*本番環境ではここをコメントアウト
const corsOptions = {
origin: 'http://127.0.0.1:5500' // 開発用フロントエンドのオリジンを許可
};
app.use(cors(corsOptions));
*/
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
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get the raw string response from GPT
    const gptResponseString = await getEta({ weather, period, userTime });

    // Check if the string is valid JSON before parsing
    let responseData;
    try {
      responseData = JSON.parse(gptResponseString);
    } catch (e) {
      // If JSON.parse fails, it means GPT sent a plain or broken string.
      // We will treat this string as the error comment.
      console.error("GPT returned a non-JSON string:", gptResponseString);
      return res.json({
        ETA: "00:00",
        risk: "エラー",
        comment: gptResponseString
      });
    }

    // If parsing was successful, send the data
    return res.json(responseData);

  } catch (err) {
    // This now only catches major errors like OpenAI API key issues
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