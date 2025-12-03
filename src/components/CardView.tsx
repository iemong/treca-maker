import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { CardData } from "@/server/gemini";

interface CardViewProps {
  card: CardData;
  imageBase64: string; // data:image/... 形式
  width?: number;
  height?: number;
  className?: string;
}

export const CardView = forwardRef<HTMLCanvasElement, CardViewProps>(
  ({ card, imageBase64, width = 400, height = 580, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 外部からのrefを内部のcanvasRefに結合
    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageBase64;
      img.onload = () => {
        drawCard(ctx, card, img, width, height);
      };
    }, [card, imageBase64, width, height]);

    return (
      <canvas
        className={className}
        height={height}
        ref={canvasRef}
        width={width}
      />
    );
  }
);

function drawCard(
  ctx: CanvasRenderingContext2D,
  card: CardData,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  // Clear
  ctx.clearRect(0, 0, w, h);

  // Background (Dark Texture)
  const grd = ctx.createLinearGradient(0, 0, w, h);
  grd.addColorStop(0, "#2a2a2a");
  grd.addColorStop(1, "#000000");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  // Border (Gold)
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, w - 8, h - 8);

  // Inner Border
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, w - 24, h - 24);

  // Header (Name & Attribute)
  ctx.fillStyle = "#d4af37"; // Gold text
  ctx.font = 'bold 24px "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif';
  ctx.textAlign = "left";
  ctx.fillText(card.name, 20, 45);

  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(card.attribute, w - 20, 45);

  // Image Area
  const imgY = 60;
  const imgH = w * 0.75; // 4:3 aspect ratio
  ctx.fillStyle = "#000";
  ctx.fillRect(20, imgY, w - 40, imgH);
  ctx.drawImage(img, 20, imgY, w - 40, imgH);

  // Image Border
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 4;
  ctx.strokeRect(20, imgY, w - 40, imgH);

  // Info Box
  const infoY = imgY + imgH + 20;
  const infoH = h - infoY - 20;

  // Type & Rarity
  ctx.fillStyle = "#fff";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "left";
  const stars = "★".repeat(card.rarity);
  ctx.fillText(`[${card.type}]  ${stars}`, 25, infoY);

  // Flavor Text Area
  const textY = infoY + 15;
  const textH = infoH - 40;
  ctx.fillStyle = "#fff";
  ctx.fillRect(20, textY, w - 40, textH);
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, textY, w - 40, textH);

  // Flavor Text Content
  ctx.fillStyle = "#000";
  ctx.font = '14px "Hiragino Mincho ProN", serif'; // 明朝体でフレーバーテキストっぽく
  ctx.textAlign = "left";
  wrapText(ctx, card.flavorText, 30, textY + 25, w - 60, 20);

  // ATK / DEF
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`ATK/${card.attack}  DEF/${card.defense}`, w - 25, h - 25);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const chars = text.split("");
  let line = "";
  for (let n = 0; n < chars.length; n++) {
    const testLine = line + chars[n];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = chars[n];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
