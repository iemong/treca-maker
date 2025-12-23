import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { CardView } from "@/components/card-view";
import { NotFound } from "@/components/not-found";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CardData } from "@/server/gemini";

export const Route = createFileRoute("/debug")({
  beforeLoad: () => {
    // Production環境では404扱いにする
    if (import.meta.env.PROD) {
      throw notFound();
    }
  },
  component: DebugPage,
  notFoundComponent: NotFound,
});

function DebugPage() {
  // 初期データ
  const [card, setCard] = useState<CardData>({
    name: "デバッグ・ドラゴン",
    attribute: "闇",
    rarity: 12,
    type: "ドラゴン族",
    attack: 3000,
    defense: 2500,
    flavorText:
      "開発環境にのみ姿を現す伝説のドラゴン。その姿を見た者は、バグ修正の加護を得ると言われている。しかし、本番環境では決してその姿を見ることはできない。",
  });

  const [imageBase64, setImageBase64] = useState<string>(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setImageBase64(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (key: keyof CardData, value: string | number) => {
    setCard((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 font-bold text-2xl">Debug Card Generator</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-4 rounded-lg border bg-card p-6">
          <div className="space-y-2">
            <Label>画像</Label>
            <Input accept="image/*" onChange={handleImageChange} type="file" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>名前</Label>
              <Input
                onChange={(e) => handleChange("name", e.target.value)}
                value={card.name}
              />
            </div>
            <div className="space-y-2">
              <Label>属性</Label>
              <Input
                onChange={(e) => handleChange("attribute", e.target.value)}
                value={card.attribute}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>レアリティ (1-12)</Label>
              <Input
                max={12}
                min={1}
                onChange={(e) =>
                  handleChange("rarity", Number.parseInt(e.target.value, 10))
                }
                type="number"
                value={card.rarity}
              />
            </div>
            <div className="space-y-2">
              <Label>攻撃力</Label>
              <Input
                onChange={(e) =>
                  handleChange("attack", Number.parseInt(e.target.value, 10))
                }
                type="number"
                value={card.attack}
              />
            </div>
            <div className="space-y-2">
              <Label>守備力</Label>
              <Input
                onChange={(e) =>
                  handleChange("defense", Number.parseInt(e.target.value, 10))
                }
                type="number"
                value={card.defense}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>種族・タイプ</Label>
            <Input
              onChange={(e) => handleChange("type", e.target.value)}
              value={card.type}
            />
          </div>

          <div className="space-y-2">
            <Label>フレーバーテキスト</Label>
            <Textarea
              className="min-h-[100px]"
              onChange={(e) => handleChange("flavorText", e.target.value)}
              value={card.flavorText}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center justify-start space-y-4">
          <div className="w-[400px] overflow-hidden rounded-xl shadow-xl">
            <CardView card={card} imageBase64={imageBase64} width={400} />
          </div>
          <div className="text-muted-foreground text-sm">Real-time Preview</div>
        </div>
      </div>
    </div>
  );
}
