import { GoogleGenAI } from "@google/genai";
import { PromptResult } from "../types";
import { cleanJsonString } from "../utils";

// Initialize the client. 
// Note: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePromptFromImage = async (
  base64Data: string,
  mimeType: string
): Promise<PromptResult> => {
  try {
    const model = 'gemini-2.5-flash-image';

    const promptText = `
      Analyze the attached image deeply. 
      I need you to act as a world-class prompt engineer for generative AI.
      
      Output a valid JSON object strictly adhering to this structure:
      {
        "textPrompt": "A highly detailed, comprehensive text prompt that could be used to recreate this exact image in a high-end model like Midjourney v6 or Flux. Include subject description, artistic style, lighting, camera settings (if photorealistic), composition, and mood. Format it as a single, fluid paragraph.",
        "jsonPrompt": {
          "subject": "The main subject of the image",
          "medium": "e.g. Photography, Digital Illustration, Oil Painting, 3D Render",
          "style": ["List", "of", "artistic", "styles"],
          "lighting": "Description of lighting (e.g. Cinematic, Soft, Volumetric)",
          "colorPalette": ["List", "of", "dominant", "colors"],
          "composition": "Description of framing and angle",
          "mood": "Emotional atmosphere",
          "details": ["List", "of", "key", "small", "details"]
        }
      }
      
      Do not include any explanation before or after the JSON. Ensure valid JSON syntax.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: promptText
          }
        ]
      }
    });

    if (!response.text) {
      throw new Error("No response received from Gemini.");
    }

    const cleanedText = cleanJsonString(response.text);
    const parsedData = JSON.parse(cleanedText) as PromptResult;

    return parsedData;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to analyze image.");
  }
};