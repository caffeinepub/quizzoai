import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  BookOpen,
  Clock,
  History,
  MessageSquare,
  Settings,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import {
  CLASSES,
  getBooksForBoard,
  getChaptersForBook,
} from "../data/chapters";
import type {
  Board,
  HistoryEntry,
  MarksType,
  QuizConfig,
  UserProfile,
} from "../types";
import { clearHistory, loadHistory } from "../utils/storage";
import { ProfileChip } from "./ProfileChip";

const BOARDS: Board[] = ["CBSE", "RBSE", "ICSE", "Other"];

const MARKS_OPTIONS: { value: MarksType; label: string; desc: string }[] = [
  { value: "1mark", label: "1 Mark", desc: "MCQ – 4 options" },
  { value: "2mark", label: "2 Marks", desc: "Short Answer" },
  { value: "5mark", label: "5 Marks", desc: "Long Answer" },
];

interface Props {
  onStart: (config: QuizConfig) => void;
  isLoading: boolean;
  user?: UserProfile;
  onLogout?: () => void;
  onProfile?: () => void;
}

export function SetupScreen({
  onStart,
  isLoading,
  user,
  onLogout,
  onProfile,
}: Props) {
  const [className, setClassName] = useState("");
  const [board, setBoard] = useState<Board | "">("");
  const [book, setBook] = useState("");
  const [chapter, setChapter] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [marksType, setMarksType] = useState<MarksType>("1mark");
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(
    () => localStorage.getItem("quizzo_openai_key") ?? "",
  );

  const apiKeyActive = !!localStorage.getItem("quizzo_openai_key");

  const books = board ? getBooksForBoard(board as Board) : [];
  const chapters =
    board && book && className
      ? getChaptersForBook(board as Board, book, className)
      : [];

  function handleBoardChange(val: Board) {
    setBoard(val);
    setBook("");
    setChapter("");
  }
  function handleBookChange(val: string) {
    setBook(val);
    setChapter("");
  }
  function handleClassChange(val: string) {
    setClassName(val);
    setChapter("");
  }

  function handleStart() {
    if (!className) {
      setError("Please select a class.");
      return;
    }
    if (!board) {
      setError("Please select a board.");
      return;
    }
    if (!book) {
      setError("Please select a book.");
      return;
    }
    if (!chapter) {
      setError("Please select a chapter.");
      return;
    }
    setError("");
    onStart({
      className,
      board: board as Board,
      book,
      chapter,
      numQuestions,
      marksType,
    });
  }

  function handleClearHistory() {
    clearHistory();
    setHistory([]);
  }

  function handleSaveKey() {
    if (apiKeyInput.trim()) {
      localStorage.setItem("quizzo_openai_key", apiKeyInput.trim());
    } else {
      localStorage.removeItem("quizzo_openai_key");
    }
    setShowSettings(false);
    // Force re-render to update status label
    setApiKeyInput(apiKeyInput.trim());
  }

  function handleClearKey() {
    localStorage.removeItem("quizzo_openai_key");
    setApiKeyInput("");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-header sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-white">QuizzoAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {["Home", "About", "Help"].map((link) => (
              <span
                key={link}
                className="text-sm font-medium text-white/60 hover:text-white cursor-pointer transition-colors"
              >
                {link}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {onProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={onProfile}
                className="border-white/20 text-white/80 bg-white/5 hover:bg-white/15 hover:text-white"
                data-ocid="setup.profile.button"
                title="My Profile"
              >
                <User className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  "mailto:khushalvyas249@gmail.com?subject=QuizzoAI%20Feedback&body=Hi%20QuizzoAI%20Team%2C%0A%0AFeedback%3A%20%0A%0AYour%20Name%3A%20%0AClass%3A%20%0ABoard%3A%20",
                )
              }
              className="border-white/20 text-white/70 bg-white/5 hover:bg-white/15 hover:text-white"
              data-ocid="setup.feedback.button"
              title="Send Feedback"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings((s) => !s)}
              className={`border-white/20 text-white/80 bg-white/5 hover:bg-white/15 hover:text-white ${
                showSettings ? "bg-white/15 border-primary/40" : ""
              }`}
              data-ocid="setup.settings.toggle"
              title="API Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
            {onLogout && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="border-white/20 text-white/80 bg-white/5 hover:bg-white/15 hover:text-white"
                data-ocid="nav.secondary_button"
              >
                Log Out
              </Button>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t border-white/10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
              <div className="glass-card rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary" />
                    GPT-4 Settings
                  </h3>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      apiKeyInput.trim() || apiKeyActive
                        ? "text-green-400 bg-green-500/10 border-green-500/30"
                        : "text-white/50 bg-white/5 border-white/15"
                    }`}
                  >
                    {apiKeyInput.trim() || apiKeyActive
                      ? "GPT-4 Active ✓"
                      : "Using Wikipedia"}
                  </span>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                    OpenAI API Key
                  </Label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-..."
                    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/15 text-white/90 text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                    data-ocid="setup.apikey.input"
                  />
                  <p className="text-xs text-white/35">
                    Your key is stored only in your browser and sent exclusively
                    to OpenAI's API.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveKey}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
                    data-ocid="setup.apikey.save_button"
                  >
                    Save Key
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearKey}
                    className="border-white/20 text-white/70 bg-white/5 hover:bg-white/15 text-xs"
                    data-ocid="setup.apikey.delete_button"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Banner */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-10 pb-6">
        <div className="text-center space-y-3 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI-Powered Exam Preparation
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Master Your <span className="text-primary">Exams</span> with AI
          </h1>
          <p className="text-base text-white/60 max-w-xl mx-auto">
            Generate exam-style questions from NCERT, RBSE & ICSE chapters
            powered by Wikipedia. Choose your class, board, and chapter to get
            started.
          </p>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pb-8 space-y-5">
        {/* Profile Chip */}
        {user && onLogout && <ProfileChip user={user} onLogout={onLogout} />}

        {/* Filters Card */}
        <div className="glass-card rounded-xl p-6 animate-fade-in">
          <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            Configure Your Test
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Class */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                Class
              </Label>
              <Select value={className} onValueChange={handleClassChange}>
                <SelectTrigger
                  className="h-9 bg-white/5 border-white/15 text-white"
                  data-ocid="setup.class.select"
                >
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Board */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                Board
              </Label>
              <Select
                value={board}
                onValueChange={(v) => handleBoardChange(v as Board)}
              >
                <SelectTrigger
                  className="h-9 bg-white/5 border-white/15 text-white"
                  data-ocid="setup.board.select"
                >
                  <SelectValue placeholder="Select board" />
                </SelectTrigger>
                <SelectContent>
                  {BOARDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Book */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                Book
              </Label>
              <Select
                value={book}
                onValueChange={handleBookChange}
                disabled={!board}
              >
                <SelectTrigger
                  className="h-9 bg-white/5 border-white/15 text-white"
                  data-ocid="setup.book.select"
                >
                  <SelectValue placeholder="Select book" />
                </SelectTrigger>
                <SelectContent>
                  {books.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Chapter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                Chapter
              </Label>
              <Select
                value={chapter}
                onValueChange={setChapter}
                disabled={chapters.length === 0}
              >
                <SelectTrigger
                  className="h-9 bg-white/5 border-white/15 text-white"
                  data-ocid="setup.chapter.select"
                >
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Number of Questions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  Number of Questions
                </Label>
                <span className="text-sm font-bold text-primary bg-primary/15 px-2 py-0.5 rounded">
                  {numQuestions}
                </span>
              </div>
              <Slider
                min={1}
                max={30}
                step={1}
                value={[numQuestions]}
                onValueChange={([v]) => setNumQuestions(v)}
                className="w-full"
                data-ocid="setup.questions.select"
              />
              <div className="flex justify-between text-xs text-white/40">
                <span>1</span>
                <span>30</span>
              </div>
            </div>

            {/* Marks Type */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                Marks Type
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {MARKS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMarksType(opt.value)}
                    className={`flex flex-col items-center p-2.5 rounded-lg border text-center transition-all ${
                      marksType === opt.value
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-white/15 text-white/50 hover:border-primary/40 hover:bg-white/5"
                    }`}
                    data-ocid={`setup.marks.${opt.value}.toggle`}
                  >
                    <span className="text-sm font-bold">{opt.label}</span>
                    <span className="text-xs mt-0.5 opacity-80">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Start Card */}
        <div className="glass-card rounded-xl p-6 text-center space-y-4 animate-slide-up">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">
              Start Your Customized Test
            </h3>
            <p className="text-sm text-white/55">
              {localStorage.getItem("quizzo_openai_key")
                ? "Questions will be generated using GPT-4 (AI-powered)."
                : "Questions will be generated from Wikipedia content for your selected chapter."}
            </p>
          </div>
          {error && (
            <p
              className="text-sm text-destructive font-medium"
              data-ocid="setup.error_state"
            >
              {error}
            </p>
          )}
          <Button
            onClick={handleStart}
            disabled={isLoading}
            className="h-11 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/30"
            data-ocid="setup.start.primary_button"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <title>Loading</title>
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Generating Questions...
              </span>
            ) : (
              "Start Test →"
            )}
          </Button>
        </div>

        {/* History */}
        <div className="glass-card rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowHistory((s) => !s)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
            data-ocid="setup.history.toggle"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-white/50" />
              <span className="text-sm font-semibold text-white">
                Test History
              </span>
              <Badge
                variant="secondary"
                className="text-xs bg-primary/20 text-primary border-primary/30"
              >
                {history.length}
              </Badge>
            </div>
            <svg
              className={`w-4 h-4 text-white/50 transition-transform ${showHistory ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Toggle</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {showHistory && (
            <div className="border-t border-white/10">
              {history.length === 0 ? (
                <div
                  className="px-6 py-8 text-center"
                  data-ocid="history.empty_state"
                >
                  <p className="text-sm text-white/40">
                    No test history yet. Take your first test!
                  </p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-white/10">
                    {history.map((entry, i) => (
                      <div
                        key={entry.id}
                        className="px-6 py-3 flex items-center justify-between hover:bg-white/5"
                        data-ocid={`history.item.${i + 1}`}
                      >
                        <div>
                          <p className="text-sm font-medium text-white/90">
                            {entry.chapter}
                          </p>
                          <p className="text-xs text-white/40">
                            {entry.className} · {entry.board} ·{" "}
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">
                              {entry.score}/{entry.total}
                            </p>
                            <p className="text-xs text-white/40">
                              {Math.round((entry.score / entry.total) * 100)}%
                            </p>
                          </div>
                          <Clock className="w-3.5 h-3.5 text-white/30" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 transition-colors"
                      data-ocid="history.delete_button"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear History
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-header border-t border-white/10 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-1">
          <p className="text-xs text-white/40">
            Developed by{" "}
            <span className="font-semibold text-white/70">Khushal Vyas</span>{" "}
            and{" "}
            <span className="font-semibold text-white/70">Amman Manwani</span> ·
            Class 10 Students · Satguru International School, Ajmer
          </p>
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
