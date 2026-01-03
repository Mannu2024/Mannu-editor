
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeDocument = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Please provide a detailed, well-formatted summary of the following document content: \n\n${text.substring(0, 30000)}`,
    config: { temperature: 0.5 }
  });
  return response.text || "Summary generation failed.";
};

export const enhanceDocument = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an expert document editor. Please improve the clarity, professional tone, and grammar of the following text while preserving its original meaning. Format it beautifully with sections if needed: \n\n${text.substring(0, 30000)}`,
    config: { temperature: 0.7 }
  });
  return response.text || "Enhancement failed.";
};

export const chatWithDocument = async (text: string, question: string, history: {role: string, content: string}[]): Promise<string> => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are Mannu AI, a sophisticated PDF assistant. Use this document context to answer the user's questions perfectly. If the answer isn't in the context, say you don't know but try to be as helpful as possible based on general knowledge if appropriate. \n\nDocument Content: ${text.substring(0, 20000)}`,
    }
  });
  const response = await chat.sendMessage({ message: question });
  return response.text || "No response received.";
};

export const performAIOCR = async (file: File): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extract and format all visible text from this document perfectly. Preserve the structure as much as possible. \n\n[CONTEXT: This is a user-uploaded document named ${file.name}]`,
  });
  return response.text || "OCR processing failed.";
};

export const extractTextFromPdfPlaceholder = async (file: File): Promise<string> => {
    // Note: For real text extraction, we would use pdf.js's textContent layer. 
    // This helper facilitates sending textual context to Gemini.
    return `Content extracted from ${file.name}. (System: Processing complete text layer for AI analysis).`;
};
