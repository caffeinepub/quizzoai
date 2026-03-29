# QuizzoAI

## Current State
Fresh rebuild — no existing source files.

## Requested Changes (Diff)

### Add
- Full QuizzoAI app rebuilt from scratch for exhibition
- Login screen with cosmic glassmorphism design (Google, Facebook, Guest buttons using Internet Identity)
- Setup screen: Class (6–12), Board (CBSE/RBSE/ICSE/Other), Book, Chapter dropdowns, number of questions (1–30), marks type (1/2/5 marks), optional OpenAI API key setting
- Test screen: all questions shown at once, MCQ radio buttons, short/long text areas, sticky timer bar, question navigation sidebar, Submit button
- Result screen: score, correct answers, percentage, performance feedback, Show Correct Answers toggle, redirect to https://study-buddy-AIr--rockyy123321.replit.app in new tab if score < 70% with 3-second countdown and "Go now →" link
- KHUSHALAI floating AI assistant chat panel (keyword-based, no heavy APIs)
- Profile page: rank, streaks, stats, achievements
- Achievements system (signed-in users only): badges plastic→grandmaster, daily/lesson streaks
- "NO.1 STUDY TOOL" watermark on every screen (large, translucent)
- Credits footer: Khushal Vyas & Amman Manwani, Satguru International School, Ajmer
- Feedback button linking to Gmail (khushalvyas249@gmail.com)
- localStorage for test history
- Wikipedia API for question content: https://en.wikipedia.org/api/rest_v1/page/summary/{chapter}
- GPT-4 question generation when OpenAI key provided
- Reliable fallback question generator when Wikipedia content is sparse
- Full NCERT chapter lists for CBSE boards

### Modify
- Nothing (fresh rebuild)

### Remove
- Nothing

## Implementation Plan
1. Build LoginScreen component with Internet Identity auth (Google/Facebook/Guest simulate login, centralize auth state in App)
2. Build SetupScreen with all dropdowns and settings
3. Build robust question generator: Wikipedia fetch → parse → generate MCQ/short/long questions with reliable fallback
4. Build TestScreen with timer, navigation sidebar, submit logic
5. Build ResultScreen with score display and Study Buddy redirect
6. Build ProfileScreen with achievements and stats
7. Build KHUSHALAI floating chat assistant
8. App-level: watermark, credits, feedback button, logout on all screens
9. Soft blue-to-indigo gradient background with radial glows throughout
