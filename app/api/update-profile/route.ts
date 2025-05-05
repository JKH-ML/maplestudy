import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { nickname, avatar_url } = await req.json();

  if (!nickname || !avatar_url) {
    return NextResponse.json({ error: "닉네임 또는 이미지 URL이 없습니다." }, { status: 400 });
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  if (getUserError || !user) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      nickname,
      avatar_url,
    },
  });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "프로필이 성공적으로 수정되었습니다." });
}
