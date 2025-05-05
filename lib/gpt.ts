export async function generateMoodSummary(content: string) {
  const res = await fetch("/api/gpt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  const data = await res.json();

  const result = data.choices?.[0]?.message?.content ?? "";
  const [titleLine, emojiLine] = result.split("\n");

  const title = titleLine?.replace(/제목[:：]?\s*/, "").trim();
  const emoji = emojiLine?.replace(/이모지[:：]?\s*/, "").trim();

  return { title, emoji };
}
