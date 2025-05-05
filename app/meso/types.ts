export interface BossEntry {
  name: string;
  level: string;
  type: "solo" | "party";
  partySize: number;
}

export interface Character {
  id: number;
  bosses: BossEntry[];
  type: string;
}
