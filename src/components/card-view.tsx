import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { CardData } from "@/server/gemini";

type CardViewProps = {
  card: CardData;
  imageBase64: string; // data:image/... 形式
  width?: number;
  height?: number;
  className?: string;
};

export const CardView = forwardRef<HTMLCanvasElement, CardViewProps>(
  ({ card, imageBase64, width = 400, height = 580, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 外部からのrefを内部のcanvasRefに結合
    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageBase64;
      img.onload = () => {
        drawCard(ctx, card, img, width, height);
      };
    }, [card, imageBase64, width, height]);

    return (
      <canvas
        className={`h-auto max-w-full ${className || ""}`}
        height={height}
        ref={canvasRef}
        width={width}
      />
    );
  }
);

// biome-ignore lint/nursery/useMaxParams: Canvas drawing often requires many parameters
function drawCard(
  ctx: CanvasRenderingContext2D,
  card: CardData,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  // --- Constants & Colors ---
  const PADDING = 18;

  const colors = {
    frameLight: "#D4B483", // Gold/Tan light
    frameDark: "#9C7C50", // Gold/Tan dark
    bgDark: "#232323", // Dark background behind content
    textBox: "#F3E5AB", // Parchment / Old Lace
    textBorder: "#4A3B2A", // Dark brown border for text box
    goldBorder: "#F9D676", // Highlight gold
  };

  // --- 1. Main Frame (Stone/Gold Texture Effect) ---
  ctx.clearRect(0, 0, w, h);

  // Base Gradient
  const frameGrad = ctx.createLinearGradient(0, 0, w, h);
  frameGrad.addColorStop(0, colors.frameLight);
  frameGrad.addColorStop(0.3, colors.frameDark);
  frameGrad.addColorStop(0.7, colors.frameDark);
  frameGrad.addColorStop(1, colors.frameLight);
  ctx.fillStyle = frameGrad;
  ctx.fillRect(0, 0, w, h);

  // Inner Dark Background Area (The "Hole" in the frame)
  ctx.fillStyle = colors.bgDark;
  ctx.fillRect(PADDING, PADDING, w - PADDING * 2, h - PADDING * 2);

  // Clean Borders for Inner Area
  ctx.strokeStyle = "#5e4b35"; // Darker brown
  ctx.lineWidth = 2;
  ctx.strokeRect(PADDING, PADDING, w - PADDING * 2, h - PADDING * 2);

  // --- 2. Header Area (Name & Attribute) ---
  const headerY = PADDING + 10;
  const headerH = 34;
  const attributeSize = 32;

  // Name Box
  ctx.fillStyle = "#fff"; // White box for name (or parchment?) - using parchment for header mostly standard in some TCGs, but let's go with a specialized gradient or just styling.
  // Actually, Yu-Gi-Oh uses a simple box frame.

  // Name Box Background
  const titleBoxW = w - PADDING * 2 - attributeSize - 15;
  const titleGrad = ctx.createLinearGradient(
    PADDING + 5,
    headerY,
    PADDING + 5,
    headerY + headerH
  );
  titleGrad.addColorStop(0, "#e6e6e6"); // Metallicish white
  titleGrad.addColorStop(1, "#bdaea5");

  drawRoundedRect(ctx, PADDING + 8, headerY, titleBoxW, headerH, 4);
  ctx.fillStyle = titleGrad;
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Name Text
  ctx.fillStyle = "#000";
  ctx.font = 'bold 20px "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0)";
  ctx.fillText(
    card.name,
    PADDING + 16,
    headerY + headerH / 2 + 1,
    titleBoxW - 10
  );

  // Attribute Circle
  const attrX = w - PADDING - attributeSize - 5;
  const attrY = headerY;

  ctx.beginPath();
  ctx.arc(
    attrX + attributeSize / 2,
    attrY + attributeSize / 2,
    attributeSize / 2,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "#4B0082"; // Indigo for "Dark" generic
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  // Attribute Text
  ctx.fillStyle = "#fff";
  ctx.font = 'bold 16px "Hiragino Mincho ProN", serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    card.attribute.slice(0, 1),
    attrX + attributeSize / 2,
    attrY + attributeSize / 2 + 1
  );

  // --- 3. Level / Stars ---
  const starY = headerY + headerH + 8;
  const starSize = 18;
  const starSpacing = 20;
  const starCount = Math.min(Math.max(card.rarity, 1), 12); // Clamp 1-12

  ctx.font = `${starSize}px sans-serif`;
  ctx.fillStyle = "#F9D676"; // Gold star
  ctx.shadowColor = "#D54E21"; // Reddish glow/shadow
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";

  // Align stars to the right edge of the image area
  const rightEdge = w - PADDING - 15;

  for (let i = 0; i < starCount; i++) {
    const sx = rightEdge - i * starSpacing;
    ctx.fillText("★", sx, starY);
  }
  ctx.shadowBlur = 0; // Reset shadow

  // --- 4. Main Image ---
  const imgY = starY + starSize + 8;
  const imgW = w - PADDING * 2 - 24; // Slightly smaller than frame
  const imgH = imgW; // Square image
  const imgX = PADDING + 12;

  // Image Frame Border
  ctx.fillStyle = "#888"; // Silver/Grey backing
  ctx.fillRect(imgX - 4, imgY - 4, imgW + 8, imgH + 8);

  // Draw Image with Object Fit Cover
  // Calculation
  const destAspect = imgW / imgH;
  const srcAspect = img.width / img.height;
  let sW: number;
  let sH: number;
  let sX: number;
  let sY: number;

  if (srcAspect > destAspect) {
    sH = img.height;
    sW = sH * destAspect;
    sX = (img.width - sW) / 2;
    sY = 0;
  } else {
    sW = img.width;
    sH = sW / destAspect;
    sX = 0;
    sY = (img.height - sH) / 2;
  }

  ctx.drawImage(img, sX, sY, sW, sH, imgX, imgY, imgW, imgH);

  // Inner Shadow for Image (inset effect)
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(imgX, imgY, imgW, imgH);

  // --- 5. Description Box ---
  const descY = imgY + imgH + 12;
  const descH = h - descY - PADDING - 15;
  const descW = w - PADDING * 2 - 16;
  const descX = PADDING + 8;

  // Box Background (Parchment)
  drawRoundedRect(ctx, descX, descY, descW, descH, 4);
  ctx.fillStyle = colors.textBox;
  ctx.fill();
  ctx.strokeStyle = colors.textBorder;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Content inside Desc Box
  const textInnerMargin = 12;
  let cursorY = descY + textInnerMargin;
  const textMaxW = descW - textInnerMargin * 2;

  // Type (Bold)
  ctx.fillStyle = "#000";
  ctx.font = 'bold 16px "Hiragino Kaku Gothic ProN", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`【${card.type}】`, descX + textInnerMargin - 4, cursorY);

  cursorY += 24;

  // Flavor Text (Main Body)
  ctx.font = '14px "Hiragino Mincho ProN", serif';
  ctx.fillStyle = "#222";
  // Simple wrapping
  wrapText(
    ctx,
    card.flavorText,
    descX + textInnerMargin,
    cursorY,
    textMaxW,
    18
  );

  // --- 6. ATK / DEF Footer ---
  // Draw a separator line
  const footerH = 25;
  const lineY = descY + descH - footerH - 5;

  ctx.beginPath();
  ctx.moveTo(descX + 10, lineY);
  ctx.lineTo(descX + descW - 10, lineY);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Stats
  ctx.font = 'bold 16px "Arial", sans-serif';
  ctx.textAlign = "right";
  ctx.fillStyle = "#000";
  ctx.fillText(
    `ATK/${card.attack}  DEF/${card.defense}`,
    descX + descW - 10,
    lineY + 6
  );
}

// Helper for Rounded Rect
// biome-ignore lint/nursery/useMaxParams: Helper function
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  let radius = r;
  if (w < 2 * radius) {
    radius = w / 2;
  }
  if (h < 2 * radius) {
    radius = h / 2;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

// biome-ignore lint/nursery/useMaxParams: Helper function
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
  let currentY = y;
  for (let n = 0; n < chars.length; n++) {
    const testLine = line + chars[n];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = chars[n];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}
