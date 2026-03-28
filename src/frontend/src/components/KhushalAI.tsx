import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Screen } from "../types";

interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
}

interface Props {
  screen: Screen;
  chapter: string;
  percentage?: number;
}

function getKhushalResponse(
  userMsg: string,
  screen: Screen,
  chapter: string,
  percentage?: number,
): string {
  const msg = userMsg.toLowerCase();

  if (screen === "result") {
    if (
      msg.includes("score") ||
      msg.includes("result") ||
      msg.includes("how")
    ) {
      if (percentage !== undefined) {
        if (percentage >= 90)
          return `You scored ${percentage}%! That's outstanding! 🌟 You've clearly mastered ${chapter}. Keep this momentum going!`;
        if (percentage >= 70)
          return `You scored ${percentage}%! Good performance on ${chapter}. Review the questions you missed and you'll be even stronger next time!`;
        return `You scored ${percentage}% on ${chapter}. Don't worry — every test is a learning opportunity. Study the correct answers and try again!`;
      }
    }
    if (
      msg.includes("weak") ||
      msg.includes("improve") ||
      msg.includes("help")
    ) {
      return "Focus on reviewing your incorrect answers. Re-read the chapter thoroughly and try to understand the core concepts. You can do it! 💪";
    }
    if (
      msg.includes("motivat") ||
      msg.includes("sad") ||
      msg.includes("disappoint")
    ) {
      return "Every expert was once a beginner! Mistakes show you where to grow. Take a break, review the chapter, and try again. I believe in you! 🚀";
    }
    if (percentage !== undefined && percentage < 70) {
      return `For improvement in ${chapter}, try:\n1. Re-read the chapter summaries\n2. Make short notes of key facts\n3. Practice more questions\n\nYou'll do better next time! 📚`;
    }
    return "Great effort on your test! Review the chapters you found difficult. Consistent study builds confidence. What topic would you like help with?";
  }

  if (
    msg.includes("answer") ||
    msg.includes("solution") ||
    msg.includes("tell me") ||
    msg.includes("what is the")
  ) {
    return `I can't give you direct answers during a test — that wouldn't be fair! 😊 Try thinking about what you've read in ${chapter}. What do you recall about the topic?`;
  }

  if (msg.includes("hint") || msg.includes("clue") || msg.includes("help")) {
    return `Here's a hint: Think about the key concepts in ${chapter}. Wikipedia gives a great overview — focus on the main definitions, processes, and important figures or events mentioned. 💡`;
  }

  if (
    msg.includes("stuck") ||
    msg.includes("don't know") ||
    msg.includes("confus")
  ) {
    return "Don't stress! Read the question carefully and focus on keywords. Sometimes eliminating wrong options helps for MCQs. Trust what you've studied! 🎯";
  }

  if (msg.includes("time") || msg.includes("fast")) {
    return "Manage your time wisely! For MCQs, spend ~1 minute per question. If stuck, mark it and move on. Return to skipped questions at the end. ⏱️";
  }

  if (msg.includes("easy") || msg.includes("boring")) {
    return "Stay focused! Even easy-looking questions can have tricky wording. Read each option carefully before selecting. 📖";
  }

  const chapterKeywords = chapter.toLowerCase().split(/\s+/);
  const hasKeyword = chapterKeywords.some(
    (kw) => kw.length > 3 && msg.includes(kw),
  );
  if (hasKeyword) {
    return `Great question about ${chapter}! Think about what the Wikipedia article says — focus on the main ideas, definitions, and key examples related to this topic. 🧠`;
  }

  const encouragements = [
    "You're doing great! Stay focused and trust your knowledge. Every question answered is progress! 💪",
    "Keep going! Take a deep breath and read each question carefully. You've got this! 🌟",
    `Remember: Think about the key concepts in ${chapter}. You prepared for this — trust yourself! 📚`,
    "Excellent effort! Concentration is key. Eliminate options you're sure are wrong, then choose the best remaining answer. 🎯",
  ];
  return encouragements[Math.floor(Math.random() * encouragements.length)];
}

export function KhushalAI({ screen, chapter, percentage }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "bot",
      text:
        screen === "result"
          ? `Hi! I'm KHUSHALAI 🤖 You've completed your test on "${chapter}". How can I help you review your performance?`
          : `Hi! I'm KHUSHALAI 🤖 Your AI study assistant! I'm here to give hints and encouragement during your test on "${chapter}". Ask me anything!`,
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  // Track message count to trigger scroll
  const messageCount = messages.length;

  useEffect(() => {
    if (messageCount > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageCount]);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: nextId.current++, role: "user", text };
    const botText = getKhushalResponse(text, screen, chapter, percentage);
    const botMsg: Message = {
      id: nextId.current++,
      role: "bot",
      text: botText,
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all font-semibold text-sm"
        data-ocid="khushal.open_modal_button"
      >
        <Bot className="w-4 h-4" />
        Ask KHUSHALAI
      </button>

      {open && (
        <div
          className="fixed bottom-20 right-6 z-50 w-80 bg-card rounded-xl border border-border shadow-xl flex flex-col overflow-hidden animate-slide-up"
          style={{ maxHeight: "420px" }}
          data-ocid="khushal.dialog"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span className="font-bold text-sm">KHUSHALAI</span>
              <span className="text-xs opacity-70">AI Assistant</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="hover:opacity-70 transition-opacity"
              data-ocid="khushal.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <ScrollArea className="flex-1 p-3" style={{ height: "300px" }}>
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-border p-2 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask for a hint..."
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              data-ocid="khushal.input"
            />
            <Button
              size="sm"
              onClick={sendMessage}
              className="h-8 w-8 p-0 bg-primary hover:bg-primary/90"
              data-ocid="khushal.submit_button"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
