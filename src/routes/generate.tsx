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
    if (!file || !title) return;
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
    if (!cardData || !canvasRef.current) return;
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
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">カード生成</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image">画像</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {preview && (
            <div className="relative aspect-video w-full overflow-hidden rounded-md border border-input">
              <img
                src={preview}
                alt="Preview"
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              placeholder="カードのタイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">画像の説明（任意）</Label>
            <Textarea
              id="description"
              placeholder="どんな状況？（例：ラーメンを食べている、猫が寝ている）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!file || !title || loading}
            className="w-full"
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
                ref={canvasRef}
                card={cardData}
                imageBase64={preview}
                className="shadow-2xl rounded-lg"
              />
              <div className="flex space-x-4 w-full">
                <Button
                  onClick={handleSave}
                  variant="secondary"
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" />
                  保存
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  ダウンロード
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-[580px] border-2 border-dashed rounded-lg text-muted-foreground">
              ここにカードが生成されます
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
