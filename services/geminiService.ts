
import { GoogleGenAI } from "@google/genai";

/**
 * TESSERA CORE - AI ARCHIVAL ENGINE
 * Powered by Gemini 3 Flash
 */

export const generateArchaeologicalInsight = async (title: string, content: string) => {
  // Always create a new instance right before making an API call to ensure it always uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `PROTOKOL: TESSERA_ARCHIVE_ENHANCEMENT
Girdi Başlığı: ${title}
Ham Veri: ${content}

Talimat: Bu arkeolojik kaydı, daha profesyonel, küratöryel bir dille ve bilimsel bir gizem havasıyla yeniden yapılandır. Sadece geliştirilmiş metni döndür. Metin Türkçe olmalıdır. Arkeolojik terminolojiyi doğru kullan.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });

    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    throw error;
  }
};
