"use client";

// 1단계: 한 번만 소리 나는 버튼
import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as Tone from "tone"; // Tone.js 전체 import

export default function MusicPage() {
  const [isPlaying, setIsPlaying] = useState(false);

  // 버튼 클릭 시 소리 재생
  async function handlePlay() {
    await Tone.start(); // 사용자 인터랙션으로 오디오 컨텍스트 resume
    new Tone.Synth().toDestination().triggerAttackRelease("C4", "8n"); // "삐" 소리
    setIsPlaying(!isPlaying);
  }

  return (
    <main className="flex flex-col items-center gap-4 p-8">
      {/* 버튼 하나만 보임 */}
      <Button onClick={handlePlay}>
        {isPlaying ? "다시 재생하기" : "소리 재생하기"}
      </Button>
    </main>
  );
}
