<div align="center">

<h1>LearnSphere AI</h1>

<p><strong>Your Personal AI Learning Companion</strong> — Learn smarter. Visualize better. Grow faster.</p>

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TanStack%20Start-Full--Stack-FF4154?logo=react&logoColor=white" alt="TanStack Start" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Framer%20Motion-Animations-0055FF?logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/AI%20Gateway-Gemini-4285F4?logo=google&logoColor=white" alt="AI" />
</p>

<p>A production-ready, AI-powered EdTech SaaS platform designed for modern learners.</p>

</div>

---

## What is LearnSphere AI?

LearnSphere AI is a premium, all-in-one AI-powered learning ecosystem that transforms how students and professionals acquire knowledge. Instead of juggling multiple apps for notes, quizzes, tutoring, and revision, LearnSphere brings everything into one beautifully designed, gamified workspace.

Built with **React 19**, **TanStack Start** (full-stack SSR/SSG), **Tailwind CSS v4**, **Supabase** (auth + Postgres), and frontier AI models via the **Lovable AI Gateway**, it delivers a Coursera-grade experience with Duolingo-level engagement.

---

## Key Features

### 1. AI Learning Studio
Generate structured, exam-grade study notes on any topic in seconds. Input a subject, difficulty level, and learning goal — the AI produces comprehensive, well-organized content with key concepts, examples, and summaries.

### 2. Smart Quiz Generator
Auto-generate multiple-choice questions, true/false statements, and fill-in-the-blank quizzes from any topic. Each answer comes with instant AI explanations so you learn from mistakes in real time.

### 3. AI Tutor
A conversational, context-aware tutoring system that remembers your previous questions and adapts explanations to your level. Supports markdown rendering for rich, readable responses.

### 4. Visual Learning Lab
Interactive visualizers for complex topics:
- **Data Structures**: Stack, Queue, Linked List, Sorting Algorithms
- **Physics**: Pendulum simulation
- **Chemistry**: Interactive Periodic Table
- **Astronomy**: Solar System explorer

### 5. Career Mentor
AI-driven career guidance that analyzes your skills, interests, and goals to generate personalized career roadmaps, skill-gap analysis, and actionable next steps.

### 6. Learning Roadmaps
Generate step-by-step, milestone-based learning paths for any skill or career track — from "Zero to Full-Stack Developer" to "Machine Learning Engineer."

### 7. Revision Center
On-demand revision tools including flashcards, one-page summaries, and exam-prep checklists tailored to your previously studied topics.

### 8. Gamified Dashboard
Track your entire learning journey with:
- **XP & Level System** — Earn XP for every quiz, note, and tutor session
- **Streak Tracker** — Maintain daily learning streaks
- **Subject Mastery Radar** — Visualize proficiency across topics
- **Weekly Progress Charts** — Area and bar charts powered by Recharts
- **Achievement Badges** — Unlock milestones as you progress

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, TanStack Router, TanStack Query |
| **Full-Stack Framework** | TanStack Start (SSR/SSG + Server Functions) |
| **Styling** | Tailwind CSS v4, CSS custom properties, Glassmorphism |
| **UI Components** | Radix UI primitives + shadcn/ui design system |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Backend / Auth** | Supabase (PostgreSQL + Row-Level Security + Auth) |
| **AI Engine** | Lovable AI Gateway (Gemini-class models via OpenAI-compatible API) |
| **Build Tool** | Vite 7 |
| **Package Manager** | Bun |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Landing Page │  │   Auth      │  │  Protected Routes   │ │
│  │  (Marketing)  │  │  (Sign Up)  │  │  (Dashboard, Learn) │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│         │                                         │          │
│         └─────────────────────────────────────────┘          │
│                         React 19 + TanStack Router           │
└─────────────────────────────────────────────────────────────┘
                              │
                    TanStack Server Functions
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Server / API Layer                      │
│  ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │  Notes AI  │ │ Quiz AI  │ │ Tutor AI │ │  Mentor AI  │ │
│  │  (learn)   │ │ (quiz)   │ │ (tutor)  │ │  (mentor)   │ │
│  └────────────┘ └──────────┘ └──────────┘ └─────────────┘ │
│                         │                                   │
│              Lovable AI Gateway (Gemini)                    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer (Supabase)                  │
│  ┌──────────┐ ┌─────────┐ ┌─────────────┐ ┌──────────────┐ │
│  │ profiles │ │  notes  │ │   quizzes   │ │ chat_sessions│ │
│  │  (users) │ │(AI gen) │ │  (results)  │ │  (tutor)     │ │
│  └──────────┘ └─────────┘ └─────────────┘ └──────────────┘ │
│  ┌──────────┐ ┌────────────┐ ┌──────────────┐ ┌─────────┐ │
│  │ roadmaps │ │mentor_results│ │ revision_items │ │achievements│ │
│  └──────────┘ └────────────┘ └──────────────┘ └─────────┘ │
│                                                             │
│              Row-Level Security (RLS) on all tables         │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (name, avatar, XP, level, streak) |
| `notes` | AI-generated study notes per user |
| `quizzes` | Quiz history with scores, topics, and difficulty |
| `chat_sessions` | AI Tutor conversation threads |
| `roadmaps` | Generated learning roadmaps |
| `mentor_results` | Career mentor analysis results |
| `revision_items` | Flashcards and revision content |
| `achievements` | Unlocked badges and milestones |

All tables have **Row-Level Security (RLS)** enabled — users can only access their own data. Supabase Auth handles authentication with email confirmation.

---

## Design System

- **Theme**: Dark SaaS with indigo → cyan → purple gradients
- **Surfaces**: Glassmorphism cards with `backdrop-blur`, subtle borders, and soft shadows
- **Typography**: Space Grotesk (display) + Inter (body)
- **Animations**: Framer Motion for page transitions, staggered entrances, and hover micro-interactions
- **Responsive**: Fully responsive from mobile to ultrawide desktop

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (or Node.js + npm)
- A Supabase project (or Lovable Cloud backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/learnsphere-ai.git
cd learnsphere-ai

# Install dependencies
bun install

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase and AI Gateway credentials
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
LOVABLE_API_KEY=your-lovable-ai-gateway-key
```

### Run Development Server

```bash
bun run dev
```

The app will be available at `http://localhost:5173`.

### Live Link

https://lovable.dev/preview/fJMyIeBb1qWtINqa5ztkbOxSe2OzfL0V

### Build for Production

```bash
bun run build
bun run preview
```

---

## Project Structure

```
learnsphere-ai/
├── public/                    # Static assets
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── visual-lab/        # Interactive visualizers
│   │   ├── GlassCard.tsx      # Glassmorphism card component
│   │   └── Navbar.tsx         # Top navigation
│   ├── lib/                   # Server functions & utilities
│   │   ├── learn.functions.ts # AI Learning Studio logic
│   │   ├── quiz.functions.ts  # Quiz generator logic
│   │   ├── tutor.functions.ts # AI Tutor logic
│   │   ├── mentor.functions.ts# Career mentor logic
│   │   ├── roadmap.functions.ts # Roadmap generator
│   │   ├── revision.functions.ts # Revision tools
│   │   ├── profile.functions.ts # User profile/stats
│   │   └── ai-gateway.server.ts # AI Gateway client
│   ├── routes/                # TanStack file-based routes
│   │   ├── index.tsx          # Landing page
│   │   ├── auth.tsx           # Authentication page
│   │   ├── __root.tsx         # Root layout
│   │   └── _authenticated/    # Protected routes
│   │       ├── dashboard.tsx
│   │       ├── learn.tsx
│   │       ├── quiz.tsx
│   │       ├── tutor.tsx
│   │       ├── visual-lab.tsx
│   │       ├── mentor.tsx
│   │       ├── roadmaps.tsx
│   │       ├── revision.tsx
│   │       └── profile.tsx
│   ├── integrations/          # Third-party integrations
│   │   └── supabase/          # Supabase client, auth, types
│   ├── styles.css             # Global styles & theme tokens
│   └── router.tsx             # TanStack Router config
├── supabase/
│   ├── migrations/            # Database migrations
│   └── config.toml            # Supabase local config
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Why This Stack?

| Choice | Reason |
|--------|--------|
| **TanStack Start** | True full-stack React — type-safe routes, server functions, SSR/SSG without a separate backend framework |
| **Supabase** | Open-source Firebase alternative — Postgres + Auth + RLS with zero backend boilerplate |
| **Lovable AI Gateway** | Access frontier models (Gemini) via OpenAI-compatible API with built-in rate handling and no API key management |
| **Tailwind CSS v4** | Native CSS `@import` theming, lightning-fast builds, no `tailwind.config.js` |
| **Framer Motion** | Declarative animations that feel premium without complex CSS keyframes |

---

## Roadmap

- [ ] **Collaborative Study Rooms** — Real-time group learning sessions
- [ ] **Spaced Repetition** — SM-2 algorithm for flashcard scheduling
- [ ] **Mobile App** — React Native companion app
- [ ] **Content Upload** — PDF/YouTube → AI-generated notes and quizzes
- [ ] **Leaderboards** — Global and friend-group XP rankings
- [ ] **Offline Mode** — PWA with service worker caching
- [ ] **Multi-language AI Tutor** — Support for 10+ languages

---

## License

MIT License — feel free to use this for your final year project, hackathon, or portfolio. Please provide attribution if you fork or build upon it.

---

## Acknowledgements

- Built with [Lovable](https://lovable.dev) — AI-assisted full-stack development
- UI primitives by [shadcn/ui](https://ui.shadcn.com)
- Icons by [Lucide](https://lucide.dev)
- Charts by [Recharts](https://recharts.org)

---

<div align="center">
  <p>Made with passion for learners everywhere.</p>
  <p><strong>LearnSphere AI</strong> — Learn smarter. Visualize better. Grow faster.</p>
</div>
