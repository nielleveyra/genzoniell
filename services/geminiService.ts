
import { GoogleGenAI, Type, Modality } from "@google/genai";
// FIX: Import SceneAnalysisResult type to resolve compilation errors.
import { SceneAnalysisResult } from "../types";

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType
    },
  };
};

export async function analyzeScene(imageBase64: string, mimeType: string): Promise<SceneAnalysisResult> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Analyze the provided image of a person. Your response MUST be in a valid JSON format. The JSON object should have six keys: "description", "accessories", "outfitDescription", "poseAndExpression", "lightingAndShadows", and "cameraPerspective".
    1.  For "description", provide a vivid description of ONLY the background, setting, and environment. Exclude all lighting and camera details. For example: "An urban rooftop at dusk with a view of blurry city lights."
    2.  For "accessories", provide a string array of all visible accessories. If none, return an empty array [].
    3.  For "outfitDescription", provide a concise description of the clothing worn by the person. For example: "a simple white cotton t-shirt and blue denim jeans."
    4.  For "poseAndExpression", provide a very detailed description of the subject's posture, pose, and facial expression. For example: "The subject is leaning slightly forward, photographed from a high angle. They are looking down and away from the camera with a soft, contemplative smile."
    5.  For "lightingAndShadows", provide a detailed technical analysis of the lighting. Describe the light source (e.g., natural sunlight, softbox), its direction (e.g., from the side, backlit), its quality (e.g., soft, diffused, hard), and the resulting shadows (e.g., long and soft, sharp and defined). For example: "Golden hour sunlight from the left creating soft, warm highlights on the subject's face and long, gentle shadows behind them."
    6.  For "cameraPerspective", provide a precise description of the camera's position and angle. Specify the angle (e.g., low-angle, eye-level), shot type (e.g., full-body shot, medium shot), and depth of field effects (e.g., blurred background). For example: "A low-angle, full-body shot that makes the subject appear taller, with a shallow depth of field that blurs the background significantly."
    Do not include any text outside of the JSON object.`;

    const imagePart = fileToGenerativePart(imageBase64, mimeType);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    description: { 
                        type: Type.STRING,
                        description: "A vivid description of ONLY the background, setting, and environment."
                    },
                    accessories: {
                        type: Type.ARRAY,
                        description: "A list of all visible accessories.",
                        items: { type: Type.STRING }
                    },
                    outfitDescription: {
                        type: Type.STRING,
                        description: "A concise description of the clothing."
                    },
                    poseAndExpression: {
                        type: Type.STRING,
                        description: "A detailed description of the subject's posture, pose, and facial expression."
                    },
                    lightingAndShadows: {
                        type: Type.STRING,
                        description: "A detailed technical analysis of the lighting and shadows."
                    },
                    cameraPerspective: {
                        type: Type.STRING,
                        description: "A precise description of the camera's position, angle, and perspective."
                    }
                },
                required: ["description", "accessories", "outfitDescription", "poseAndExpression", "lightingAndShadows", "cameraPerspective"]
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as SceneAnalysisResult;
}

export async function editImage(
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };
  const textPart = { text: prompt };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [imagePart, textPart],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("Image editing failed, no image data returned.");
}

export async function generateImage(prompt: string, aspectRatio: string): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: aspectRatio,
    },
  });

  const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
  return base64ImageBytes;
}