// js/gpt.js
export async function gptResponse(payload) {
  if (typeof payload !== "object") {
    throw new Error("gptResponse expects an object payload");
  }

  try { // <-- ここから追加
    const res = await fetch('https://lazyta-toru.net/api/gpt',{ // URLはこれでOKです
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      // サーバーからエラーデータがあれば解析し、なければ一般的なエラーメッセージを表示
      const errorData = await res.json().catch(() => ({ error: `Server error: ${res.status} ${res.statusText}` }));
      throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) { // <-- ここまで追加
    console.error("gptResponseでのエラー:", error); // この行が重要
    // ここでエラーを再スローすることで、processcontrol.jsでキャッチしやすくなります
    throw new Error(`GPTレスポンスの取得に失敗しました: ${error.message}`);
  }
}