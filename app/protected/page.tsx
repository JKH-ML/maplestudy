import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditProfileForm } from "@/components/edit-profile-form";
import { ObfuscatedEmail } from "@/components/obfuscated-email"; // ✅ 추가

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const metadata = user.user_metadata as {
    nickname?: string;
    avatar_url?: string;
  };
  const nickname = metadata.nickname ?? "등록되지 않음";
  const avatarUrl = metadata.avatar_url ?? "/default-avatar.png";

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        {/* 기타 정보 or 알림 등 있을 수 있는 영역 */}
      </div>

      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">회원 정보</h2>

        <div className="text-sm leading-relaxed font-mono p-4 rounded border bg-muted w-full max-w-md space-y-2">
          <div className="flex items-center gap-2">
            <strong>이메일:</strong>
            <ObfuscatedEmail email={user.email ?? "알 수 없음"} />
          </div>
          <p>
            <strong>이메일 인증 여부:</strong>{" "}
            {user.email_confirmed_at ? "✅ 인증됨" : "❌ 미인증"}
          </p>
          <p>
            <strong>최근 로그인:</strong>{" "}
            {user.last_sign_in_at
              ? formatDate(user.last_sign_in_at)
              : "정보 없음"}
          </p>
          <p>
            <strong>가입일:</strong>{" "}
            {user.created_at ? formatDate(user.created_at) : "정보 없음"}
          </p>
          <p>
            <strong>닉네임:</strong> {nickname}
          </p>
          <div className="flex flex-col">
            <strong>프로필 이미지:</strong>
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-20 h-20 rounded-full border mt-1"
            />
          </div>
        </div>

        <EditProfileForm currentNickname={nickname} currentAvatar={avatarUrl} />

        <Button asChild variant="outline" size="sm" className="mt-6">
          <Link href="/protected/reset-password">비밀번호 재설정</Link>
        </Button>
      </div>
    </div>
  );
}
