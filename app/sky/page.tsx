"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import starData from "@/public/assets/star_click_data_1000.json";
import constellationMap from "@/public/assets/constellations.json";

const PLACE_NAMES = [
  "세르니움", "불타는 세르니움", "호텔 아르크스", "오디움", "도원경",
  "아르테리아", "카르시온", "탈라하트", "엘리니아", "커닝시티", "전체 보기"
];

const CAMERA_HEIGHT = 10;
const LOOK_RADIUS = 10;
const CLOSE_RADIUS = 15;
const OVERVIEW_RADIUS = 100;

function raDecToXYZ(ra: number, dec: number, r: number): [number, number, number] {
  const raRad = (ra / 360) * 2 * Math.PI;
  const decRad = (dec / 180) * Math.PI;
  const x = r * Math.cos(decRad) * Math.cos(raRad);
  const y = r * Math.sin(decRad);
  const z = r * Math.cos(decRad) * Math.sin(raRad);
  return [x, y, z];
}

function Starfield({ highlightedIds }: { highlightedIds: number[] }) {
  const stars = useMemo(() => {
    return starData.map(({ id, ra, dec, size, colorHSL }) => {
      const [x, y, z] = raDecToXYZ(ra, dec, 50);
      const [h, s, l] = colorHSL;
      const color = new THREE.Color().setHSL(h, s, l);
      return { id, position: [x, y, z] as [number, number, number], size, color };
    });
  }, []);

  const starMap = useMemo(() => {
    const map = new Map<number, [number, number, number]>();
    for (const star of stars) {
      map.set(star.id, star.position);
    }
    return map;
  }, [stars]);

  const lineGeometry = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < highlightedIds.length - 1; i++) {
      const a = starMap.get(highlightedIds[i]);
      const b = starMap.get(highlightedIds[i + 1]);
      if (a && b) {
        positions.push(new THREE.Vector3(...a));
        positions.push(new THREE.Vector3(...b));
      }
    }
    return new THREE.BufferGeometry().setFromPoints(positions);
  }, [highlightedIds, starMap]);

  return (
    <>
      {stars.map(({ id, position, size, color }) => {
        const isHighlighted = highlightedIds.includes(id);
        const radius = isHighlighted ? size * 2 : size;
        return (
          <mesh key={id} position={position}>
            <sphereGeometry args={[radius, 8, 8] as [number, number, number]} />
            <meshBasicMaterial
              color={isHighlighted ? "yellow" : color}
              transparent
              opacity={1}
            />
          </mesh>
        );
      })}

      {highlightedIds.length >= 2 && (
        <primitive
          object={
            new THREE.Line(
              lineGeometry,
              new THREE.LineBasicMaterial({
                color: "yellow",
                transparent: true,
                opacity: 0.5
              })
            )
          }
        />
      )}
    </>
  );
}

function SceneContent({ targetIndex, visibleVillages }: {
  targetIndex: number;
  visibleVillages: Set<string>;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const isOverview = targetIndex === 10;
  const radius = isOverview ? OVERVIEW_RADIUS : CLOSE_RADIUS;

  const angleRad = useMemo(() => (targetIndex * 36 * Math.PI) / 180, [targetIndex]);

  const targetVec = useMemo(() => {
    return isOverview
      ? new THREE.Vector3(0, 0, 0)
      : new THREE.Vector3(
          LOOK_RADIUS * Math.cos(angleRad),
          0,
          LOOK_RADIUS * Math.sin(angleRad)
        );
  }, [angleRad, isOverview]);

  const cameraVec = useMemo(() => {
    return new THREE.Vector3(
      radius * Math.cos(angleRad + Math.PI),
      CAMERA_HEIGHT,
      radius * Math.sin(angleRad + Math.PI)
    );
  }, [angleRad, isOverview, radius]);

  // 모든 강조된 별 ID 수집
  const highlightedIds = useMemo(() => {
    const ids: number[] = [];
    visibleVillages.forEach((village) => {
      const stars = (constellationMap as Record<string, number[]>)[village] || [];
      ids.push(...stars);
    });
    return ids;
  }, [visibleVillages]);

  useFrame(() => {
    if (controlsRef.current) {
      camera.position.lerp(cameraVec, 0.05);
      controlsRef.current.target.lerp(targetVec, 0.05);
      controlsRef.current.update();
    }
  });

  return (
    <>
      <Stars radius={300} depth={60} count={8000} factor={3} saturation={0} fade />
      <ambientLight intensity={0.2} />
      <Starfield highlightedIds={highlightedIds} />
      <OrbitControls ref={controlsRef} enableZoom={false} enablePan={false} />
    </>
  );
}

export default function VillageConstellationsPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visibleVillages, setVisibleVillages] = useState<Set<string>>(new Set());

  const handleButtonClick = (index: number) => {
    const village = PLACE_NAMES[index];
    const isSelected = selectedIndex === index;

    setSelectedIndex(index);

    setVisibleVillages((prev) => {
      const next = new Set(prev);
      if (next.has(village)) {
        next.delete(village);
      } else {
        next.add(village);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center w-full bg-gradient-to-b from-indigo-950 via-purple-900 to-gray-900">
      <section className="w-full h-[50vh]">
        <Canvas camera={{ position: [0, CAMERA_HEIGHT, OVERVIEW_RADIUS], fov: 60 }}>
          <SceneContent targetIndex={selectedIndex} visibleVillages={visibleVillages} />
        </Canvas>
      </section>

      <div className="w-full flex flex-wrap justify-center gap-2 py-6">
        {PLACE_NAMES.map((name, i) => (
          <Button
            key={name}
            onClick={() => handleButtonClick(i)}
            className="text-sm px-4 py-2"
            variant={i === selectedIndex ? "default" : "secondary"}
          >
            {name}
          </Button>
        ))}
      </div>
    </div>
  );
}
