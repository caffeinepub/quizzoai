import {
  BookOpen,
  Brain,
  Globe,
  GraduationCap,
  Loader2,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { SiFacebook } from "react-icons/si";

type ModalType = "google" | "facebook" | null;

interface LoginScreenProps {
  loginAsGuest: () => void;
  loginWithProvider: (
    name: string,
    email: string,
    provider: "google" | "facebook",
  ) => void;
}

export function LoginScreen({
  loginAsGuest,
  loginWithProvider,
}: LoginScreenProps) {
  const [modal, setModal] = useState<ModalType>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const features = [
    { icon: Globe, text: "Wikipedia-powered questions" },
    { icon: Brain, text: "AI Assistant KHUSHALAI" },
    { icon: GraduationCap, text: "All major boards & subjects" },
  ];

  function openModal(type: ModalType) {
    setModal(type);
    setName("");
    setEmail("");
    setError("");
  }

  function closeModal() {
    setModal(null);
    setError("");
  }

  async function handleProviderLogin() {
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    loginWithProvider(name, email, modal as "google" | "facebook");
    setLoading(false);
    closeModal();
  }

  function handleGuest() {
    loginAsGuest();
  }

  const isGoogle = modal === "google";
  const modalAccent = isGoogle ? "#4285F4" : "#1877F2";
  const modalLabel = isGoogle ? "Google" : "Facebook";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Glass card */}
      <div className="w-full max-w-md bg-white/8 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl shadow-black/40 space-y-7">
        {/* Branding */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center shadow-lg shadow-primary/30">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              QuizzoAI
            </h1>
            <p className="text-sm text-white/60 leading-relaxed">
              Your AI-powered exam preparation companion
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="space-y-3">
          {features.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-white/80">{text}</span>
            </div>
          ))}
        </div>

        {/* Login Buttons */}
        <div className="space-y-3">
          {/* Google */}
          <button
            type="button"
            onClick={() => openModal("google")}
            className="w-full h-12 rounded-xl font-semibold text-sm text-gray-800 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-md"
            data-ocid="login.google.primary_button"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <title>Google</title>
              <path
                fill="#4285F4"
                d="M43.611 20.083H42V20H24v8h11.303C33.948 32.657 29.418 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
              />
              <path
                fill="#34A853"
                d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
              />
              <path
                fill="#FBBC05"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.395 0-9.91-3.31-11.291-7.935l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
              />
              <path
                fill="#EA4335"
                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C42.012 35.245 44 30 44 24c0-1.341-.138-2.65-.389-3.917z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={() => openModal("facebook")}
            className="w-full h-12 rounded-xl font-semibold text-sm text-white bg-[#1877F2] hover:bg-[#166FE5] transition-all flex items-center justify-center gap-3 shadow-md"
            data-ocid="login.facebook.primary_button"
          >
            <SiFacebook className="w-5 h-5" />
            Continue with Facebook
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/15" />
            <span className="text-xs text-white/40 font-medium">or</span>
            <div className="flex-1 h-px bg-white/15" />
          </div>

          {/* Guest */}
          <button
            type="button"
            onClick={handleGuest}
            className="w-full h-12 rounded-xl font-semibold text-sm text-white/80 border border-white/25 bg-white/5 hover:bg-white/12 transition-all flex items-center justify-center gap-3"
            data-ocid="login.guest.secondary_button"
          >
            <User className="w-4 h-4" />
            Continue as Guest
          </button>
        </div>

        <p className="text-center text-xs text-white/35">
          Sign in to save your progress and view achievements
        </p>
      </div>

      {/* Credits */}
      <div className="mt-8 text-center space-y-1">
        <p className="text-xs text-white/35">
          Developed by{" "}
          <span className="text-white/60 font-medium">Khushal Vyas</span> &amp;{" "}
          <span className="text-white/60 font-medium">Amman Manwani</span>
        </p>
        <p className="text-xs text-white/25">
          Satguru International School, Ajmer
        </p>
      </div>

      {/* Provider Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
          }}
          data-ocid="login.modal"
        >
          <div className="w-full max-w-sm bg-white/10 backdrop-blur-2xl border border-white/25 rounded-2xl p-7 shadow-2xl shadow-black/50 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isGoogle ? (
                  <svg width="22" height="22" viewBox="0 0 48 48">
                    <title>Google</title>
                    <path
                      fill="#4285F4"
                      d="M43.611 20.083H42V20H24v8h11.303C33.948 32.657 29.418 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                    />
                    <path
                      fill="#34A853"
                      d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.395 0-9.91-3.31-11.291-7.935l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                    />
                    <path
                      fill="#EA4335"
                      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C42.012 35.245 44 30 44 24c0-1.341-.138-2.65-.389-3.917z"
                    />
                  </svg>
                ) : (
                  <SiFacebook
                    className="w-5 h-5"
                    style={{ color: modalAccent }}
                  />
                )}
                <h2 className="text-base font-bold text-white">
                  Sign in with {modalLabel}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-white/40 hover:text-white transition-colors"
                data-ocid="login.close_button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-white/50">
              Enter your {modalLabel} account details to continue.
            </p>

            {error && (
              <div
                className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2"
                data-ocid="login.error_state"
              >
                <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="modal-name"
                  className="text-xs font-semibold text-black uppercase tracking-wide"
                >
                  Full Name
                </label>
                <input
                  id="modal-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full h-10 px-3 rounded-lg bg-white/8 border border-white/20 text-black placeholder-black/40 text-sm focus:outline-none focus:border-white/40 transition-colors"
                  data-ocid="login.input"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="modal-email"
                  className="text-xs font-semibold text-black uppercase tracking-wide"
                >
                  Email Address
                </label>
                <input
                  id="modal-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full h-10 px-3 rounded-lg bg-white/8 border border-white/20 text-black placeholder-black/40 text-sm focus:outline-none focus:border-white/40 transition-colors"
                  data-ocid="login.input"
                  onKeyDown={(e) => e.key === "Enter" && handleProviderLogin()}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleProviderLogin}
              disabled={loading}
              className="w-full h-11 rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${modalAccent}, ${modalAccent}cc)`,
              }}
              data-ocid="login.confirm_button"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Signing in..." : `Sign in with ${modalLabel}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
