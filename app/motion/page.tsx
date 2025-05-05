'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';
import { useMediaQuery } from 'usehooks-ts'; // 반응형 헬퍼 훅 추가

export default function MotionPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  // 화면 크기에 따라 분기 (640px 이상이면 PC로 간주)
  const isLargeScreen = useMediaQuery('(min-width: 640px)');

  // PC / 모바일 기준 크기 결정
  const sceneWidth = isLargeScreen ? 420 : 280;
  const sceneHeight = isLargeScreen ? 280 : 180;
  const panelWidth = isLargeScreen ? 380 : 260;
  const panelHeight = isLargeScreen ? 240 : 160;
  const translateZ = isLargeScreen ? 576 : 380;

  const cellCount = 8;
  const rotateFn = (index: number) => {
    const angle = -(360 / cellCount) * index;
    return `translateZ(-${translateZ}px) rotateY(${angle}deg)`;
  };

  const imagePaths = [
    { src: '/carousel/1전르니움.webp', name: '세르니움' },
    { src: '/carousel/2후르니움.webp', name: '불타는 세르니움' },
    { src: '/carousel/3호텔아르크스.webp', name: '호텔 아르크스' },
    { src: '/carousel/4오디움.webp', name: '오디움' },
    { src: '/carousel/5도원경.webp', name: '도원경' },
    { src: '/carousel/6아르테리아.webp', name: '아르테리아' },
    { src: '/carousel/7카르시온.webp', name: '카르시온' },
    { src: '/carousel/8탈라하트.webp', name: '탈라하트' },
  ];

  const getCenterIndex = (selectedIndex: number, cellCount: number) => {
    return ((selectedIndex % cellCount) + cellCount) % cellCount;
  };

  const centerIndex = getCenterIndex(selectedIndex, cellCount);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-6 gap-10">
      {/* 마을 이름 표시 */}
      <div className="relative w-full max-w-xs sm:max-w-md h-[40px] overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={centerIndex}
            initial={{
              x: direction === "right" ? 300 : -300,
              opacity: 0,
            }}
            animate={{
              x: 0,
              opacity: 1,
            }}
            exit={{
              x: direction === "right" ? -300 : 300,
              opacity: 0,
            }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="absolute text-xl sm:text-2xl font-bold text-primary"
          >
            {imagePaths[centerIndex].name}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3D 캐러셀 */}
      <div
        className="scene relative"
        style={{
          width: `${sceneWidth}px`,
          height: `${sceneHeight}px`,
          perspective: '1000px',
        }}
      >
        <div
          className="carousel absolute w-full h-full transform-style-preserve-3d transition-transform duration-700"
          style={{
            transform: rotateFn(selectedIndex),
          }}
        >
          {imagePaths.map((image, i) => {
            const angle = (360 / cellCount) * i;
            const isCenter = i === centerIndex;
            return (
              <div
                key={i}
                className={`carousel__cell absolute overflow-hidden rounded-xl shadow-md border bg-muted transition-transform duration-700 ${isCenter ? 'scale-110 z-10' : 'scale-100 opacity-80'}`}
                style={{
                  width: `${panelWidth}px`,
                  height: `${panelHeight}px`,
                  left: `${(sceneWidth - panelWidth) / 2}px`,
                  top: `${(sceneHeight - panelHeight) / 2}px`,
                  transform: `rotateY(${angle}deg) translateZ(${translateZ}px)`,
                }}
              >
                <Image
                  src={image.src}
                  alt={image.name}
                  width={panelWidth}
                  height={panelHeight}
                  className="object-cover w-full h-full"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-4">
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setDirection("left");
              setSelectedIndex((prev) => prev - 1);
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setDirection("right");
              setSelectedIndex((prev) => prev + 1);
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
