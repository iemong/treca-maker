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
  ({ card, imageBase64, width = 450, height = 600, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scale = 2; // Retina対応用スケール

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

      // Retina対応: 2倍スケールで描画
      ctx.setTransform(scale, 0, 0, scale, 0, 0);

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
        height={height * scale}
        ref={canvasRef}
        style={{ width, height }}
        width={width * scale}
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

  // --- 1. Main Frame (Common) ---
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

  const isLandscape = w > h;

  if (isLandscape) {
    drawLandscapeLayout(ctx, card, img, w, h, colors, PADDING);
  } else {
    drawPortraitLayout(ctx, card, img, w, h, colors, PADDING);
  }
}

// biome-ignore lint/nursery/useMaxParams: Canvas drawing
function drawPortraitLayout(
  ctx: CanvasRenderingContext2D,
  card: CardData,
  img: HTMLImageElement,
  w: number,
  h: number,
  colors: any,
  PADDING: number
) {
  // --- 2. Header Area (Name & Attribute) ---
  const headerY = PADDING + 10;
  const headerH = 34;
  const attributeSize = 32;

  // Name Box
  const titleBoxW = w - PADDING * 2 - attributeSize - 15;
  drawHeader(ctx, card, headerY, headerH, titleBoxW, PADDING);

  // Attribute Circle
  const attrX = w - PADDING - attributeSize - 5;
  drawAttribute(ctx, card, attrX, headerY, attributeSize);

  // --- 3. Level / Stars ---
  const starY = headerY + headerH + 8;
  const starSize = 18;
  const rightEdge = w - PADDING - 15;
  drawStars(ctx, card, starY, starSize, rightEdge);

  // --- 4. Main Image ---
  const imgY = starY + starSize + 8;
  const imgW = w - PADDING * 2 - 24; // Slightly smaller than frame
  const imgH = imgW; // Square image
  const imgX = PADDING + 12;

  drawImage(ctx, img, imgX, imgY, imgW, imgH);

  // --- 5. Description Box ---
  const descY = imgY + imgH + 12;
  const descH = h - descY - PADDING - 15;
  const descW = w - PADDING * 2 - 16;
  const descX = PADDING + 8;

  drawDescriptionBox(ctx, card, descX, descY, descW, descH, colors);
}

// biome-ignore lint/nursery/useMaxParams: Canvas drawing
function drawLandscapeLayout(
  ctx: CanvasRenderingContext2D,
  card: CardData,
  img: HTMLImageElement,
  w: number,
  h: number,
  colors: any,
  PADDING: number
) {
  // Left side: Image
  // Right side: Header, Stars, Description

  const innerW = w - PADDING * 2;
  const innerH = h - PADDING * 2;

  // Divide area
  const imgAreaWidth = innerW * 0.45;
  const textAreaWidth = innerW - imgAreaWidth; // roughly 55%

  // --- Image ---
  // Try to keep image relatively square or fit within left side
  // Let's make it centered vertically in the inner area
  const imgSize = Math.min(imgAreaWidth - 24, innerH - 24);
  const imgX = PADDING + 12;
  const imgY = PADDING + (innerH - imgSize) / 2;

  drawImage(ctx, img, imgX, imgY, imgSize, imgSize);

  // --- Right Side Content ---
  const rightX = PADDING + imgAreaWidth; // Start of right area
  const rightContentW = textAreaWidth - 12; // Margin on right
  const startY = PADDING + 12;

  // 1. Header
  const headerH = 34;
  const attributeSize = 32;
  const titleBoxW = rightContentW - attributeSize - 10;

  drawHeader(ctx, card, startY, headerH, titleBoxW, rightX - 8); // -8 to adjust for PADDING usage in helper

  // Attribute
  const attrX = rightX + titleBoxW + 5;
  drawAttribute(ctx, card, attrX, startY, attributeSize);

  // 2. Stars
  const starY = startY + headerH + 8;
  const starSize = 18;
  const rightEdge = rightX + rightContentW;
  drawStars(ctx, card, starY, starSize, rightEdge);

  // 3. Description Box
  const descY = starY + starSize + 12;
  const descH = (PADDING + innerH) - descY - 12; // fill rest of height
  const descW = rightContentW;
  const descX = rightX;

  drawDescriptionBox(ctx, card, descX, descY, descW, descH, colors);
}


// --- Helper Functions ---

function drawHeader(
  ctx: CanvasRenderingContext2D,
  card: CardData,
  y: number,
  h: number,
  w: number,
  xOffset: number
) {
  const titleGrad = ctx.createLinearGradient(xOffset + 5, y, xOffset + 5, y + h);
  titleGrad.addColorStop(0, "#e6e6e6");
  titleGrad.addColorStop(1, "#bdaea5");

  drawRoundedRect(ctx, xOffset + 8, y, w, h, 4);
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
  ctx.fillText(card.name, xOffset + 16, y + h / 2 + 1, w - 10);
}

function drawAttribute(
  ctx: CanvasRenderingContext2D,
  card: CardData,
  x: number,
  y: number,
  size: number
) {
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
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
  ctx.fillText(card.attribute.slice(0, 1), x + size / 2, y + size / 2 + 1);
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  card: CardData,
  y: number,
  size: number,
  rightEdge: number
) {
  const starSpacing = 20;
  const starCount = Math.min(Math.max(card.rarity, 1), 12);

  ctx.font = `${size}px sans-serif`;
  ctx.fillStyle = "#F9D676";
  ctx.shadowColor = "#D54E21";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";

  for (let i = 0; i < starCount; i++) {
    const sx = rightEdge - i * starSpacing;
    ctx.fillText("★", sx, y);
  }
  ctx.shadowBlur = 0;
}

function drawImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  // Image Frame Border
  ctx.fillStyle = "#888";
  ctx.fillRect(x - 4, y - 4, w + 8, h + 8);

  const destAspect = w / h;
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

  ctx.drawImage(img, sX, sY, sW, sH, x, y, w, h);

  // Inner Shadow for Image
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
}

function drawDescriptionBox(
  ctx: CanvasRenderingContext2D,
  card: CardData,
  x: number,
  y: number,
  w: number,
  h: number,
  colors: any
) {
  // Box Background
  drawRoundedRect(ctx, x, y, w, h, 4);
  ctx.fillStyle = colors.textBox;
  ctx.fill();
  ctx.strokeStyle = colors.textBorder;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Content
  const textInnerMargin = 12;
  let cursorY = y + textInnerMargin;
  const textMaxW = w - textInnerMargin * 2;

  // Type
  ctx.fillStyle = "#000";
  ctx.font = 'bold 12px "Hiragino Kaku Gothic ProN", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(0,0,0,0)";
  ctx.fillText(`【${card.type}】`, x + textInnerMargin - 4, cursorY);

  cursorY += 18;

  // Flavor Text
  const footerH = 25;
  const lineY = y + h - footerH - 5;
  const bottomPadding = 4;
  const maxBodyHeight = lineY - cursorY - bottomPadding;

  let fontSize = 14;
  const minFontSize = 9;
  let lines: string[] = [];
  let lineHeight = 0;

  ctx.fillStyle = "#222";

  while (fontSize >= minFontSize) {
    ctx.font = `${fontSize}px "Hiragino Mincho ProN", serif`;
    lineHeight = Math.floor(fontSize * 1.5);
    lines = getWrappedLines(ctx, card.flavorText, textMaxW);
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= maxBodyHeight) {
      break;
    }
    fontSize -= 1;
  }

  ctx.font = `${fontSize}px "Hiragino Mincho ProN", serif`;
  lines.forEach((line, i) => {
    ctx.fillText(line, x + textInnerMargin, cursorY + i * lineHeight);
  });

  // Footer
  ctx.beginPath();
  ctx.moveTo(x + 10, lineY);
  ctx.lineTo(x + w - 10, lineY);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Stats
  ctx.font = 'bold 16px "Arial", sans-serif';
  ctx.textAlign = "right";
  ctx.fillStyle = "#000";
  ctx.fillText(
    `ATK/${card.attack}  DEF/${card.defense}`,
    x + w - 10,
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

function getWrappedLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const chars = text.split("");
  const lines: string[] = [];
  let line = "";

  for (let n = 0; n < chars.length; n++) {
    const testLine = line + chars[n];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = chars[n];
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  return lines;
}
