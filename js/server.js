import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ES6モジュールで__dirnameを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ★★★ あらゆるエラーを捕まえるための最終手段 ★★★
process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err, origin) => {
  console.error('CRITICAL: Uncaught Exception:', err, 'origin:', origin);
});

import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: ["https://lazyta-toru.net"] }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// APIキーが読み込めているかを確認
console.log("Attempting to use API Key starting with:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 5) : "undefined");

// ★★★ 改善点1: 安全なファイル読み込み ★★★
async function loadHistoricalRecords() {
  try {
    // 相対パスを使用
    const filePath = path.join(__dirname, '..', 'data', 'sample.json');
    console.log('Attempting to load file from:', filePath);
    
    const data = await fs.readFile(filePath, 'utf8');
    const records = JSON.parse(data);
    console.log('Historical records loaded successfully:', records.length, 'records');
    return records;
  } catch (error) {
    console.error('Historical records loading failed:', error.message);
    // デフォルトデータを返す
    return [
      {
        "day": "月",
        "weather": "Clear",
        "departtime": "10:00:00 AM",
        "arrivetime": "10:25:00 AM"
      }
    ];
  }
}

// ★★★ 改善点2: 時刻形式の正規化 ★★★
function normalizeTimeData(userTime) {
  try {
    // userTimeが文字列の場合とオブジェクトの場合に対応
    if (typeof userTime === 'string') {
      return userTime;
    }
    
    if (userTime && userTime.hourmin && userTime.todaysDate) {
      // "14時30分" を "14:30" に変換
      const timeStr = userTime.hourmin.replace(/時|分/g, match => match === '時' ? ':' : '');
      return {
        time: timeStr,
        day: userTime.todaysDate,
        fullDateTime: `${userTime.todaysDate}曜日 ${timeStr}`
      };
    }
    
    return userTime;
  } catch (error) {
    console.error('Time normalization error:', error);
    return userTime;
  }
}

async function getEta({ weather, period, userTime }) {
  try {
    // ★★★ 改善点3: リクエストごとに最新データを読み込み ★★★
    const historicalRecords = await loadHistoricalRecords();
    
    // ★★★ 改善点4: 時刻データの正規化 ★★★
    const normalizedUserTime = normalizeTimeData(userTime);
    
    console.log('GPT Request Data:', {
      weather,
      period,
      userTime: normalizedUserTime,
      historicalRecordsCount: historicalRecords.length
    });

    const messages = [
      {
        role: "system",
        content: `You are "SFC-Punctuality-Predictor," an expert travel-time forecaster for students commuting to Keio SFC.
                  • Goal: Using the current time, current weather, comparable historical commute records, and the target class period, estimate:
                    – The ETA (arrival time at SFC) in 24-hour "HH:MM" format.
                    – A qualitative lateness-risk level ("低", "中", or "危").
                    – A short, actionable comment in Japanese (≤ 50 characters).
                  • Class periods start times:
                    - 1限: 09:25, 2限: 11:10, 3限: 13:00, 4限: 14:45, 5限: 16:30, 6限: 18:15
                  • Output **must** be a single JSON object that matches this exact schema:
                    { "ETA": "HH:MM", "risk": "低|中|危", "comment": "string" }
                  • Think through the data silently; **do NOT** include your reasoning—only return the JSON object.
                  • If any required field is missing or malformed, respond with:
                    { "error": "データが不完全です" }`
      },
      {
        role: "user",
        content: JSON.stringify({ 
          weather, 
          historicalRecords, 
          period, 
          userTime: normalizedUserTime 
        })
      }
    ];
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages,
      max_tokens: 150,
      temperature: 0.7
    });
    
    return completion.choices[0].message.content;
    
  } catch (error) {
    console.error('getEta function error:', error);
    throw error;
  }
}

app.post('/api/gpt', async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    
    const { weather, period, userTime } = req.body;
    
    // ★★★ 改善点5: より詳細な入力値検証 ★★★
    if (!weather || !period || !userTime) {
      console.error('Missing required fields:', { weather: !!weather, period: !!period, userTime: !!userTime });
      return res.status(400).json({ 
        error: "必須フィールドが不足しています",
        received: { weather: !!weather, period: !!period, userTime: !!userTime }
      });
    }

    const gptResponseString = await getEta({ weather, period, userTime });
    console.log('GPT raw response:', gptResponseString);
    
    let responseData;
    try {
      responseData = JSON.parse(gptResponseString);
    } catch (e) {
      console.error("GPT returned a non-JSON string:", gptResponseString);
      return res.json({
        ETA: "00:00",
        risk: "エラー",
        comment: "JSON解析エラー"
      });
    }

    // ★★★ 改善点6: レスポンス形式の検証 ★★★
    if (!responseData.ETA && !responseData.error) {
      console.warn("GPT response missing ETA field:", responseData);
      responseData.ETA = "00:00";
    }
    if (!responseData.risk && !responseData.error) {
      responseData.risk = "不明";
    }
    if (!responseData.comment && !responseData.error) {
      responseData.comment = "コメントなし";
    }

    console.log('Final response:', responseData);
    return res.json(responseData);
    
  } catch (err) {
    console.error("APIルートで致命的なエラー:", err);
    console.error("Error stack:", err.stack);
    return res.status(500).json({
      ETA: "00:00",
      risk: "エラー",
      comment: `サーバーエラー: ${err.message}`
    });
  }
});

// ★★★ 改善点7: ヘルスチェックエンドポイント ★★★
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// ★★★ 改善点8: 静的ファイルの提供 ★★★
app.use(express.static(path.join(__dirname, '..')));

// ★★★ 改善点9: サーバー起動時の初期化チェック ★★★
async function startServer() {
  try {
    // APIキーの存在確認
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    
    // サーバー起動前に重要なファイルの存在を確認
    await loadHistoricalRecords();
    
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();