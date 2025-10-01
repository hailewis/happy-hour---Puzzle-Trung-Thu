
import { GoogleGenAI, Type } from '@google/genai';
import { Question } from '../types';
import { TOTAL_QUESTIONS_PER_PUZZLE } from '../constants';

// FIX: Per coding guidelines, directly use process.env.API_KEY and remove checks for its existence.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const generateQuestionsSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      description: `An array of exactly ${TOTAL_QUESTIONS_PER_PUZZLE} trivia questions.`,
      items: {
        type: Type.OBJECT,
        properties: {
          q: {
            type: Type.STRING,
            description: 'The question text, in Vietnamese.',
          },
          a: {
            type: Type.ARRAY,
            description: 'An array of possible correct answers, in Vietnamese. All answers should be normalized to uppercase without accents.',
            items: {
              type: Type.STRING,
            },
          },
        },
        required: ['q', 'a'],
      },
    },
  },
  required: ['questions'],
};

export const generateQuestions = async (theme: string): Promise<Omit<Question, 'id'>[]> => {
  // FIX: Removed check for API_KEY as per guidelines.
  try {
    const prompt = `Generate exactly ${TOTAL_QUESTIONS_PER_PUZZLE} trivia questions about the Vietnamese holiday "${theme}". The questions and answers must be in Vietnamese. For the answers, provide a list of possible correct variations. All answers in the list must be normalized: converted to uppercase, with Vietnamese accents removed (e.g., 'TRUNG THU' instead of 'Trung Thu'). The question text should remain in proper Vietnamese with accents.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: generateQuestionsSchema,
        temperature: 0.8,
      },
    });

    const textResponse = response.text.trim();
    const parsedResponse = JSON.parse(textResponse);
    
    if (parsedResponse.questions && parsedResponse.questions.length === TOTAL_QUESTIONS_PER_PUZZLE) {
        return parsedResponse.questions;
    } else {
        throw new Error("AI không trả về đủ số lượng câu hỏi như mong đợi.");
    }

  } catch (error) {
    console.error("Error generating questions with Gemini API:", error);
    throw new Error("Tạo câu hỏi thất bại. Vui lòng kiểm tra lại chủ đề hoặc thử lại sau.");
  }
};