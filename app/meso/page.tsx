"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { bossData } from "./bossData";
import { characterPresets } from "./characterPresets";
import { formatMeso } from "./formatMeso";
import type { BossEntry, Character } from "./types";

export default function Page() {
  const [characters, setCharacters] = useState<Character[]>([
    { id: 1, bosses: [], type: "custom" },
  ]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleAddCharacter = () => {
    const newId = characters.length + 1;
    setCharacters([...characters, { id: newId, bosses: [], type: "custom" }]);
  };

  const handleTypeChange = (id: number, type: string) => {
    setCharacters((prev) =>
      prev.map((char) =>
        char.id === id
          ? {
              ...char,
              type,
              bosses: type === "custom" ? [] : characterPresets[type] || [],
            }
          : char
      )
    );
  };

  const handleAddBoss = (charId: number) => {
    setCharacters((prev) =>
      prev.map((char) =>
        char.id === charId && char.bosses.length < 12
          ? {
              ...char,
              bosses: [
                ...char.bosses,
                { name: "", level: "", type: "solo", partySize: 1 },
              ],
            }
          : char
      )
    );
  };

  const handleBossChange = (
    charId: number,
    index: number,
    key: keyof BossEntry,
    value: any
  ) => {
    setCharacters((prev) =>
      prev.map((char) => {
        if (char.id !== charId) return char;
        const updatedBosses = [...char.bosses];
        updatedBosses[index] = {
          ...updatedBosses[index],
          [key]: value,
        };
        return { ...char, bosses: updatedBosses };
      })
    );
  };

  const getBossPrice = (
    name: string,
    level: string,
    type: "solo" | "party",
    partySize: number
  ): number => {
    const boss = bossData.find((b) => b.name === name);
    const price =
      boss && level in boss.prices
        ? boss.prices[level as keyof typeof boss.prices]!
        : 0;
    return type === "party" ? price / Math.max(1, partySize) : price;
  };

  const getCharIncome = (char: Character): number => {
    return char.bosses.reduce(
      (sum, b) => sum + getBossPrice(b.name, b.level, b.type, b.partySize),
      0
    );
  };

  const totalIncome = characters.reduce(
    (sum, char) => sum + getCharIncome(char),
    0
  );

  const allPrices = bossData.flatMap((boss) =>
    Object.entries(boss.prices).map(([level, price]) => ({
      name: boss.name,
      level,
      price,
    }))
  );
  const sortedPrices = [...allPrices].sort((a, b) =>
    sortOrder === "asc" ? a.price - b.price : b.price - a.price
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">💰 보스 수익 계산기</h1>

      {characters.map((char) => (
        <div key={char.id} className="border p-4 rounded space-y-3">
          <div className="flex gap-2 items-center">
            <h2 className="font-semibold">
              🧍 캐릭터 {char.id} - 수익: {formatMeso(getCharIncome(char))}
            </h2>
            <Select
              value={char.type}
              onValueChange={(val) => handleTypeChange(char.id, val)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="캐릭터 타입 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">A 타입</SelectItem>
                <SelectItem value="custom">직접 선택</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span>선택된 보스 수: {char.bosses.length}</span>
            {char.bosses.length > 12 && (
              <span className="text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                12개 초과됨!
              </span>
            )}
          </div>

          {char.bosses.map((b, idx) => {
            const availableLevels =
              bossData.find((x) => x.name === b.name)?.prices ?? {};
            return (
              <div key={idx} className="flex gap-2 items-center flex-wrap">
                <Select
                  value={b.name}
                  onValueChange={(val) =>
                    handleBossChange(char.id, idx, "name", val)
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="보스 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {bossData.map((boss) => (
                      <SelectItem key={boss.name} value={boss.name}>
                        {boss.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={b.level}
                  onValueChange={(val) =>
                    handleBossChange(char.id, idx, "level", val)
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="난이도" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(availableLevels).map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={b.type}
                  onValueChange={(val) =>
                    handleBossChange(char.id, idx, "type", val)
                  }
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">솔로</SelectItem>
                    <SelectItem value="party">파티</SelectItem>
                  </SelectContent>
                </Select>

                {b.type === "party" && (
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={b.partySize}
                    onChange={(e) =>
                      handleBossChange(
                        char.id,
                        idx,
                        "partySize",
                        Number(e.target.value)
                      )
                    }
                    className="w-16 border rounded px-2 py-1 text-sm"
                  />
                )}

                <div>
                  💵{" "}
                  {formatMeso(
                    getBossPrice(b.name, b.level, b.type, b.partySize)
                  )}
                </div>
              </div>
            );
          })}

          {char.type === "custom" && (
            <Button variant="outline" onClick={() => handleAddBoss(char.id)}>
              + 보스 추가
            </Button>
          )}
        </div>
      ))}

      <Button onClick={handleAddCharacter}>+ 캐릭터 추가</Button>

      <div className="text-xl font-bold">
        🔢 전체 수익: {formatMeso(totalIncome)}
      </div>

      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-bold mb-4">💎 결정석 가격표</h2>
        <div className="flex gap-2 mb-4">
          <Button variant="outline" onClick={() => setSortOrder("desc")}>
            비싼 순
          </Button>
          <Button variant="outline" onClick={() => setSortOrder("asc")}>
            싼 순
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {sortedPrices.map((item, idx) => (
            <div
              key={idx}
              className="border rounded p-3 bg-muted flex justify-between items-center"
            >
              <span className="font-semibold">
                {item.name} ({item.level})
              </span>
              <span>{formatMeso(item.price)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
