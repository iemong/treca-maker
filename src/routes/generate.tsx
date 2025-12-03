import { createFileRoute } from "@tanstack/react-router";
import { Download, Loader2, Save } from "lucide-react";
import { useRef, useState } from "react";
import { CardView } from "@/components/CardView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/db";
import { type CardData, generateCard } from "@/server/gemini";

export const Route = createFileRoute("/generate")({
  component: GeneratePage,
});

function GeneratePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleGenerate = async () => {
    if (!(file && title)) return;
    setLoading(true);
    setCardData(null);
    try {
      const result = await generateCard({
        data: { title, description, imageBase64: preview },
      });
      setCardData(result);
    } catch (e) {
      console.error(e);
      alert("生成に失敗しました。APIキーの設定などを確認してください。");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!(cardData && canvasRef.current)) return;
    const imageBase64 = canvasRef.current.toDataURL("image/png");

    try {
      await db.cards.add({
        ...cardData,
        imageBase64,
        createdAt: new Date(),
      });
      alert("保存しました！");
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました");
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `${cardData?.name || "card"}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <h1 className="mb-8 text-center font-bold text-3xl">カード生成</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image">画像</Label>
            <Input
              accept="image/*"
              id="image"
              onChange={handleFileChange}
              type="file"
            />
          </div>

          {preview && (
            <div className="relative aspect-video w-full overflow-hidden rounded-md border border-input">
              <img
                alt="Preview"
                className="h-full w-full object-cover"
                src={preview}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="カードのタイトル"
              value={title}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">画像の説明（任意）</Label>
            <Textarea
              id="description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="どんな状況？（例：ラーメンを食べている、猫が寝ている）"
              value={description}
            />
          </div>

          <Button
            className="w-full"
            disabled={!(file && title) || loading}
            onClick={handleGenerate}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              "カードを生成"
            )}
          </Button>
        </div>

        {/* Result View */}
        <div className="flex flex-col items-center justify-start space-y-4">
          {cardData ? (
            <>
              <CardView
                card={cardData}
                className="rounded-lg shadow-2xl"
                imageBase64={preview}
                ref={canvasRef}
              />
              <div className="flex w-full space-x-4">
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  variant="secondary"
                >
                  <Save className="mr-2 h-4 w-4" />
                  保存
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleDownload}
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  ダウンロード
                </Button>
              </div>
            </>
          ) : (
            <div className="flex h-[580px] w-full items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
              ここにカードが生成されます
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
