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
      content: `あなたはSFCへの通学時間を予測する専門家「SFC-Punctuality-Predictor」です。
              ・役割: 天候(weather)、過去の通勤記録(historicalRecords)、現在時刻(userTime)、目標の時限(period)を分析し、学生のSFC到着時間を予測します。
              ・各時限の開始時刻: 1限:9:25, 2限:11:10, 3限:13:00, 4限:14:45, 5限:16:30, 6限:18:15
              
              ### 出力ルール
              1.  **予測成功時**: 以下のJSONオブジェクト"だけ"を返すこと。
              { "ETA": "HH:MM", "risk": "低" | "中" | "危", "comment": "50字以内の日本語コメント" }
              2.  **エラー発生時**: 入力情報が不足している、または異常な場合は、以下のJSONオブジェクト"だけ"を返すこと。
              { "ETA": "00:00", "risk": "エラー", "comment": "エラーが発生しました。{具体的な説明}" }
               3.  **最重要**: いかなる状況でも、あなたの応答は指定されたJSONオブジェクト形式でなければならない。説明や思考プロセスは絶対に含めないこと。`
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

    const gptResponseString = await getEta({ weather, period, userTime });

    // --- ここからが修正箇所 ---
    try {
      // まずはJSONとして扱えるか試す
      const response = JSON.parse(gptResponseString);
      return res.json(response); // 成功すればそのまま返す
    } catch (parseError) {
      // JSON.parse()が失敗した場合 (GPTがプレーンな文字列を返した場合)
      // gptResponseStringをそのままエラーメッセージとして利用する
      console.log("GPTがJSONではない文字列を返したため、整形します:", gptResponseString);
      return res.json({
        ETA: "00:00",
        risk: "エラー",
        comment: `エラーが発生しました。${gptResponseString}`
      });
    }
    // --- ここまで ---

  } catch (err) {
    // OpenAIのAPIキーが違うなど、根本的なエラー
    return res.status(500).json({ error: err.message });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}); 