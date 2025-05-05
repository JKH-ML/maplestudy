// app/api/gpt/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { content } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key not set" }, { status: 500 });
  }

  const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "사용자의 일기를 요약해서 '제목: ...' 과 '이모지: ...' 형식으로 두 줄로 출력해줘. 이모지는 1개만 출력해줘.",
        },
        {
          role: "user",
          content,
        },
      ],
    }),
  });

  const data = await gptRes.json();
  return NextResponse.json(data);
}
