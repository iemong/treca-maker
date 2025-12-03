import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildPrompt } from "./prompt-builder";

const CardSchema = z.object({
  name: z.string(),
  rarity: z.number().min(1).max(10),
  attribute: z.string(),
  type: z.string(),
  attack: z.number(),
  defense: z.number(),
  flavorText: z.string(),
});

export type CardData = z.infer<typeof CardSchema>;

const InputSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  imageBase64: z.string(), // data:image/jpeg;base64,... 形式を想定
});

export const generateCard = createServerFn({ method: "POST" })
  .validator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const prompt = buildPrompt({
      title: data.title,
      description: data.description,
    });

    // Base64文字列からヘッダーを除去
    const base64Data = data.imageBase64.split(",")[1] || data.imageBase64;

    // Gemini API Call
    // Cloudflare Workers環境では process.env が機能しない場合があるが、
    // TanStack Start (Vinxi) がビルド時に置換してくれることを期待、あるいは
    // getWebRequest() から env を取得する必要があるかもしれない。
    // 一旦 process.env で実装し、デプロイ時に問題あれば修正する。
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    // Gemini 1.5 Pro (gemini-1.5-pro) を使用
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: "image/jpeg", data: base64Data } },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API Error:", error);
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const result = await response.json();
    // レスポンス構造の安全なアクセス
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("Unexpected Gemini response:", result);
      throw new Error("Failed to generate card content");
    }

    try {
      const json = JSON.parse(text);
      return CardSchema.parse(json);
    } catch (e) {
      console.error("Failed to parse Gemini response:", text, e);
      throw new Error("Failed to parse card data");
    }
  });
