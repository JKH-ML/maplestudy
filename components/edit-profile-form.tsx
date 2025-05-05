"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function EditProfileForm({
  currentNickname,
  currentAvatar,
}: {
  currentNickname: string;
  currentAvatar: string;
}) {
  const [nickname, setNickname] = useState(currentNickname);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  async function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = (reader.result as string).split(",")[1]; // base64 only
        resolve(result);
      };
      reader.onerror = reject;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let avatarUrl = currentAvatar;

    if (avatarFile) {
      const base64 = await fileToBase64(avatarFile);
      const res = await fetch("/api/upload-imgur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      const result = await res.json();
      if (result?.data?.link) {
        avatarUrl = result.data.link;
      } else {
        toast.error("❌ 이미지 업로드 실패");
        return;
      }
    }

    const res = await fetch("/api/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, avatar_url: avatarUrl }),
    });

    const result = await res.json();
    toast(result.message || "수정 완료!");

    setIsEditing(false);
    window.location.reload(); // ✅ 바로 반영
  }

  return (
    <div className="mt-4 w-full max-w-md">
      {/* ✅ 수정하기 버튼을 outline 스타일로 변경 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditing(!isEditing)}
      >
        {isEditing ? "취소" : "수정하기"}
      </Button>

      {isEditing && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">프로필 이미지</Label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button type="submit" size="sm">
            저장하기
          </Button>
        </form>
      )}
    </div>
  );
}
