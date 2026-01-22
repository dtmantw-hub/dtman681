
import { GoogleGenAI, Type } from "@google/genai";
import { DAPPath, DisentanglementResult, TransformationResult, BackgroundColor, TextOption, VisualAnchor } from "../types";

// Using gemini-3-pro-preview for complex image analysis and disentanglement
export const analyzeImage = async (base64Image: string): Promise<DisentanglementResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1]
          }
        },
        {
          text: `你是一位頂級視覺情報分析官。你的任務是對此影像執行「黑科技視覺解離術 (Visual Disentanglement)」。
          請將影像精準拆解為以下 8 個維度，並大量使用提供的專業術語：

          1. 主題 (Subject): 識別核心實體、敘事角色、實體屬性(性別/服飾/材質)、情緒特徵。
          2. 動作 (Action): 分析動能與張力。
          3. 風格 (Style): 藝術媒介與流派。
          4. 光影 (Lighting): 戲劇性與空間感。
          5. 色彩 (Color): 情感色彩編碼。
          6. 構圖 (Composition): 視線路徑引導。
          7. 環境 (Environment): 場域與氛圍。
          8. 質感 (Texture): 表面細部特徵與感知。

          請提供 JSON 格式，值需為精煉、專業描述的繁體中文。
          Keys: subject, action, style, lighting, color, composition, environment, texture.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          action: { type: Type.STRING },
          style: { type: Type.STRING },
          lighting: { type: Type.STRING },
          color: { type: Type.STRING },
          composition: { type: Type.STRING },
          environment: { type: Type.STRING },
          texture: { type: Type.STRING }
        },
        required: ["subject", "action", "style", "lighting", "color", "composition", "environment", "texture"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const transformImage = async (
  analysis: DisentanglementResult, 
  path: DAPPath, 
  pivotInput: string,
  pivotImages: string[] = [],
  bgColor: BackgroundColor = BackgroundColor.AUTO,
  textOption: TextOption = TextOption.NONE,
  aspectRatio: string = "1:1",
  gridConfig: { rows: number, cols: number } = { rows: 1, cols: 1 }
): Promise<TransformationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash-image";
  const parts: any[] = [];
  
  let bgPrompt = "";
  if (bgColor === BackgroundColor.BLACK) bgPrompt = "Solid deep black background.";
  else if (bgColor === BackgroundColor.WHITE) bgPrompt = "Clean solid white background.";

  let textPrompt = textOption === TextOption.NONE 
    ? "MANDATORY: NO text, letters, or watermarks." 
    : "Integrate subtle artistic typography.";

  // Grid Instructions
  let gridPrompt = "";
  if (gridConfig.rows > 1 || gridConfig.cols > 1) {
    gridPrompt = `LAYOUT DIRECTIVE: Create a precise ${gridConfig.rows}x${gridConfig.cols} grid layout (matrix). 
    The final image MUST contain exactly ${gridConfig.rows * gridConfig.cols} separate sub-images.
    Each sub-image must be PERFECTLY CENTERED within its own grid cell. 
    All grid cells must have IDENTICAL dimensions and uniform spacing.
    Every sub-image should depict the subject independently.`;
  }

  let baseContent = "";
  if (path === DAPPath.STYLE_TRANSFER) {
    baseContent = `A high-quality image of ${analysis.subject} with ${analysis.action}. Style: STRICTLY "${pivotInput}" (REPLACING original ${analysis.style}). Lighting: ${analysis.lighting}. Color: ${analysis.color}. Composition: ${analysis.composition}. Environment: ${analysis.environment}. Texture details: ${analysis.texture}.`;
  } else if (path === DAPPath.SUBJECT_SWAP) {
    if (pivotImages.length > 0) {
      pivotImages.forEach(img => {
        // 從 Base64 Data URL 中提取正確的 MIME 類型
        const mimeMatch = img.match(/^data:([^;]+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
        parts.push({ 
          inlineData: { 
            mimeType: mimeType, 
            data: img.split(',')[1] 
          } 
        });
      });
      baseContent = `Main subject from attached image in the style of "${analysis.style}". Action: ${analysis.action}. Lighting: ${analysis.lighting}. Color: ${analysis.color}. Composition: ${analysis.composition}. Environment: ${analysis.environment}. Texture: ${analysis.texture}. ${pivotInput ? `Modifications: ${pivotInput}` : ''}`;
    } else {
      baseContent = `Cinematic image of "${pivotInput}". Style: Perfectly match ${analysis.style}. Action: ${analysis.action}. Lighting: ${analysis.lighting}. Color: ${analysis.color}. Composition: ${analysis.composition}. Environment: ${analysis.environment}. Texture: ${analysis.texture}.`;
    }
  } else {
    baseContent = `Masterpiece restoration: Subject: ${analysis.subject}. Action: ${analysis.action}. Style: ${analysis.style}. Lighting: ${analysis.lighting}. Color: ${analysis.color}. Composition: ${analysis.composition}. Environment: ${analysis.environment}. Texture: ${analysis.texture}.`;
  }

  let finalPrompt = `${gridPrompt} ${baseContent} ${bgPrompt} ${textPrompt} Ensure each element in the grid is complete and well-composed within its tile.`;

  parts.push({ text: finalPrompt });

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });

  let imageUrl = "";
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!imageUrl) throw new Error("Synthesis failed.");

  return { id: crypto.randomUUID(), imageUrl, prompt: finalPrompt, timestamp: Date.now() };
};
