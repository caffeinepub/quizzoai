import type { MarksType, Question, QuizConfig } from "../types";

export async function generateQuestionsWithGPT4(
  config: QuizConfig,
  numQuestions: number,
  apiKey: string,
): Promise<Question[]> {
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("No OpenAI API key provided.");
  }

  const { chapter, book, className, board, marksType } = config;

  const typeDesc: Record<MarksType, string> = {
    "1mark": "1-mark MCQ",
    "2mark": "2-mark short answer",
    "5mark": "5-mark long answer",
  };

  const formatNote =
    marksType === "1mark"
      ? `For each question include "options" (array of 4 choices) and "correctAnswer" matching one option exactly.`
      : marksType === "2mark"
        ? `No options. "correctAnswer" is a 2-3 sentence answer.`
        : `No options. "correctAnswer" is a detailed paragraph.`;

  const userPrompt = `Generate ${numQuestions} ${typeDesc[marksType]} exam questions for the chapter "${chapter}" from "${book}" for Class ${className} ${board} board students.

Return ONLY a valid JSON array with this exact format:
[{"id":1,"type":"${marksType}","question":"...","options":["A","B","C","D"],"correctAnswer":"A"}]

${formatNote}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert NCERT exam question generator for Indian school students. Always return valid JSON only, no markdown fences.",
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `OpenAI API error: ${
        (err as { error?: { message?: string } })?.error?.message ||
        response.statusText
      }`,
    );
  }

  const data = await response.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";

  // Strip potential markdown code fences
  const cleaned = content.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned) as Question[];

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("GPT-4 returned an empty question list.");
  }

  return parsed.map((q, i) => ({
    id: i + 1,
    type: marksType,
    question: q.question,
    options: marksType === "1mark" ? q.options : undefined,
    correctAnswer: q.correctAnswer,
  }));
}
