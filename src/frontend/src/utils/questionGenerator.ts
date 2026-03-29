import type { MarksType, Question } from "../types";

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Extract the most meaningful noun/concept from a sentence.
 * Prefers subject-before-verb patterns like "Work is..." → "Work"
 */
function extractSubjectNoun(sentence: string): string {
  // Pattern: "X is/are/was/were ..." → X is the subject
  const subjectMatch = sentence.match(
    /^([A-Z][\w\s]{1,30}?)\s+(?:is|are|was|were|refers|means|represents|describes|defines)\b/,
  );
  if (subjectMatch) return subjectMatch[1].trim();

  // Pattern: "The X of Y is ..." → extract Y or X
  const ofMatch = sentence.match(
    /\bThe\s+([A-Z][a-z]+(?:\s+[A-Z]?[a-z]+)*)\s+of\s+([A-Z][a-z]+)/i,
  );
  if (ofMatch) return ofMatch[2].trim();

  // Capitalized proper noun phrase
  const properNoun = sentence.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/);
  if (properNoun && properNoun[1].length > 2) return properNoun[1].trim();

  // Fallback: first meaningful word > 3 chars
  const words = sentence
    .replace(/[^a-zA-Z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  return words[0] || "this concept";
}

/**
 * Extract a concise answer phrase (not the full sentence).
 */
function extractAnswerPhrase(sentence: string): string {
  // After "is/are": take up to ~10 words as the answer
  const afterCopula = sentence.match(
    /(?:is|are|was|were|refers to|means)\s+(?:a|an|the)?\s*(.{5,80}?)(?:[.;,]|$)/i,
  );
  if (afterCopula) return afterCopula[1].trim();

  // Fallback: just the sentence up to first comma or period
  return sentence
    .replace(/[.!?]$/, "")
    .slice(0, 80)
    .trim();
}

// ---- 1-MARK MCQ TEMPLATES ----
type McqTemplateFn = (noun: string, chapter: string) => string;
const MCQ_TEMPLATES: McqTemplateFn[] = [
  (noun) => `What is ${noun}?`,
  (noun) => `Define ${noun}.`,
  (noun) => `Which of the following correctly describes ${noun}?`,
  (noun, chapter) => `What does ${noun} represent in ${chapter}?`,
  (noun) => `What is the meaning of ${noun}?`,
  (noun) => `How is ${noun} defined?`,
  (noun, chapter) => `In the context of ${chapter}, what is ${noun}?`,
  (noun) => `Which statement about ${noun} is correct?`,
];

// ---- 2-MARK SHORT TEMPLATES ----
type ShortTemplateFn = (noun: string, chapter: string) => string;
const SHORT_TEMPLATES: ShortTemplateFn[] = [
  (noun) => `What is ${noun}? Explain briefly.`,
  (noun) => `Define ${noun} and give one example.`,
  (noun, chapter) => `What is the importance of ${noun} in ${chapter}?`,
  (noun) => `Explain ${noun} in your own words.`,
  (noun) => `What do you understand by ${noun}?`,
  (noun, chapter) => `How does ${noun} relate to ${chapter}?`,
  (noun) => `Describe ${noun} briefly.`,
  (noun) => `What is the role of ${noun}?`,
];

// ---- 5-MARK LONG TEMPLATES ----
type LongTemplateFn = (chapter: string) => string;
const LONG_TEMPLATES: LongTemplateFn[] = [
  (chapter) => `Describe the key concepts of ${chapter} in detail.`,
  (chapter) => `Explain the significance of ${chapter} with examples.`,
  (chapter) => `Write a detailed note on ${chapter}.`,
  (chapter) =>
    `Discuss the main principles of ${chapter} and their applications.`,
  (chapter) => `Elaborate on ${chapter} and explain its importance.`,
];

const FALLBACK_DISTRACTORS_POOL = [
  "None of the above",
  "Cannot be determined",
  "All of the above",
  "Not mentioned in the text",
  "It has no significance",
  "Only in certain conditions",
  "Depends on external factors",
  "Both A and B are correct",
];

function generateFallbackQuestions(
  marksType: MarksType,
  numQuestions: number,
  chapter: string,
): Question[] {
  const questions: Question[] = [];
  for (let i = 0; i < numQuestions; i++) {
    if (marksType === "1mark") {
      const question = MCQ_TEMPLATES[i % MCQ_TEMPLATES.length](
        chapter,
        chapter,
      );
      const correct = `It is an important concept in ${chapter}`;
      const distractors = FALLBACK_DISTRACTORS_POOL.slice(0, 3);
      questions.push({
        id: i + 1,
        type: "1mark",
        question,
        options: shuffleArray([correct, ...distractors]),
        correctAnswer: correct,
      });
    } else if (marksType === "2mark") {
      questions.push({
        id: i + 1,
        type: "2mark",
        question: SHORT_TEMPLATES[i % SHORT_TEMPLATES.length](chapter, chapter),
        correctAnswer: `${chapter} is an important concept that forms a core part of this subject.`,
      });
    } else {
      questions.push({
        id: i + 1,
        type: "5mark",
        question: LONG_TEMPLATES[i % LONG_TEMPLATES.length](chapter),
        correctAnswer: `${chapter} is a significant topic covering key principles and real-world applications.`,
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
  const subject = extractSubjectNoun(sentence);
  const correctAnswer = extractAnswerPhrase(sentence);

  const templateIdx = index % MCQ_TEMPLATES.length;
  const question = MCQ_TEMPLATES[templateIdx](subject, chapter);

  // Build distractors from other sentences
  const otherSentences = sentences.filter((_, i) => i !== idx);
  const rawDistractors = shuffleArray(otherSentences)
    .slice(0, 3)
    .map(extractAnswerPhrase);

  const distractors = [...rawDistractors];
  let fbIdx = 0;
  while (distractors.length < 3) {
    distractors.push(
      FALLBACK_DISTRACTORS_POOL[fbIdx % FALLBACK_DISTRACTORS_POOL.length],
    );
    fbIdx++;
  }

  const safeDistractors = distractors.map((d, i) =>
    d === correctAnswer ? FALLBACK_DISTRACTORS_POOL[i] : d,
  );

  return {
    id: index + 1,
    type: "1mark",
    question,
    options: shuffleArray([correctAnswer, ...safeDistractors]),
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
  const subject = extractSubjectNoun(sentence) || chapter;
  const templateIdx = index % SHORT_TEMPLATES.length;
  const question = SHORT_TEMPLATES[templateIdx](subject, chapter);
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

  if (sentences.length === 0) {
    return generateFallbackQuestions(marksType, numQuestions, chapter);
  }

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
