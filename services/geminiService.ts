
import { GoogleGenAI, Type } from "@google/genai";
import { ExplanationResponse } from "../types";

export const explainCalculation = async (expression: string, result: string): Promise<ExplanationResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Explain this mathematical calculation step-by-step for a student.
    Expression: ${expression}
    Result: ${result}
    
    Provide a clear explanation of what the expression means, the individual steps to solve it, and some context or application of this calculation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING, description: 'General summary of the calculation.' },
            steps: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'Numerical steps taken to reach the result.'
            },
            context: { type: Type.STRING, description: 'Real-world context or mathematical principle involved.' }
          },
          required: ['explanation', 'steps', 'context']
        }
      }
    });

    const data = JSON.parse(response.text);
    return data as ExplanationResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      explanation: "Could not fetch AI explanation at this time.",
      steps: ["Internal error occurred while processing."],
      context: "Try again later."
    };
  }
};
