import { useState } from "react";
import { KhushalAI } from "./components/KhushalAI";
import { LoginScreen } from "./components/LoginScreen";
import { ProfilePage } from "./components/ProfilePage";
import { ResultScreen } from "./components/ResultScreen";
import { SetupScreen } from "./components/SetupScreen";
import { TestScreen } from "./components/TestScreen";
import { useAuth } from "./hooks/useAuth";
import type { QuizConfig, Screen, TestState } from "./types";
import { generateQuestionsWithGPT4 } from "./utils/openai";
import { generateQuestions } from "./utils/questionGenerator";
import { saveHistoryEntry } from "./utils/storage";
import { fetchWikipediaContent } from "./utils/wikipedia";

function Watermark() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontSize: "15vw",
          fontWeight: 900,
          color: "white",
          opacity: 0.03,
          transform: "rotate(-25deg)",
          whiteSpace: "nowrap",
          letterSpacing: "0.05em",
          lineHeight: 1,
        }}
      >
        NO.1 STUDY TOOL
      </span>
    </div>
  );
}

function BackgroundOrbs() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.6 0.25 280), transparent 70%)",
          top: "-10%",
          left: "-8%",
          opacity: 0.25,
          animation: "float-orb 14s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[420px] h-[420px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.22 230), transparent 70%)",
          top: "35%",
          right: "-10%",
          opacity: 0.2,
          animation: "float-orb 18s ease-in-out infinite 4s",
        }}
      />
      <div
        className="absolute w-[380px] h-[380px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.55 0.22 310), transparent 70%)",
          bottom: "-8%",
          left: "25%",
          opacity: 0.22,
          animation: "float-orb 16s ease-in-out infinite 8s",
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.7 0.18 200), transparent 70%)",
          top: "15%",
          left: "55%",
          opacity: 0.15,
          animation: "float-orb 20s ease-in-out infinite 2s",
        }}
      />
      {/* Star field */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 15% 20%, oklch(1 0 0 / 0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 45% 8%, oklch(1 0 0 / 0.5) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 72% 35%, oklch(1 0 0 / 0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 88% 15%, oklch(1 0 0 / 0.7) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 55%, oklch(1 0 0 / 0.4) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 60% 70%, oklch(1 0 0 / 0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 10% 80%, oklch(1 0 0 / 0.35) 0%, transparent 100%),
            radial-gradient(1px 1px at 92% 65%, oklch(1 0 0 / 0.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 90%, oklch(1 0 0 / 0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 78% 85%, oklch(1 0 0 / 0.5) 0%, transparent 100%)
          `,
        }}
      />
    </div>
  );
}

export default function App() {
  const { user, logout, loginAsGuest, loginWithProvider } = useAuth();
  const [screen, setScreen] = useState<Screen>("setup");
  const [testState, setTestState] = useState<TestState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return (
      <>
        <BackgroundOrbs />
        <Watermark />
        <div className="relative z-10">
          <LoginScreen
            loginAsGuest={loginAsGuest}
            loginWithProvider={loginWithProvider}
          />
        </div>
      </>
    );
  }

  async function handleStart(config: QuizConfig) {
    setIsLoading(true);
    try {
      let questions: import("./types").Question[];
      const apiKey = localStorage.getItem("quizzo_openai_key") ?? "";

      if (apiKey) {
        try {
          questions = await generateQuestionsWithGPT4(
            config,
            config.numQuestions,
            apiKey,
          );
        } catch (gptErr) {
          console.warn(
            "GPT-4 generation failed, falling back to Wikipedia:",
            gptErr,
          );
          const content = await fetchWikipediaContent(config.chapter);
          questions = generateQuestions(
            content,
            config.marksType,
            config.numQuestions,
            config.chapter,
          );
        }
      } else {
        const content = await fetchWikipediaContent(config.chapter);
        questions = generateQuestions(
          content,
          config.marksType,
          config.numQuestions,
          config.chapter,
        );
      }

      const state: TestState = {
        config,
        questions,
        answers: {},
        submitted: false,
        startTime: Date.now(),
      };
      setTestState(state);
      setScreen("test");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to generate questions. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleAnswerChange(questionId: number, value: string) {
    setTestState((prev) =>
      prev
        ? { ...prev, answers: { ...prev.answers, [questionId]: value } }
        : prev,
    );
  }

  function handleSubmit() {
    if (!testState) return;
    const submitted = { ...testState, submitted: true };
    setTestState(submitted);

    let score = 0;
    for (const q of submitted.questions) {
      const ans = (submitted.answers[q.id] ?? "").trim().toLowerCase();
      if (q.type === "1mark") {
        if (ans === q.correctAnswer.trim().toLowerCase()) score++;
      } else {
        if (ans.length > 10) score++;
      }
    }

    saveHistoryEntry({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      className: submitted.config.className,
      board: submitted.config.board,
      book: submitted.config.book,
      chapter: submitted.config.chapter,
      score,
      total: submitted.questions.length,
    });

    setScreen("result");
  }

  function handleTryAgain() {
    setTestState(null);
    setScreen("setup");
  }

  if (screen === "profile") {
    return (
      <>
        <BackgroundOrbs />
        <Watermark />
        <div className="relative z-10">
          <ProfilePage
            user={user}
            onBack={() => setScreen("setup")}
            onLogout={logout}
          />
        </div>
      </>
    );
  }

  if (screen === "setup") {
    return (
      <>
        <BackgroundOrbs />
        <Watermark />
        <div className="relative z-10">
          <SetupScreen
            onStart={handleStart}
            isLoading={isLoading}
            user={user}
            onLogout={logout}
            onProfile={() => setScreen("profile")}
          />
          <KhushalAI screen="setup" chapter="" />
        </div>
      </>
    );
  }

  if (screen === "test" && testState) {
    return (
      <>
        <BackgroundOrbs />
        <Watermark />
        <div className="relative z-10">
          <TestScreen
            testState={testState}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleSubmit}
            onLogout={logout}
          />
          <KhushalAI screen="test" chapter={testState.config.chapter} />
        </div>
      </>
    );
  }

  if (screen === "result" && testState) {
    const score = testState.questions.reduce((acc, q) => {
      const ans = (testState.answers[q.id] ?? "").trim().toLowerCase();
      if (q.type === "1mark") {
        return acc + (ans === q.correctAnswer.trim().toLowerCase() ? 1 : 0);
      }
      return acc + (ans.length > 10 ? 1 : 0);
    }, 0);
    const percentage = Math.round((score / testState.questions.length) * 100);
    return (
      <>
        <BackgroundOrbs />
        <Watermark />
        <div className="relative z-10">
          <ResultScreen
            testState={testState}
            onTryAgain={handleTryAgain}
            onLogout={logout}
            onFeedback={() =>
              window.open(
                "mailto:khushalvyas249@gmail.com?subject=QuizzoAI%20Feedback&body=Hi%20QuizzoAI%20Team%2C%0A%0AFeedback%3A%20%0A%0AYour%20Name%3A%20%0AClass%3A%20%0ABoard%3A%20",
              )
            }
          />
          <KhushalAI
            screen="result"
            chapter={testState.config.chapter}
            percentage={percentage}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <BackgroundOrbs />
      <Watermark />
      <div className="relative z-10">
        <SetupScreen
          onStart={handleStart}
          isLoading={isLoading}
          user={user}
          onLogout={logout}
          onProfile={() => setScreen("profile")}
        />
      </div>
    </>
  );
}
