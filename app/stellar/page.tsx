'use client';

import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Image from 'next/image';
import { useMediaQuery } from 'usehooks-ts';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import starDataRaw from '@/public/assets/star_click_data_1000.json';
import constellationMap from '@/public/assets/constellations.json';

const PLACES = [
  '전체 보기', // ⬅ 전체 보기를 맨 앞에 둠
  '세르니움', '불타는 세르니움', '호텔 아르크스', '오디움',
  '도원경', '아르테리아', '카르시온', '탈라하트'
];

const CAMERA_HEIGHT = 10;
const LOOK_RADIUS = 10;
const CLOSE_RADIUS = 15;
const OVERVIEW_RADIUS = 120;

interface StarData {
  id: number;
  ra: number;
  dec: number;
  size: number;
  colorHSL: [number, number, number];
}

const starData: StarData[] = starDataRaw as StarData[];

function raDecToXYZ(ra: number, dec: number, r: number): [number, number, number] {
  const raRad = (ra / 360) * 2 * Math.PI;
  const decRad = (dec / 180) * Math.PI;
  return [
    r * Math.cos(decRad) * Math.cos(raRad),
    r * Math.sin(decRad),
    r * Math.cos(decRad) * Math.sin(raRad),
  ];
}

function Starfield({ highlightedIds }: { highlightedIds: number[] }) {
  const stars = starData.map(({ id, ra, dec, size, colorHSL }) => {
    const [x, y, z] = raDecToXYZ(ra, dec, 50);
    const color = new THREE.Color().setHSL(...colorHSL);
    return { id, position: [x, y, z] as [number, number, number], size, color };
  });

  return (
    <>
      {stars.map(({ id, position, size, color }) => (
        <mesh key={id} position={position}>
          <sphereGeometry args={[highlightedIds.includes(id) ? size * 2 : size, 8, 8]} />
          <meshBasicMaterial color={highlightedIds.includes(id) ? 'yellow' : color} />
        </mesh>
      ))}
    </>
  );
}

function Scene({
  targetIndex,
  visibleVillages,
  autoRotateAngleRef,
}: {
  targetIndex: number;
  visibleVillages: Set<string>;
  autoRotateAngleRef: React.MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const isOverview = targetIndex === 0;
  const radius = isOverview ? OVERVIEW_RADIUS : CLOSE_RADIUS;
  const angleRadBase = ((targetIndex - 1) * 36 * Math.PI) / 180;

  useFrame(({ clock }) => {
    if (!controlsRef.current) return;

    const t = clock.getElapsedTime();
    const autoAngle = isOverview ? t * 0.1 : angleRadBase;
    autoRotateAngleRef.current = isOverview ? autoAngle : 0;

    const targetPos = isOverview
      ? new THREE.Vector3(0, 0, 0)
      : new THREE.Vector3(
          LOOK_RADIUS * Math.cos(angleRadBase),
          0,
          LOOK_RADIUS * Math.sin(angleRadBase)
        );

    const cameraPos = new THREE.Vector3(
      radius * Math.cos(autoAngle + Math.PI),
      CAMERA_HEIGHT,
      radius * Math.sin(autoAngle + Math.PI)
    );

    camera.position.lerp(cameraPos, 0.05);
    controlsRef.current.target.lerp(targetPos, 0.05);
    controlsRef.current.update();
  });

  const highlightedIds: number[] = Array.from(visibleVillages).flatMap(
    (v) => (constellationMap as Record<string, number[]>)[v] || []
  );

  return (
    <>
      <Stars radius={300} depth={60} count={8000} factor={3} fade />
      <ambientLight intensity={0.2} />
      <Starfield highlightedIds={highlightedIds} />
      <OrbitControls ref={controlsRef} enableZoom={false} enablePan={false} />
    </>
  );
}

export default function ConstellationCarouselPage() {
  const isLargeScreen = useMediaQuery('(min-width: 640px)');
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0); // ✅ 전체 보기로 시작
  const [visibleVillages, setVisibleVillages] = useState<Set<string>>(new Set(PLACES.slice(1))); // ✅ 전체 마을 선택
  const autoRotateAngleRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const imagePaths = PLACES.map((name, i) => ({
    name,
    src: `/carousel/${i}${name}.webp`,
  }));

  const cellCount = imagePaths.length;

  const w = isLargeScreen ? 420 : 280;
  const h = isLargeScreen ? 280 : 180;
  const panelW = isLargeScreen ? 380 : 260;
  const panelH = isLargeScreen ? 240 : 160;
  const translateZ = isLargeScreen ? 576 : 380;

  const rotateFn = (angle: number) => {
    return `translateZ(-${translateZ}px) rotateY(${angle}deg)`;
  };

  const handleSelect = (i: number) => {
    const name = PLACES[i];
    setIndex(i);
    setVisibleVillages((prev) => {
      const next = new Set(prev);
      if (name === '전체 보기') {
        return next.size === PLACES.length - 1 ? new Set() : new Set(PLACES.slice(1));
      }
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const currentAngle = index === 0
    ? 0 // ✅ 전체 보기일 때 회전 고정
    : -(360 / cellCount) * index;

  return (
    <main className="flex flex-col items-center bg-black text-white min-h-screen px-4">
      <section className="w-full max-w-5xl aspect-video mt-6 rounded-2xl overflow-hidden border border-gray-700 shadow-[inset_0_0_10px_rgba(255,255,255,0.1)] bg-black/40 backdrop-blur">
        <Canvas camera={{ position: [0, CAMERA_HEIGHT, OVERVIEW_RADIUS], fov: 60 }}>
          <Scene targetIndex={index} visibleVillages={visibleVillages} autoRotateAngleRef={autoRotateAngleRef} />
        </Canvas>
      </section>

      <div className="scene relative my-6" style={{ width: w, height: h, perspective: 1000 }}>
        <div
          className="carousel absolute w-full h-full transform-style-preserve-3d transition-transform duration-700"
          style={{ transform: rotateFn(currentAngle) }}
        >
          {imagePaths.map((image, i) => {
            const angle = (360 / cellCount) * i;
            return (
              <div
                key={i}
                className="carousel__cell absolute overflow-hidden rounded-xl shadow-md border bg-black"
                style={{
                  width: panelW,
                  height: panelH,
                  left: (w - panelW) / 2,
                  top: (h - panelH) / 2,
                  transform: `rotateY(${angle}deg) translateZ(${translateZ}px)`,
                }}
              >
                <Image
                  src={image.src}
                  alt={image.name}
                  width={panelW}
                  height={panelH}
                  className="object-cover w-full h-full"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={() => setIndex((prev) => (prev - 1 + PLACES.length) % PLACES.length)}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button onClick={() => setIndex((prev) => (prev + 1) % PLACES.length)}>
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      <div className="w-full flex flex-wrap justify-center gap-2 pb-10 px-4">
        {PLACES.map((name, i) => (
          <Button key={name} onClick={() => handleSelect(i)}>
            {name}
          </Button>
        ))}
      </div>
    </main>
  );
}
