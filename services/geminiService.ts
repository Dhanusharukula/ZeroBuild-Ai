
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from "../types";

// Always initialize inside the function or right before use to ensure the latest API key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are "Architect AI", a world-class architectural consultant and space planner. 
Your goal is to help users with:
1. Spatial layouts (floor plans)
2. Material and finish suggestions
3. Sustainability and building code advice
4. Conceptual massing and site planning

When a user asks for a layout or space plan, you MUST provide:
- A professional text explanation.
- A structured JSON representation of the layout.

The JSON schema rules:
- Rooms are relative (0-100 scale).
- totalWidth and totalHeight should represent the bounding box (usually 100).
- Room types: 'living', 'bedroom', 'kitchen', 'bathroom', 'hallway', 'outdoor', 'office', 'dining', 'other'.

If the user asks about real-world locations, modern materials, or building codes, use your search tools to provide accurate, up-to-date information and include the source URLs.

ALWAYS respond in valid JSON format:
{
  "message": "Architectural advice and description...",
  "layout": {
    "rooms": [
      { "id": "uuid", "name": "Master Suite", "x": 0, "y": 0, "width": 50, "height": 40, "type": "bedroom" }
    ],
    "totalWidth": 100,
    "totalHeight": 100,
    "description": "Short title of the plan"
  },
  "sources": [
    { "title": "Source Name", "url": "https://..." }
  ]
}

If no layout is needed, set "layout" to null. If no sources are used, set "sources" to an empty array.`;

export const sendMessageToGemini = async (prompt: string, history: any[]): Promise<GeminiResponse & { sources?: {title: string, url: string}[] }> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Complex architectural reasoning
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            layout: {
              type: Type.OBJECT,
              nullable: true,
              properties: {
                totalWidth: { type: Type.NUMBER },
                totalHeight: { type: Type.NUMBER },
                description: { type: Type.STRING },
                rooms: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      width: { type: Type.NUMBER },
                      height: { type: Type.NUMBER },
                      type: { type: Type.STRING }
                    },
                    required: ["id", "name", "x", "y", "width", "height", "type"]
                  }
                }
              },
              required: ["rooms", "totalWidth", "totalHeight"]
            },
            sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING }
                }
              }
            }
          },
          required: ["message"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    // Extract grounding sources if available manually as well
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const dynamicSources = groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Search Result",
      url: chunk.web?.uri || ""
    })).filter((s: any) => s.url) || [];

    return {
      ...result,
      sources: [...(result.sources || []), ...dynamicSources]
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      message: "Architectural consultation failed. Please check your network or API key."
    };
  }
};
