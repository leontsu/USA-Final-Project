//坪井さんの担当　gpt周り　

export async function gptResponse(payload) {
  if (typeof payload !== "object") {
    throw new Error("gptResponse expects an object payload");
  }
  const res = await fetch('/app/api/gpt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.response;
}

