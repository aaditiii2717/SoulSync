<div align="center">
  <img src="https://via.placeholder.com/150x150.png?text=SoulSync+Logo" alt="SoulSync Logo" width="150" height="150" />
  
  #  SoulSync: India Resilience Hub 🇮🇳
  
  ### **Empowering students through AI-driven peer support and autonomous resilience tools.**

  [![Google Solution Challenge 2026](https://img.shields.io/badge/Google%20Solution%20Challenge-2026-4285F4?style=for-the-badge&logo=google)](https://developers.google.com/community/gdsc-solution-challenge)
  [![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Gemini API](https://img.shields.io/badge/Gemini%20API-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
  
  [**Watch Demo Video**](#) • [**Live Project**](#) • [**Pitch Deck**](#)
</div>

---

## 📖 Table of Contents
- [Inspiration](#-inspiration)
- [The Vision (SDG Alignment)](#-the-vision-sdg-alignment)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Google Cloud Integrations](#google-cloud-integrations)
- [Privacy & Governance](#-privacy--governance)
- [App Navigation](#️-app-navigation)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [What's Next](#-whats-next)
- [Team](#-team)

---

## Inspiration
In high-pressure academic environments, especially within Indian universities, students often face severe mental distress due to academic expectations, cultural stigma, and limited access to professional care. The tragic rise in student distress signals a gap between acute mental health crises and available support. **SoulSync** was born from the urgent need to bridge this gap, providing a "Zero-Trace", culturally sensitive, and highly accessible safety net.

## The Vision (SDG Alignment)
SoulSync is purpose-built for the **Google Solution Challenge 2026**, meticulously aligning with the United Nations Sustainable Development Goals:

*    **SDG 3: Good Health & Well-being (Target 3.4):** Promoting mental health through prevention, early intervention, and accessible peer-to-peer support networks.
*    **SDG 17: Partnerships for the Goals:** Fostering a collaborative ecosystem that unites student volunteers, university administrations, and professional Indian mental health NGOs (e.g., Sangath, NIMHANS).

## Key Features
SoulSync goes beyond a simple chat interface, offering a modular suite of interactive tools designed to stop panic in its tracks and foster long-term resilience:

### 1. The "Zero-Trace" Support Pipeline
*   **Absolute Anonymity:** A custom `useAnonymousIdentity` pipeline ensures student privacy via local UUID persistence—no emails, no phone numbers, no tracking.
*   **Empathetic Peer Matching:** Connects students with trained, verified student volunteers for real-time chat and support sessions.

### 2. AI-Powered "Supporter Command Center"
*   **Intelligent Handoff Briefings:** Uses Google Gemini to analyze past (anonymous) interactions and generate concise, actionable briefings for volunteers before a session begins, ensuring continuity of care.
*   **Perspective API Safety Layer:** Real-time sentiment and toxicity analysis to ensure all communications remain respectful, safe, and productive.

### 3. Interactive "Winner's Suite" Resilience Tools
*   **Breathing Visualizer:** Guided, interactive respiratory regulation (e.g., 4-7-8 breathing) for immediate nervous system stabilization.
*   **Grounding Journey:** An interactive 5-4-3-2-1 sensory exercise to help students reconnect with the physical world during moments of dissociation or panic.
*   **HALT Diagnostic:** A specialized, campus-focused tool providing actionable recovery tips for when a student is **H**ungry, **A**ngry, **L**onely, or **T**ired.
*   **Reflection Pad:** An ephemeral, "Zero-Trace" journaling space for quick emotional offloading.

### 4. Data-Driven "Healing Curve"
*   Beautiful, Recharts-powered visual dashboards allowing students to track their emotional progress and mood trends over time in a secure, private environment.

## Architecture & Tech Stack

SoulSync leverages a modern, scalable, and highly responsive technology stack to deliver a premium user experience:

*   **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
*   **Routing & State:** TanStack Router (Type-safe routing), React Query
*   **UI/UX & Animations:** Framer Motion (Premium emotional micro-animations), Lucide React (Icons)
*   **Backend & Database:** Supabase (PostgreSQL, Auth, Storage), Row Level Security (RLS)

### Google Cloud Integrations
*   **Google Gemini 1.5 Pro/Flash:** Powers the core contextual engine for dialogue understanding and generating volunteer briefings.
*   **Google Perspective API:** Acts as the primary safety net, automatically flagging toxic or distressed language for immediate clinical escalation.
*   *(Planned)* **Google Cloud Run:** For scalable deployment of microservices.

##  Privacy & Governance

### Database Schema & Security
The entire system architecture is built around "Privacy by Design", utilizing Supabase's powerful Row Level Security (RLS) to protect sensitive data:
*   `student_profiles`: Anonymous alias tracking, protected from volunteer access; used strictly for AI memory context.
*   `mood_entries`: Encrypted records of the student's emotional journey.
*   `session_bookings`: Managed support sessions with secure meeting tokens.
*   `volunteers`: A verified registry of student supporters with secure credential/CV storage.

### Verification Hub
A master administrative portal for university counselors to manage volunteer onboarding, verify credentials, and monitor platform integrity without compromising student anonymity.

## App Navigation
To help you evaluate SoulSync quickly, here are the key routes you should visit:

**For Students:**
*   `/` - Landing Page (Hero, Value Proposition, SDG Alignment)
*   `/check-in` - Daily Check-in & HALT Diagnostic
*   `/mood-tracker` - Emotional Healing Curve & Mood History
*   `/peer-match` - Connect securely with an anonymous volunteer
*   `/chat` - Real-time support chat interface
*   `/resources` - Interactive Resilience Tools (Breathing, Grounding, Reflection)
*   `/community-qna` - Anonymous Community Q&A
*   `/partners` - NGO Partners & Collaborators

**For Volunteers & Admins:**
*   `/volunteer` - Volunteer Onboarding / Verification
*   `/volunteer/dashboard` - Volunteer CRM, AI Command Center & Handoff Briefings
*   `/admin` - Admin Portal
*   `/admin/volunteers` - Volunteer Verification & Governance Hub
*   `/admin/command-center` - System-wide crisis overview

## Project Structure

```text
soulsync/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── admin/        # Admin dashboard components
│   │   ├── resilience-tools/ # Breathing, Grounding, Reflection tools
│   │   ├── ui/           # Base UI elements (Tailwind/Radix)
│   │   └── volunteer/    # Volunteer CRM components
│   ├── routes/           # TanStack file-based routing
│   │   ├── admin/        # Admin panel pages
│   │   ├── api/          # Server-side API endpoints
│   │   └── volunteer/    # Volunteer dashboard pages
│   ├── integrations/     # Supabase client setup
│   ├── hooks/            # Custom React hooks (e.g., useAnonymousIdentity)
│   ├── lib/              # Utility functions
│   └── styles.css        # Global Tailwind CSS
├── supabase/
│   └── migrations/       # SQL schemas and RLS policies
├── package.json          # Project dependencies
└── vite.config.ts        # Vite configuration
```

##  Setup & Installation

Follow these steps to run SoulSync locally:

### Prerequisites
*   [Bun](https://bun.sh/) (or Node.js/npm)
*   A [Supabase](https://supabase.com/) Project
*   A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/soulsync.git
    cd soulsync
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add the following:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    GEMINI_API_KEY=your_gemini_api_key
    ```

4.  **Database Setup:**
    Execute the SQL migration scripts located in the `/supabase/migrations` folder against your Supabase project to build the necessary schemas and RLS policies.

5.  **Run the development server:**
    ```bash
    bun run dev
    ```

## What's Next
*   **Multilingual Support:** Expanding the platform to support regional Indian languages using Google Cloud Translation API.
*   **Crisis Escalation Pipeline:** Direct API integrations with national suicide prevention lifelines for seamless emergency routing.
*   **Wearable Integration:** Syncing physiological data (e.g., heart rate variability) to preemptively suggest resilience tools.

## Team
*   **Aadit** - Full Stack Developer & UI/UX Designer
*   *(Add other team members here)*

---
<div align="center">
  <b>Built with for student resilience. Because no student should have to navigate their hardest days alone.</b>
</div>
