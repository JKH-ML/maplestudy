"use client";
declare module "gif.js";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Loader2,
  Search,
} from "lucide-react";
import {
  RECOMMENDED_COLORS,
  ACTIONS,
  EMOTIONS,
  WMOTIONS,
} from "@/data/mapleStudioData";
import GIF from "gif.js";

export default function MapleStudioPage() {
  const [backgroundColor, setBackgroundColor] = useState<string>("#f9f5f0");
  const [char1, setChar1] = useState<any>(null);
  const [char2, setChar2] = useState<any>(null);
  const [nickname1, setNickname1] = useState("");
  const [nickname2, setNickname2] = useState("");

  const [isGifMode1, setIsGifMode1] = useState(false);
  const [isGifMode2, setIsGifMode2] = useState(false);
  const [frameIndex1, setFrameIndex1] = useState(0);
  const [frameIndex2, setFrameIndex2] = useState(0);
  const [intervalMs1, setIntervalMs1] = useState(500);
  const [intervalMs2, setIntervalMs2] = useState(500);
  const [direction1, setDirection1] = useState(1);
  const [direction2, setDirection2] = useState(1);

  const moveCharacter = (
    which: "char1" | "char2",
    direction: "left" | "up" | "right" | "down"
  ) => {
    const step = 10;
    if (which === "char1") {
      setChar1((prev: any) =>
        prev
          ? {
              ...prev,
              x:
                (prev.x ?? 150) +
                (direction === "left"
                  ? -step
                  : direction === "right"
                    ? step
                    : 0),
              y:
                (prev.y ?? 200) +
                (direction === "up" ? -step : direction === "down" ? step : 0),
            }
          : prev
      );
    } else {
      setChar2((prev: any) =>
        prev
          ? {
              ...prev,
              x:
                (prev.x ?? 250) +
                (direction === "left"
                  ? -step
                  : direction === "right"
                    ? step
                    : 0),
              y:
                (prev.y ?? 200) +
                (direction === "up" ? -step : direction === "down" ? step : 0),
            }
          : prev
      );
    }
  };

  const toggleSetting = (
    which: "char1" | "char2",
    field: "showName" | "showGuild" | "flipX"
  ) => {
    if (which === "char1") {
      setChar1((prev: any) =>
        prev ? { ...prev, [field]: !prev[field] } : prev
      );
    } else {
      setChar2((prev: any) =>
        prev ? { ...prev, [field]: !prev[field] } : prev
      );
    }
  };

  const setCharacterSize = (which: "char1" | "char2", size: number) => {
    if (which === "char1") {
      setChar1((prev: any) => (prev ? { ...prev, size } : prev));
    } else {
      setChar2((prev: any) => (prev ? { ...prev, size } : prev));
    }
  };

  async function handleSaveGif() {
    if (!char1 && !char2) {
      alert("최소 하나 이상의 캐릭터를 불러와주세요.");
      return;
    }

    const gif = new (GIF as any)({
      workers: 2,
      quality: 10,
      width: 400,
      height: 400,
      workerScript: "/gif.worker.js",
    });

    const maxFrames = Math.max(
      char1 ? getFrameCount(char1.action) : 0,
      char2 ? getFrameCount(char2.action) : 0
    );

    for (let i = 0; i < maxFrames; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d")!;

      // 배경 그리기
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, 400, 400);

      // char1 그리기
      if (char1) {
        const totalFrames1 = getFrameCount(char1.action);
        const frameIndex1 =
          char1.action === "A00" || char1.action === "A01"
            ? i % (totalFrames1 * 2 - 2) <= totalFrames1 - 1
              ? i % (totalFrames1 * 2 - 2)
              : totalFrames1 * 2 - 2 - (i % (totalFrames1 * 2 - 2))
            : i % totalFrames1;

        const imgUrl1 = `${char1.baseImageUrl}?action=${char1.action}.${frameIndex1}&emotion=${char1.emotion}&wmotion=${char1.wmotion}&width=300&height=400`;
        const img1 = await loadImage(imgUrl1);

        ctx.save();
        if (char1.flipX) {
          ctx.translate(char1.x, char1.y);
          ctx.scale(-1, 1);
          // 캐릭터 비율 유지
          const aspectRatio = img1.width / img1.height;
          const height = char1.size;
          const width = height * aspectRatio;
          ctx.drawImage(img1, -width / 2, -height / 2, width, height);
        } else {
          ctx.translate(char1.x, char1.y);
          // 캐릭터 비율 유지
          const aspectRatio = img1.width / img1.height;
          const height = char1.size;
          const width = height * aspectRatio;
          ctx.drawImage(img1, -width / 2, -height / 2, width, height);
        }
        ctx.restore();

        // char1 닉네임, 길드
        if (char1.showName || char1.showGuild) {
          const fontSize = Math.max(8, char1.size * 0.03);
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.font = `bold ${fontSize}px sans-serif`;

          let textY = char1.y + char1.size * 0.11;
          if (char1.showName) {
            const textWidth = ctx.measureText(char1.name).width;
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            const x = char1.x - textWidth / 2 - 4;
            const y = textY - 2;
            const width = textWidth + 8;
            const height = fontSize + 4;
            const radius = 4;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(
              x + width,
              y + height,
              x + width - radius,
              y + height
            );
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.fillText(char1.name, char1.x, textY);
            textY += fontSize * 1.2;
          }
          if (char1.showGuild && char1.guild) {
            const textWidth = ctx.measureText(char1.guild).width;
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            const x = char1.x - textWidth / 2 - 4;
            const y = textY - 2;
            const width = textWidth + 8;
            const height = fontSize + 4;
            const radius = 4;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(
              x + width,
              y + height,
              x + width - radius,
              y + height
            );
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.fillText(char1.guild, char1.x, textY);
          }
        }
      }

      // char2 그리기
      if (char2) {
        const totalFrames2 = getFrameCount(char2.action);
        const frameIndex2 =
          char2.action === "A00" || char2.action === "A01"
            ? i % (totalFrames2 * 2 - 2) <= totalFrames2 - 1
              ? i % (totalFrames2 * 2 - 2)
              : totalFrames2 * 2 - 2 - (i % (totalFrames2 * 2 - 2))
            : i % totalFrames2;

        const imgUrl2 = `${char2.baseImageUrl}?action=${char2.action}.${frameIndex2}&emotion=${char2.emotion}&wmotion=${char2.wmotion}&width=300&height=400`;
        const img2 = await loadImage(imgUrl2);

        ctx.save();
        if (char2.flipX) {
          ctx.translate(char2.x, char2.y);
          ctx.scale(-1, 1);
          // 캐릭터 비율 유지
          const aspectRatio = img2.width / img2.height;
          const height = char2.size;
          const width = height * aspectRatio;
          ctx.drawImage(img2, -width / 2, -height / 2, width, height);
        } else {
          ctx.translate(char2.x, char2.y);
          // 캐릭터 비율 유지
          const aspectRatio = img2.width / img2.height;
          const height = char2.size;
          const width = height * aspectRatio;
          ctx.drawImage(img2, -width / 2, -height / 2, width, height);
        }
        ctx.restore();

        // char2 닉네임, 길드
        if (char2.showName || char2.showGuild) {
          const fontSize = Math.max(8, char2.size * 0.03);
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.font = `bold ${fontSize}px sans-serif`;

          let textY = char2.y + char2.size * 0.11;
          if (char2.showName) {
            const textWidth = ctx.measureText(char2.name).width;
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            const x = char2.x - textWidth / 2 - 4;
            const y = textY - 2;
            const width = textWidth + 8;
            const height = fontSize + 4;
            const radius = 4;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(
              x + width,
              y + height,
              x + width - radius,
              y + height
            );
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.fillText(char2.name, char2.x, textY);
            textY += fontSize * 1.2;
          }
          if (char2.showGuild && char2.guild) {
            const textWidth = ctx.measureText(char2.guild).width;
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            const x = char2.x - textWidth / 2 - 4;
            const y = textY - 2;
            const width = textWidth + 8;
            const height = fontSize + 4;
            const radius = 4;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(
              x + width,
              y + height,
              x + width - radius,
              y + height
            );
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.fillText(char2.guild, char2.x, textY);
          }
        }
      }

      // 프레임 추가
      gif.addFrame(ctx, { copy: true, delay: 500 });
    }

    gif.on("finished", (blob: Blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "maplestudio.gif";
      link.click();
    });

    gif.render();
  }

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGifMode1 && char1) {
      timer = setInterval(() => {
        setFrameIndex1((prev: number) => {
          const total = getFrameCount(char1.action);
          if (char1.action === "A00" || char1.action === "A01") {
            if (direction1 === 1) {
              if (prev >= total - 1) {
                setDirection1(-1);
                return prev - 1;
              }
              return prev + 1;
            } else {
              if (prev <= 0) {
                setDirection1(1);
                return prev + 1;
              }
              return prev - 1;
            }
          } else {
            return (prev + 1) % total;
          }
        });
      }, intervalMs1);
    }
    return () => clearInterval(timer);
  }, [isGifMode1, char1, intervalMs1, direction1]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGifMode2 && char2) {
      timer = setInterval(() => {
        setFrameIndex2((prev: number) => {
          const total = getFrameCount(char2.action);
          if (char2.action === "A00" || char2.action === "A01") {
            if (direction2 === 1) {
              if (prev >= total - 1) {
                setDirection2(-1);
                return prev - 1;
              }
              return prev + 1;
            } else {
              if (prev <= 0) {
                setDirection2(1);
                return prev + 1;
              }
              return prev - 1;
            }
          } else {
            return (prev + 1) % total;
          }
        });
      }, intervalMs2);
    }
    return () => clearInterval(timer);
  }, [isGifMode2, char2, intervalMs2, direction2]);

  function getFrameCount(actionCode: string) {
    const actionData = ACTIONS.find((a) => a.code === actionCode);
    if (!actionData) return 1;
    if (actionData.frame.includes("~")) {
      const [start, end] = actionData.frame.split("~").map(Number);
      return end - start + 1;
    }
    return 1;
  }

  return (
    <main className="flex flex-col items-center px-6 py-10 gap-6">
      <h1 className="text-3xl font-bold">메이플 움짤 스튜디오</h1>
      <div className="flex flex-col lg:flex-row items-center gap-6 w-full max-w-6xl">
        {/* 미리보기 */}
        <div
          className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] border flex items-center justify-center overflow-hidden"
          style={{ backgroundColor }}
        >
          {char1 && (
            <CharacterDisplay char={{ ...char1, frameIndex: frameIndex1 }} />
          )}
          {char2 && (
            <CharacterDisplay char={{ ...char2, frameIndex: frameIndex2 }} />
          )}
        </div>

        {/* 편집창 */}
        <div className="w-full max-w-[320px] border p-4 flex flex-col gap-4">
          <Tabs defaultValue="background" className="w-full">
            <TabsList>
              <TabsTrigger value="background">배경</TabsTrigger>
              <TabsTrigger value="char1">캐릭터1</TabsTrigger>
              <TabsTrigger value="char2">캐릭터2</TabsTrigger>
            </TabsList>

            <TabsContent value="background">
              <BackgroundEditor
                backgroundColor={backgroundColor}
                setBackgroundColor={setBackgroundColor}
              />
            </TabsContent>

            <TabsContent value="char1">
              <CharacterEditor
                char={char1}
                setChar={setChar1}
                defaultFlipX={true}
                defaultX={120}
                defaultY={200}
              />
              <CharacterSettings
                char={char1}
                toggleShowName={() => toggleSetting("char1", "showName")}
                toggleShowGuild={() => toggleSetting("char1", "showGuild")}
                toggleFlipX={() => toggleSetting("char1", "flipX")}
                setCharSize={(size) => setCharacterSize("char1", size)}
                isGifMode={isGifMode1}
                setIsGifMode={setIsGifMode1}
                intervalMs={intervalMs1}
                setIntervalMs={setIntervalMs1}
              />
              <CharacterControlButtons
                onMove={(dir) => moveCharacter("char1", dir)}
              />
            </TabsContent>

            <TabsContent value="char2">
              <CharacterEditor
                char={char2}
                setChar={setChar2}
                defaultFlipX={false}
                defaultX={280}
                defaultY={200}
              />
              <CharacterSettings
                char={char2}
                toggleShowName={() => toggleSetting("char2", "showName")}
                toggleShowGuild={() => toggleSetting("char2", "showGuild")}
                toggleFlipX={() => toggleSetting("char2", "flipX")}
                setCharSize={(size) => setCharacterSize("char2", size)}
                isGifMode={isGifMode2}
                setIsGifMode={setIsGifMode2}
                intervalMs={intervalMs2}
                setIntervalMs={setIntervalMs2}
              />
              <CharacterControlButtons
                onMove={(dir) => moveCharacter("char2", dir)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-center w-full">
        <Button onClick={handleSaveGif} className="w-48">
          GIF 저장하기
        </Button>
      </div>
    </main>
  );
}

function CharacterDisplay({ char }: { char: any }) {
  const fontSize = Math.max(8, char.size * 0.03);

  const frameIndex = char.frameIndex ?? 0;
  const imageUrl = `${char.baseImageUrl}?action=${char.action}.${frameIndex}&emotion=${char.emotion}&wmotion=${char.wmotion}&width=300&height=400`;

  return (
    <div
      style={{
        position: "absolute",
        left: char.x,
        top: char.y,
        transform: "translate(-50%, -50%)",
        width: `${char.size}px`,
        height: `${char.size}px`,
        pointerEvents: "none",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <Image
          src={imageUrl}
          alt="Character"
          layout="fill"
          objectFit="contain"
          style={{
            transform: char.flipX ? "scaleX(-1)" : "scaleX(1)",
          }}
        />
        {(char.showName || char.showGuild) && (
          <div
            style={{
              position: "absolute",
              top: "60%",
              left: "50%",
              transform: "translate(-50%, 10px)",
              backgroundColor: "rgba(0,0,0,0.6)",
              color: "#ffffff",
              fontWeight: "bold",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: `${fontSize}px`,
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            {char.showName && <div>{char.name}</div>}
            {char.showGuild && char.guild && <div>{char.guild}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function BackgroundEditor({
  backgroundColor,
  setBackgroundColor,
}: {
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Label>추천 배경색</Label>
      <div className="flex flex-wrap gap-2">
        {RECOMMENDED_COLORS.map((bg) => (
          <button
            key={bg.color}
            className={`w-8 h-8 rounded border ${backgroundColor === bg.color ? "ring-2 ring-black" : "hover:scale-105"}`}
            style={{ backgroundColor: bg.color }}
            onClick={() => setBackgroundColor(bg.color)}
          />
        ))}
      </div>

      <Label>직접 색 선택</Label>
      <Input
        type="color"
        value={backgroundColor}
        onChange={(e) => setBackgroundColor(e.target.value)}
      />
    </div>
  );
}

function CharacterEditor({
  char,
  setChar,
  defaultFlipX,
  defaultX,
  defaultY,
}: {
  char: any;
  setChar: (c: any) => void;
  defaultFlipX: boolean;
  defaultX: number;
  defaultY: number;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [nickname, setNickname] = useState("");

  const action = char?.action ?? "A00";
  const emotion = char?.emotion ?? "E00";
  const wmotion = char?.wmotion ?? "W00";

  const updateCharacter = async (
    key: "action" | "emotion" | "wmotion",
    value: string
  ) => {
    if (!char) return;
    setIsLoading(true);
    const updated = { ...char, [key]: value };
    const customUrl = `${char.baseImageUrl}?action=${updated.action}&emotion=${updated.emotion}&wmotion=${updated.wmotion}&width=300&height=400`;
    setChar({ ...updated, customUrl });
    setIsLoading(false);
  };

  const fetchCharacter = async () => {
    if (!nickname.trim()) return;

    try {
      const headers = {
        "x-nxopen-api-key": process.env.NEXT_PUBLIC_NEXON_API_KEY!,
      };

      const resId = await fetch(
        `https://open.api.nexon.com/maplestory/v1/id?character_name=${encodeURIComponent(nickname)}`,
        { headers }
      );
      const dataId = await resId.json();
      const ocid = dataId.ocid;
      if (!ocid) {
        alert("캐릭터를 찾을 수 없습니다.");
        return;
      }

      const resBasic = await fetch(
        `https://open.api.nexon.com/maplestory/v1/character/basic?ocid=${ocid}`,
        { headers }
      );
      const dataBasic = await resBasic.json();

      const baseUrl = dataBasic.character_image;
      const customUrl = `${baseUrl}?action=${action}&emotion=${emotion}&wmotion=${wmotion}&width=300&height=400`;

      setChar({
        baseImageUrl: baseUrl,
        customUrl,
        action,
        emotion,
        wmotion,
        flipX: defaultFlipX,
        x: defaultX,
        y: defaultY,
        name: dataBasic.character_name,
        guild: dataBasic.character_guild_name || "",
        showName: true,
        showGuild: true,
        size: 800,
      });
    } catch (err) {
      console.error(err);
      alert("캐릭터 정보를 불러오는데 실패했습니다.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full">
        {/* 닉네임 입력창 */}
        <Input
          placeholder="캐릭터 닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchCharacter();
          }}
          className="pr-10"
        />

        {/* 검색 버튼 */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={fetchCharacter}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-black hover:bg-transparent"
        >
          <Search className="w-5 h-5" />
        </Button>
      </div>

      <Label className="flex items-center gap-1">
        자세 {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
      </Label>
      <Select
        value={action}
        onValueChange={(val) => updateCharacter("action", val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="자세 선택" />
        </SelectTrigger>
        <SelectContent>
          {ACTIONS.map((a) => (
            <SelectItem key={a.code} value={a.code}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Label className="flex items-center gap-1">
        표정 {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
      </Label>
      <Select
        value={emotion}
        onValueChange={(val) => updateCharacter("emotion", val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="표정 선택" />
        </SelectTrigger>
        <SelectContent>
          {EMOTIONS.map((e) => (
            <SelectItem key={e.code} value={e.code}>
              {e.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Label className="flex items-center gap-1">
        무기 모션 {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
      </Label>
      <Select
        value={wmotion}
        onValueChange={(val) => updateCharacter("wmotion", val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="무기 모션 선택" />
        </SelectTrigger>
        <SelectContent>
          {WMOTIONS.map((w) => (
            <SelectItem key={w.code} value={w.code}>
              {w.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function CharacterSettings({
  char,
  toggleShowName,
  toggleShowGuild,
  toggleFlipX,
  setCharSize,
  isGifMode,
  setIsGifMode,
  intervalMs,
  setIntervalMs,
}: {
  char: any;
  toggleShowName: () => void;
  toggleShowGuild: () => void;
  toggleFlipX: () => void;
  setCharSize: (size: number) => void;
  isGifMode: boolean;
  setIsGifMode: (val: boolean) => void;
  intervalMs: number;
  setIntervalMs: (val: number) => void;
}) {
  if (!char) return null;

  return (
    <div className="flex flex-col gap-2 mt-4">
      <Label className="flex justify-between">
        <span>크기 조정</span>
        <Input
          type="number"
          className="w-24 h-8"
          value={char.size}
          onChange={(e) => setCharSize(Number(e.target.value))}
          min={0}
          max={1000}
        />
      </Label>

      <Slider
        min={0}
        max={1000}
        step={1}
        value={[char.size]}
        onValueChange={(val) => setCharSize(val[0])}
      />

      <Label className="flex items-center gap-2 mt-4">
        <Checkbox checked={char.showName} onCheckedChange={toggleShowName} />
        닉네임 표시
      </Label>
      <Label className="flex items-center gap-2">
        <Checkbox checked={char.showGuild} onCheckedChange={toggleShowGuild} />
        길드 표시
      </Label>
      <Label className="flex items-center gap-2">
        <Checkbox checked={char.flipX} onCheckedChange={toggleFlipX} />
        좌우반전
      </Label>

      <div className="flex flex-col gap-2 mt-4">
        <Label className="flex items-center gap-2">
          <Checkbox
            checked={isGifMode}
            onCheckedChange={(v) => setIsGifMode(!!v)}
          />
          움짤 모드
        </Label>
        {isGifMode && (
          <>
            <Label className="flex justify-between">
              <span>움짤 속도 (ms)</span>
              <Input
                type="number"
                className="w-24 h-8"
                value={intervalMs}
                onChange={(e) => setIntervalMs(Number(e.target.value))}
                min={200}
                max={1000}
                step={50}
              />
            </Label>

            <Slider
              min={200}
              max={1000}
              step={50}
              value={[intervalMs]}
              onValueChange={(val) => setIntervalMs(val[0])}
            />
          </>
        )}
      </div>
    </div>
  );
}

function CharacterControlButtons({
  onMove,
}: {
  onMove: (dir: "left" | "up" | "right" | "down") => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <Button variant="outline" size="icon" onClick={() => onMove("up")}>
        <ArrowUp />
      </Button>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={() => onMove("left")}>
          <ArrowLeft />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onMove("down")}>
          <ArrowDown />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onMove("right")}>
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Cannot load image on server"));
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}
