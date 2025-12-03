import Dexie, { type Table } from "dexie";
import type { CardData } from "@/server/gemini";

export interface Card extends CardData {
  id?: number;
  imageBase64: string; // 生成されたカード画像（Canvas出力）
  originalImageBase64?: string; // 元画像（任意）
  createdAt: Date;
}

export class TrecaDatabase extends Dexie {
  cards!: Table<Card>;

  constructor() {
    super("TrecaDatabase");
    this.version(1).stores({
      cards: "++id, name, rarity, createdAt",
    });
  }
}

export const db = new TrecaDatabase();
