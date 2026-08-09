import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export async function generateSummary(text: string): Promise<{
  summary: string;
  keyTopics: string[];
  importantPoints: string[];
  flashcards: {
    topic: string;
    question: string;
    answer: string;
  }[];
  quiz: {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: `
You are an AI study assistant.

Your task is to analyze ONLY the study material provided below.

STRICT RULES:

1. Use ONLY information found in the provided study material.
2. Do NOT use outside knowledge.
3. Do NOT add concepts that are not present in the material.
4. Do NOT invent definitions, examples, topics, or facts.
5. Every generated item must be supported by the study material.
6. If there is not enough information for a section, return an empty array.
7. Generate flashcards only from concepts actually present in the material.
8. Generate quiz questions only from concepts actually present in the material.
9. Do not generate JavaScript, programming, or other unrelated concepts unless they appear in the material.
10. Quiz questions must have exactly 4 options.
11. The correctIndex must be a number from 0 to 3.
12. Each quiz question must have exactly one correct answer.
13. The explanation must explain why the correct answer is correct using only the study material.
14. Do not include markdown or code fences around the JSON.
15. Return ONLY valid JSON.

Generate:

- A clear and useful summary.
- A list of key topics.
- Important learning points.
- Flashcards for active recall.
- Multiple-choice quiz questions for testing understanding.

For flashcards:
- Generate useful questions and answers based strictly on the material.
- Each flashcard must include a topic.

For quiz questions:
- Generate between 5 and 10 questions depending on how much useful information is available.
- Do not create unnecessary questions just to reach a number.
- Each question must contain exactly 4 answer options.
- correctIndex must identify the correct option.
- explanation must explain the correct answer.

Study Material:
${text}

Return ONLY valid JSON in exactly this format:

{
  "summary": "A clear summary based strictly on the study material.",
  "keyTopics": [
    "topic 1",
    "topic 2"
  ],
  "importantPoints": [
    "important point 1",
    "important point 2"
  ],
  "flashcards": [
    {
      "topic": "topic name",
      "question": "question based on the material",
      "answer": "answer based strictly on the material"
    }
  ],
  "quiz": [
    {
      "id": 1,
      "question": "question based on the material",
      "options": [
        "option A",
        "option B",
        "option C",
        "option D"
      ],
      "correctIndex": 0,
      "explanation": "Explanation based strictly on the study material."
    }
  ]
}
`,
  });

  const textResponse = response.text;

  if (!textResponse) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(textResponse);
}