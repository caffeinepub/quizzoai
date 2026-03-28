import type { MarksType, Question } from "../types";

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15); // Lowered from 30 to 15
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function extractKeyNoun(sentence: string): string {
  // Try capitalized proper nouns
  const match = sentence.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/);
  if (match) return match[1];
  // Try copula patterns
  const copula = sentence.match(
    /(?:is|are|was|were)\s+(?:a|an|the)?\s*([a-z][a-z\s]{3,20})/i,
  );
  if (copula) return copula[1].trim();
  // Fallback: find any word > 4 chars
  const words = sentence
    .split(/\s+/)
    .filter((w) => w.replace(/[^a-zA-Z]/g, "").length > 4);
  return (
    words[0]?.replace(/[^a-zA-Z\s]/g, "") ||
    sentence.split(" ")[0] ||
    "this topic"
  );
}

function extractShortPhrase(sentence: string): string {
  const words = sentence.split(" ");
  const start = Math.floor(Math.random() * Math.max(1, words.length - 5));
  return words
    .slice(start, start + Math.min(5, words.length - start))
    .join(" ")
    .replace(/[.,;:!?]$/, "");
}

const MCQ_TEMPLATES = [
  (noun: string, chapter: string) =>
    `Which of the following best describes "${noun}" in the context of ${chapter}?`,
  (noun: string, _ch: string) =>
    `What is the primary characteristic of ${noun}?`,
  (noun: string, _ch: string) =>
    `Which statement about ${noun} is most accurate?`,
  (noun: string, chapter: string) => `How is "${noun}" related to ${chapter}?`,
  (noun: string, chapter: string) =>
    `In ${chapter}, what role does ${noun} play?`,
  (_noun: string, chapter: string) =>
    `Which of the following is a key concept in ${chapter}?`,
];

const SHORT_TEMPLATES = [
  (noun: string, _ch: string) =>
    `What do you understand by ${noun}? Explain briefly.`,
  (noun: string, chapter: string) =>
    `Describe the significance of ${noun} in ${chapter}.`,
  (noun: string, _ch: string) => `Define ${noun} and give one example.`,
  (noun: string, _ch: string) => `Explain briefly: ${noun}.`,
  (noun: string, chapter: string) =>
    `What role does ${noun} play in ${chapter}?`,
  (_noun: string, chapter: string) =>
    `Explain the main concept discussed in ${chapter}.`,
];

const LONG_TEMPLATES = [
  (chapter: string) =>
    `Describe in detail the key aspects and importance of ${chapter}.`,
  (chapter: string) =>
    `Explain the significance of ${chapter} and its broader implications.`,
  (chapter: string) =>
    `Write a detailed note on the fundamental concepts in ${chapter}.`,
  (chapter: string) =>
    `Discuss how ${chapter} has contributed to our understanding of the world.`,
  (chapter: string) =>
    `Elaborate on the main principles and real-world applications of ${chapter}.`,
];

const FALLBACK_DISTRACTORS_POOL = [
  "None of the above",
  "Cannot be determined",
  "All of the above",
  "Not mentioned in the text",
  "It is not related",
  "Only in certain conditions",
  "Depends on the context",
  "Both A and B",
];

/**
 * Generate a list of generic subject-area questions when content is too sparse.
 */
function generateFallbackQuestions(
  marksType: MarksType,
  numQuestions: number,
  chapter: string,
): Question[] {
  const questions: Question[] = [];
  for (let i = 0; i < numQuestions; i++) {
    const tpl = i % LONG_TEMPLATES.length;
    if (marksType === "1mark") {
      const questionText = MCQ_TEMPLATES[i % MCQ_TEMPLATES.length](
        chapter,
        chapter,
      );
      const correct = `It is an important concept in ${chapter}`;
      const distractors = FALLBACK_DISTRACTORS_POOL.slice(0, 3);
      questions.push({
        id: i + 1,
        type: "1mark",
        question: questionText,
        options: shuffleArray([correct, ...distractors]),
        correctAnswer: correct,
      });
    } else if (marksType === "2mark") {
      const noun = chapter;
      const qt = SHORT_TEMPLATES[i % SHORT_TEMPLATES.length](noun, chapter);
      questions.push({
        id: i + 1,
        type: "2mark",
        question: qt,
        correctAnswer: `${chapter} is an important topic. It covers key concepts that are fundamental to understanding the subject.`,
      });
    } else {
      questions.push({
        id: i + 1,
        type: "5mark",
        question: LONG_TEMPLATES[tpl](chapter),
        correctAnswer: `${chapter} is a significant topic. It involves understanding core principles and their applications. Students should study the main ideas, their relationships, and real-world relevance. Regular practice and revision help in mastering the subject.`,
      });
    }
  }
  return questions;
}

function generateMCQ(
  sentences: string[],
  index: number,
  chapter: string,
): Question {
  const idx = index % sentences.length;
  const sentence = sentences[idx];
  const keyNoun = extractKeyNoun(sentence);

  const templateIdx = index % MCQ_TEMPLATES.length;
  const question = MCQ_TEMPLATES[templateIdx](keyNoun, chapter);

  const correctAnswer = extractShortPhrase(sentence);
  const otherSentences = sentences.filter((_, i) => i !== idx);
  const rawDistractors = shuffleArray(otherSentences)
    .slice(0, 3)
    .map(extractShortPhrase);

  // Pad distractors with fallbacks if needed
  const distractors = [...rawDistractors];
  let fbIdx = 0;
  while (distractors.length < 3) {
    distractors.push(
      FALLBACK_DISTRACTORS_POOL[fbIdx % FALLBACK_DISTRACTORS_POOL.length],
    );
    fbIdx++;
  }

  // Ensure correctAnswer is not identical to any distractor
  const safeDisractors = distractors.map((d, i) =>
    d === correctAnswer ? FALLBACK_DISTRACTORS_POOL[i] : d,
  );

  const options = shuffleArray([correctAnswer, ...safeDisractors]);

  return {
    id: index + 1,
    type: "1mark",
    question,
    options,
    correctAnswer,
  };
}

function generateShortAnswer(
  sentences: string[],
  index: number,
  chapter: string,
): Question {
  const idx = index % sentences.length;
  const sentence = sentences[idx];
  const keyNoun = extractKeyNoun(sentence) || chapter;
  const templateIdx = index % SHORT_TEMPLATES.length;
  const question = SHORT_TEMPLATES[templateIdx](keyNoun, chapter);
  return { id: index + 1, type: "2mark", question, correctAnswer: sentence };
}

function generateLongAnswer(
  sentences: string[],
  index: number,
  chapter: string,
): Question {
  const maxStart = Math.max(1, sentences.length - 3);
  const startIdx = (index * 3) % maxStart;
  const answerSentences = sentences.slice(startIdx, startIdx + 4);
  const answer =
    answerSentences.join(" ") || sentences.slice(0, 4).join(" ") || chapter;
  const templateIdx = index % LONG_TEMPLATES.length;
  const question = LONG_TEMPLATES[templateIdx](chapter);
  return { id: index + 1, type: "5mark", question, correctAnswer: answer };
}

export function generateQuestions(
  content: string,
  marksType: MarksType,
  numQuestions: number,
  chapter: string,
): Question[] {
  const sentences = splitSentences(content);

  // If no usable content at all, generate purely template-based questions
  if (sentences.length === 0) {
    return generateFallbackQuestions(marksType, numQuestions, chapter);
  }

  // If very sparse (< 2 sentences), duplicate sentences so we have enough material
  while (sentences.length < 4) {
    sentences.push(...sentences);
  }

  const questions: Question[] = [];
  let attempts = 0;
  const maxAttempts = numQuestions * 6;

  while (questions.length < numQuestions && attempts < maxAttempts) {
    let q: Question;
    if (marksType === "1mark") {
      q = generateMCQ(sentences, questions.length + attempts, chapter);
    } else if (marksType === "2mark") {
      q = generateShortAnswer(sentences, questions.length + attempts, chapter);
    } else {
      q = generateLongAnswer(sentences, questions.length + attempts, chapter);
    }
    questions.push({ ...q, id: questions.length + 1 });
    attempts++;
  }

  // Fill remaining if still short (edge case)
  const fallback = generateFallbackQuestions(marksType, numQuestions, chapter);
  let fbPtr = 0;
  while (questions.length < numQuestions) {
    questions.push({
      ...fallback[fbPtr % fallback.length],
      id: questions.length + 1,
    });
    fbPtr++;
  }

  return questions;
}
