//坪井さんの担当　gpt周り　

export async function gptResponse(payload) {
  if (typeof payload !== "object") {
    throw new Error("gptResponse expects an object payload");
  }
    //開発環境ではこちら
  //const res = await fetch('/app/api/gpt', {

  //本番環境ではこちら
  const res = await fetch('http://lazyta-toru.net:3000/api/gpt',{
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json(); // ここでサーバーからのJSON応答全体が'data'に格納される
  if (!res.ok) throw new Error(data.error); // サーバーがエラーを返した場合のチェック
  return data; 
}

