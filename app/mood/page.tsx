"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { generateMoodSummary } from "@/lib/gpt";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";
// import { Calendar } from "@/components/ui/calendar"; // ❗️달력 주석 처리

const MAX_LENGTH = 500;

type Mood = {
  id: string;
  content: string;
  title: string;
  emoji: string;
  created_at: string;
};

export default function MoodPage() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [diary, setDiary] = useState("");
  const [loading, setLoading] = useState(false);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [editTitle, setEditTitle] = useState<string>("");
  const [editEmoji, setEditEmoji] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/sign-in");
      } else {
        setUserId(session.user.id);
        fetchMoods(session.user.id);
      }
    };

    fetchUser();
  }, []);

  const fetchMoods = async (uid: string) => {
    const { data, error } = await supabase
      .from("moods")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMoods(data);
    }
  };

  const handleSubmit = async () => {
    if (!diary.trim()) return toast.error("일기를 입력해주세요.");
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("로그인 필요");
        return;
      }

      const email = user.email;
      const isAdmin = email === "banghak2da@gmail.com";

      if (!isAdmin) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const { count, error: countError } = await supabase
          .from("moods")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", todayStart.toISOString())
          .lte("created_at", todayEnd.toISOString());

        if (countError) throw countError;

        if ((count ?? 0) >= 3) {
          toast.error("일기는 하루 3개까지만 작성할 수 있어요.");
          setLoading(false);
          return;
        }
      }

      const { title, emoji } = await generateMoodSummary(diary);

      const { data, error } = await supabase
        .from("moods")
        .insert({
          user_id: user.id,
          content: diary,
          title,
          emoji,
        })
        .select()
        .single();

      if (error) {
        toast.error("저장 중 오류 발생");
      } else {
        toast.success("일기 저장 완료!");
        setDiary("");
        setMoods((prev) => [data, ...prev]);
      }
    } catch (e) {
      console.error(e);
      toast.error("오류 발생");
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("정말 삭제할까요?");
    if (!ok) return;

    const { error } = await supabase.from("moods").delete().eq("id", id);
    if (error) {
      toast.error("삭제 실패");
    } else {
      toast.success("삭제 완료!");
      setMoods((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const startEditing = (mood: Mood) => {
    setEditingId(mood.id);
    setEditContent(mood.content);
    setEditTitle(mood.title);
    setEditEmoji(mood.emoji);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
    setEditTitle("");
    setEditEmoji("");
  };

  const handleUpdate = async () => {
    if (!editContent.trim() || !editTitle.trim()) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("moods")
        .update({
          content: editContent,
          title: editTitle,
          emoji: editEmoji,
        })
        .eq("id", editingId!);

      if (error) {
        toast.error("수정 실패");
      } else {
        toast.success("수정 완료!");
        setMoods((prev) =>
          prev.map((m) =>
            m.id === editingId
              ? {
                  ...m,
                  content: editContent,
                  title: editTitle,
                  emoji: editEmoji,
                }
              : m
          )
        );
        cancelEditing();
      }
    } catch (e) {
      toast.error("수정 오류");
      console.error(e);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl px-5 mx-auto">
      {/* 달력 주석 */}
      {/* <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="mx-auto my-6 rounded-md border"
      /> */}

      {/* 제목 + Sparkles 아이콘 + 툴팁 */}
      <TooltipProvider delayDuration={100}>
        <div className="inline-flex items-center text-2xl font-bold gap-3">
          오늘의 기록
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help text-muted-foreground">
                <Sparkles className="w-5 h-5" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              AI가 일기 내용을 분석하여<br />
              제목과 이모지를 자동 생성합니다.
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <Textarea
        className="w-full"
        value={diary}
        onChange={(e) => setDiary(e.target.value.slice(0, MAX_LENGTH))}
        placeholder="오늘 있었던 일을 적어보세요..."
        rows={6}
      />
      <div className="text-right text-sm text-muted-foreground">
        {diary.length} / {MAX_LENGTH}자
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading || diary.trim().length === 0}
        className="self-end"
      >
        {loading ? "저장 중..." : "저장"}
      </Button>

      {moods.length === 0 ? (
        <div className="text-center text-muted-foreground min-h-[200px] flex items-center justify-center border rounded-lg mt-10">
          오늘 작성한 일기가 없습니다. 첫 일기를 작성해보세요!
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {moods.map((mood) => (
            <div
              key={mood.id}
              className="border rounded-xl p-4 shadow-sm bg-white dark:bg-neutral-900 transition-all duration-300 hover:shadow-md"
            >
              {editingId === mood.id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="제목"
                    className="w-full border p-2 rounded-md text-lg font-semibold"
                  />
                  <input
                    type="text"
                    value={editEmoji}
                    onChange={(e) => setEditEmoji(e.target.value)}
                    placeholder="이모지"
                    className="w-full border p-2 rounded-md text-lg"
                  />
                  <Textarea
                    className="w-full"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button onClick={handleUpdate} disabled={loading}>
                      저장
                    </Button>
                    <Button variant="outline" onClick={cancelEditing}>
                      취소
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xl font-semibold">
                    {mood.emoji} {mood.title}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {new Date(mood.created_at).toLocaleString("ko-KR")}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap">{mood.content}</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(mood)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(mood.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
