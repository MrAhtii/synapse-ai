# 🧠 Synapse AI

> **Turn your study material into an intelligent learning system.**

Synapse AI is an AI-powered adaptive learning platform built to help
students transform notes and study documents into an interactive
learning experience.

Instead of simply storing PDFs and notes, Synapse AI turns learning
material into **AI-generated summaries, flashcards, quizzes, progress
analytics, daily missions, XP, and learning streaks**---all inside one
focused workspace.

------------------------------------------------------------------------

## ✨ Why Synapse AI?

Traditional study tools usually separate reading, revision, testing, and
progress tracking.

Synapse AI brings those activities together into one learning loop:

``` text
📄 Upload Study Material
        ↓
🧠 Extract & Process Content
        ↓
✨ Google Gemini AI
        ↓
┌──────────────────────────────┐
│ Smart Summary                │
│ AI Flashcards                │
│ AI Quiz                      │
└──────────────────────────────┘
        ↓
📊 Track Learning Performance
        ↓
🎯 Daily Missions + XP + Streaks
        ↓
🔁 Identify Areas for Revision
```

The goal is simple: **make studying more active, measurable, and
engaging.**

------------------------------------------------------------------------

# 🚀 Features

## 🔐 1. Authentication & User Accounts

Synapse AI uses Supabase Authentication to provide a real user-based
learning experience.

-   Sign up / registration
-   Login
-   Password recovery
-   Password update flow
-   Persistent authentication sessions
-   Protected authenticated routes
-   Separate guest and authenticated experiences

The application also separates the experience into:

-   **Guest routes**
-   **Authenticated routes**
-   **Demo routes**

------------------------------------------------------------------------

## 📄 2. Smart Document Upload

Students can upload their study material and use it as the foundation
for their learning session.

### Supported workflow

-   Upload study documents
-   Extract text from PDF files
-   Store document information
-   Track document processing
-   Generate learning content from uploaded material

PDF processing is handled through the project's PDF utility layer.

------------------------------------------------------------------------

## ✨ 3. AI Smart Summary

Synapse AI uses **Google Gemini** to transform study material into a
structured summary.

The summary experience is designed to help students quickly understand:

-   Main concepts
-   Important information
-   Key points
-   Study-focused explanations

This reduces the time required to manually convert long notes into
revision material.

------------------------------------------------------------------------

## 🧠 4. AI-Generated Flashcards

Uploaded learning material can be converted into interactive flashcards.

Students can:

-   Review generated cards
-   Move through a study set
-   Track reviewed cards
-   Use flashcards as an active-recall workflow

Flashcard activity also contributes to the user's learning statistics
and XP system.

------------------------------------------------------------------------

## 📝 5. AI Quiz

Synapse AI generates quizzes from learning material using Gemini.

The quiz system supports:

-   AI-generated questions
-   Answer selection
-   Answer evaluation
-   Quiz completion tracking
-   Accuracy calculation
-   Best quiz score tracking
-   XP rewards

Quiz performance also feeds into the user's learning analytics.

------------------------------------------------------------------------

## 🎯 6. Daily Missions

The application includes a daily gamification system built around four
learning tasks:

  Mission                                XP
  ---------------------------- ------------
  Read Smart Summary                 +25 XP
  Complete Flashcards                +30 XP
  Finish AI Quiz                     +35 XP
  Review Weak Topics                 +20 XP
  **Daily completion bonus**     **+50 XP**

### Mission system

-   Tasks reset by day
-   Completion state is stored per user
-   Task completion updates the user's XP
-   Completing all daily tasks awards an additional bonus
-   Mission completion appears in the activity feed
-   Mission progress is displayed visually

The mission system is backed by Supabase rather than relying only on
browser state.

------------------------------------------------------------------------

## ⚡ 7. XP & Learning Streaks

Synapse AI uses gamification to encourage consistent learning.

XP can be earned through learning activities such as:

-   Completing quizzes
-   Reviewing flashcards
-   Generating summaries
-   Uploading documents
-   Recording study sessions
-   Completing daily mission tasks
-   Completing the daily mission

The application also maintains a **learning streak** based on activity
across learning days.

------------------------------------------------------------------------

## 📊 8. Learning Dashboard

The dashboard provides a central view of the student's learning
activity.

It can display metrics such as:

-   Documents uploaded
-   Flashcards reviewed
-   Quizzes completed
-   Study minutes
-   Learning accuracy
-   Daily mission progress
-   Current learning streak
-   XP
-   Summary generation count
-   Weekly goal progress
-   Best quiz score

The dashboard is connected to live Supabase data for authenticated
users.

------------------------------------------------------------------------

## 📈 9. Learning Analytics

The Analytics section provides a broader view of learning performance.

Current analytics include:

-   Overview statistics
-   Weekly learning activity
-   Study time
-   Quiz accuracy
-   Flashcard activity
-   Document activity
-   Learning streak
-   Recent learning activity
-   Learning insights

The application also provides an empty-state experience when a new
account has not generated enough learning activity yet.

------------------------------------------------------------------------

## 🔔 10. Notifications & Activity Feed

Synapse AI includes a notification and activity system for important
learning events.

Examples include:

-   Quiz completion
-   Flashcard activity
-   Summary generation
-   Document uploads
-   Mission completion

Activity events can be displayed as part of the user's learning history.

------------------------------------------------------------------------

## 🌗 11. Dark & Light Theme

The UI includes a theme system supporting:

-   Light mode
-   Dark mode
-   Theme persistence
-   Consistent styling across the application

------------------------------------------------------------------------

## 🧪 12. Demo Mode

Synapse AI includes a dedicated demo experience that does not require
authentication.

Demo routes allow users or judges to explore the product without
creating an account.

This is especially useful for:

-   Hackathon judging
-   Product demonstrations
-   UI previews
-   Testing the learning workflow

------------------------------------------------------------------------

# 🏗️ Tech Stack

  Layer                        Technology
  ---------------------------- --------------------------
  Frontend                     React
  Language                     TypeScript
  Build Tool                   Vite
  Styling                      Tailwind CSS
  Icons                        Lucide React
  Routing                      React Router
  AI                           Google Gemini API
  Backend                      Supabase
  Database                     PostgreSQL
  Authentication               Supabase Auth
  File Storage                 Supabase Storage
  Server-side Database Logic   PostgreSQL RPC / PLpgSQL
  PDF Processing               PDF utility layer
  Version Control              Git + GitHub
  Deployment                   Vercel

------------------------------------------------------------------------

# 🧩 Architecture

Synapse AI follows a frontend + Supabase + AI-service architecture.

``` text
                    ┌──────────────────┐
                    │      Student     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  React + Vite    │
                    │   TypeScript     │
                    └───────┬──────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
       ┌──────────┐   ┌───────────┐  ┌────────────┐
       │ Supabase │   │  Gemini   │  │ PDF Layer  │
       │ Auth/DB  │   │    AI     │  │ Extraction │
       └────┬─────┘   └─────┬─────┘  └─────┬──────┘
            │               │              │
            └───────────────┼──────────────┘
                            ▼
                    ┌──────────────────┐
                    │ Learning System  │
                    │                  │
                    │ Summary          │
                    │ Flashcards       │
                    │ Quiz             │
                    │ Missions         │
                    │ XP               │
                    │ Analytics        │
                    └──────────────────┘
```

------------------------------------------------------------------------

# 🗄️ Supabase Architecture

The project uses Supabase for authentication, persistent application
data, and database-side learning logic.

Important data areas include:

-   `user_stats`
-   `documents`
-   `daily_missions`
-   `learning_activity`
-   `notifications`
-   Activity logging

## `record_user_activity`

A central PostgreSQL RPC function processes learning events.

It receives an event payload and can update the appropriate user
statistics, including:

-   XP
-   Quiz count
-   Quiz accuracy
-   Best quiz score
-   Flashcard count
-   Study minutes
-   Summary count
-   Mission completion
-   Learning streak
-   Weekly goal progress

It also records relevant learning activity and activity-feed events.

This keeps important learning-stat calculations in the database instead
of relying entirely on client-side state.

------------------------------------------------------------------------

# 📁 Project Structure

``` text
synapse-ai/
│
├── public/
│   ├── favicon.ico
│   ├── site.webmanifest
│   └── application icons
│
├── src/
│   │
│   ├── components/
│   │   ├── Navbar
│   │   ├── Sidebar
│   │   ├── NotificationBell
│   │   ├── ProcessingScreen
│   │   └── ui/
│   │
│   ├── context/
│   │   ├── AuthContext
│   │   ├── DemoMode
│   │   └── ThemeContext
│   │
│   ├── hooks/
│   │   ├── useAnalytics
│   │   ├── useDailyMission
│   │   ├── useDashboardStats
│   │   ├── useDocuments
│   │   └── useNotifications
│   │
│   ├── layouts/
│   │   ├── GuestLayout
│   │   ├── AuthenticatedLayout
│   │   └── DemoLayout
│   │
│   ├── lib/
│   │   ├── gemini.ts
│   │   ├── supabase.ts
│   │   ├── pdf.ts
│   │   └── notifications.ts
│   │
│   ├── pages/
│   │   ├── Landing
│   │   ├── Login
│   │   ├── Register
│   │   ├── ForgotPassword
│   │   ├── UpdatePassword
│   │   ├── Dashboard
│   │   ├── Upload
│   │   ├── Workspace
│   │   ├── SmartSummary
│   │   ├── Quiz
│   │   ├── Flashcards
│   │   ├── Missions
│   │   ├── Analytics
│   │   ├── Profile
│   │   └── Settings
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

------------------------------------------------------------------------

# 🧭 Route Map

## Guest

``` text
/
├── /login
├── /register
├── /forgot-password
└── /update-password
```

## Authenticated

``` text
/dashboard
/upload
/workspace
/summary
/quiz
/flashcards
/profile
/missions
/analytics
/settings
```

## Demo

``` text
/demo
/demo/upload
/demo/workspace
/demo/summary
/demo/quiz
/demo/flashcards
/demo/profile
/demo/missions
/demo/analytics
/demo/settings
```

> The demo uses the `/demo/*` route namespace so it can be explored
> without authentication.

------------------------------------------------------------------------

# 🔄 Learning Event System

One of the important architectural pieces is the application's
event-driven statistics synchronization.

When a learning action occurs:

``` text
User Action
    ↓
recordUserActivity()
    ↓
Supabase RPC
    ↓
record_user_activity()
    ↓
Update user_stats
    ↓
Update learning_activity
    ↓
Write activity_log
    ↓
Dispatch stats-updated event
    ↓
React hooks refresh
    ↓
Dashboard / Analytics / Missions update
```

This allows different parts of the application to stay synchronized
without requiring every page to manually manage the same statistics.

------------------------------------------------------------------------

# 🔑 Environment Variables

Create a local `.env` file:

``` env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do **not** commit `.env` to GitHub.

The project `.gitignore` excludes local environment files.

### Important

Because Vite `VITE_*` variables are exposed to the browser bundle, only
use credentials that are intended for client-side use. Supabase Row
Level Security should protect database access, and highly privileged
secrets should never be placed in frontend environment variables.

------------------------------------------------------------------------

# 💻 Local Development

## 1. Clone the repository

``` bash
git clone https://github.com/MrAhtii/synapse-ai.git
cd synapse-ai
```

## 2. Install dependencies

``` bash
npm install
```

## 3. Configure environment variables

Create `.env` in the project root:

``` env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Start the development server

``` bash
npm run dev
```

Vite will provide a local development URL.

## 5. Create a production build

``` bash
npm run build
```

## 6. Preview the production build

``` bash
npm run preview
```

------------------------------------------------------------------------

# 🔒 Security Considerations

Synapse AI uses Supabase authentication and database policies to isolate
user data.

Important practices:

-   Keep `.env` out of Git
-   Never expose Supabase service-role keys in the frontend
-   Use Supabase Row Level Security for user-owned records
-   Keep privileged operations inside trusted server/database logic
-   Validate user activity before awarding rewards
-   Avoid trusting client-provided XP values for sensitive reward logic

The `record_user_activity` RPC is used to centralize important
learning-stat updates.

------------------------------------------------------------------------

# 🎮 Gamification Model

Synapse AI combines learning with lightweight game mechanics.

``` text
Learning Activity
      │
      ├── Quiz ───────────► XP + Accuracy
      │
      ├── Flashcards ─────► XP + Review Count
      │
      ├── Summary ────────► XP + Summary Count
      │
      ├── Study Session ──► XP + Study Time
      │
      └── Mission ────────► XP + Mission Progress
                                  │
                                  ▼
                           Daily Bonus XP
```

The intention is not to gamify studying for its own sake, but to
encourage **consistent active learning**.

------------------------------------------------------------------------

# 🎯 Hackathon Value Proposition

Synapse AI combines several capabilities that are normally spread across
different tools:

  Problem                           Synapse AI Solution
  --------------------------------- -------------------------------
  Long study notes                  AI Smart Summary
  Manual flashcard creation         AI Flashcards
  Manual quiz creation              AI Quiz
  No progress visibility            Learning Analytics
  Inconsistent studying             Daily Missions
  Low motivation                    XP + Streaks
  No personalized feedback          Learning performance insights
  Difficult product demonstration   Built-in Demo Mode

The result is a unified **AI-powered study companion** rather than a
simple AI text generator.

------------------------------------------------------------------------

# 🧪 Current Product Experience

The application currently provides three major experiences:

### 1. Landing / Guest Experience

Introduces the product and provides access to authentication and demo
functionality.

### 2. Authenticated Learning Experience

A persistent personal workspace where users can:

-   Upload learning material
-   Generate AI learning content
-   Study
-   Complete quizzes
-   Review flashcards
-   Complete missions
-   Earn XP
-   Track progress
-   Manage their profile and settings

### 3. Demo Experience

A preconfigured environment for quickly exploring the product without
authentication.

------------------------------------------------------------------------

# 🏆 Project Goal

Synapse AI is built around one principle:

> **The best study tool should not only help students consume
> information---it should help them understand, practice, measure, and
> improve.**

The platform turns a static document into a complete learning loop:

**Upload → Understand → Practice → Test → Analyze → Improve**

------------------------------------------------------------------------

# 👨‍💻 Built With

**Synapse AI** was built using *Native Builder* as the primary AI-assisted development platform and also using:

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   Supabase
-   PostgreSQL
-   Google Gemini
-   React Router
-   Lucide React
-   GitHub
-   Vercel

------------------------------------------------------------------------

## 📄 License

This project is currently developed as a hackathon/project application.

------------------------------------------------------------------------

## ⭐ Synapse AI

**Study smarter. Practice actively. Track your progress. Build
consistency.**
