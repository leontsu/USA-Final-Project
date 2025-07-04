//坪井さんの担当　gpt周り　

export async function gptResponse(payload) {
  if (typeof payload !== "object") {
    throw new Error("gptResponse expects an object payload");
  }

  try {
    const res = await fetch('http://localhost:3000/api/gpt',{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      // サーバーからエラーメッセージがあれば解析を試みる
      const errorData = await res.json().catch(() => ({ error: `Server error: ${res.status} ${res.statusText}` }));
      throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("gptResponseでのエラー:", error);
    // processcontrol.js により明確なエラーを再スローする
    throw new Error(`GPTレスポンスの取得に失敗しました: ${error.message}`);
  }
}

