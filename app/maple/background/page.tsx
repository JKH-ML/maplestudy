"use client";

import { useEffect, useState } from "react";
import { mapleBackgrounds } from "@/data/mapleBackgrounds";
import Image from "next/image";

export default function MapleBackground() {
  const [randomImage, setRandomImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * mapleBackgrounds.length);
    setRandomImage(mapleBackgrounds[randomIndex]);
  }, []);

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * mapleBackgrounds.length);
    setRandomImage(mapleBackgrounds[randomIndex]);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-4xl w-full p-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          메이플스토리 랜덤 배경화면
        </h1>
        {error ? (
          <div className="text-center text-red-500 mb-4">{error}</div>
        ) : null}
        {randomImage ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
            <Image
              src={randomImage}
              alt="메이플스토리 배경화면"
              fill
              className="object-cover"
              priority
              onError={() => setError("이미지를 불러올 수 없습니다.")}
            />
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        <div className="mt-4 text-center">
          <button
            onClick={getRandomImage}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            다른 배경화면 보기
          </button>
        </div>
      </div>
    </div>
  );
}
