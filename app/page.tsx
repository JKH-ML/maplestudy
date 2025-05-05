import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const data = [
  { date: "2025-05-01", skills: ["Pytorch"] },
  { date: "2025-04-01", skills: ["Vercel", "API", "three.js"] },
  { date: "2025-03-01", skills: ["Next.js", "Supabase", "Shadcn"] },
  { date: "2025-02-01", skills: ["React", "Tailwind"] },
  { date: "2025-01-01", skills: ["HTML", "CSS", "JS"] },
];

export default function Home() {
  return (
    <main className="flex-1 flex flex-col gap-12 px-4 py-8 max-w-6xl mx-auto">
      {/* 카드 섹션들 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/maple" passHref>
          <Card className="overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg cursor-pointer">
            <Image
              src="/maple.gif"
              alt="메이플 움짤 미리보기"
              width={600}
              height={300}
              className="w-full h-auto object-cover"
            />
            <CardHeader>
              <CardTitle>메이플 움짤 스튜디오</CardTitle>
              <CardDescription>
                배경과 캐릭터 표정, 동작 등을 커스텀하여 나만의 움짤을 만들어
                보세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 text-xs text-white">
                <span className="bg-orange-500 rounded-full px-2 py-1">
                  커스텀
                </span>
                <span className="bg-orange-500 rounded-full px-2 py-1">
                  움짤
                </span>
                <span className="bg-orange-500 rounded-full px-2 py-1">
                  1~2 캐릭터
                </span>
                <span className="bg-orange-500 rounded-full px-2 py-1">
                  GIF 저장
                </span>
              </div>
            </CardContent>{" "}
          </Card>
        </Link>

        <Link href="/mood" passHref>
          <Card className="overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg cursor-pointer">
            <Image
              src="/mood.png"
              alt="오늘의 기록 미리보기"
              width={600}
              height={300}
              className="w-full h-auto object-cover"
            />
            <CardHeader>
              <CardTitle>오늘의 기록</CardTitle>
              <CardDescription>
                당신의 하루를 AI가 요약하고, 감정에 어울리는 이모지를
                선물해드려요.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-2 text-xs text-white">
                <span className="bg-sky-500 rounded-full px-2 py-1">
                  일기
                </span>
                <span className="bg-sky-500 rounded-full px-2 py-1">
                  ChatGPT
                </span>
                <span className="bg-sky-500 rounded-full px-2 py-1">
                  한 줄 요약 
                </span>
                <span className="bg-sky-500 rounded-full px-2 py-1">
                  이모지
                </span>
                <span className="bg-sky-500 rounded-full px-2 py-1">
                  CRUD
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Melody Synthesizer</CardTitle>
            <CardDescription>
              랜덤한 코드 진행에서 영감을 받고 멜로디를 만들어 보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/music">바로가기</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Markdown Studio</CardTitle>
            <CardDescription>
              마크다운 파일을 자유롭게 편집하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/editor">바로가기</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Midnight Stellar</CardTitle>
            <CardDescription>
              3D 별자리로 표현한 메이플 월드를 만나보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/sky">바로가기</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Marked Secrets</CardTitle>
            <CardDescription>이미지에 워터마크를 삽입해보세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/image">바로가기</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Motion Styles</CardTitle>
            <CardDescription>
              반응형 그래픽과 상호작용 해보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/motion">바로가기</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Meso Stacks</CardTitle>
            <CardDescription>
              주간 보스 결정석 시세를 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/meso">바로가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 간결한 기술 스택 그리드 */}
      <div
        id="stack-grid"
        className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-4"
      >
        {data.map((log) => (
          <div
            key={log.date}
            className="border rounded-lg p-4 bg-muted shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground">
                {log.date.slice(0, 7)}
              </span>
              {log.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
