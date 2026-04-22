# SoulSync India Resilience Hub 🇮🇳
**Empowering students through AI-driven peer support and autonomous resilience tools.**

SoulSync is a high-fidelity mental wellness platform purpose-built for the Google Solution Challenge 2026. It bridges the gap between clinical intervention and student isolation through a "Zero-Trace" anonymous ecosystem.

## 🌟 The Vision
SoulSync aligns with **UN Sustainable Development Goal 3 (Good Health & Well-being)** and **Goal 17 (Partnerships for the Goals)**. 
By centralizing regional NGOs and university-peer networks, we provide a scalable, high-integrity support hub for Indian campuses.

---

## 🛠️ The "Winner's Suite" (Interactive Features)
Our platform goes beyond static content with a modular suite of interactive resilience tools:
-   **🌬️ Breathing Visualizer**: Guided respiratory regulation for immediate panic relief.
-   **🌍 Grounding Journey**: Interactive 5-4-3-2-1 sensory exercises.
-   **⚖️ HALT Diagnostic**: Critical self-checker for physical/emotional triggers.
-   **📝 Reflection Pad**: Anonymous, ephemeral thought offloading.

---

## 🏗️ Technical Architecture
### AI & ML Intelligence
-   **Google Gemini 2.5 Flash**: Orchestrates the "Dialogue Context" and generates **Intelligent Handoff Briefings** for volunteers.
-   **Perspective API**: Real-time safety layer for all student-volunteer communications.

### High-Fidelity Frontend
-   **React + TanStack Start**: Type-safe, high-performance routing.
-   **Framer Motion**: Premium emotional micro-animations and transitions.
-   **Zero-Trace Identity**: `useAnonymousIdentity` hook ensures student privacy through local UUID persistence.

### Governance Core
-   **Supporter Command Center**: A CRM-style dashboard for volunteers featuring student mood timelines, AI briefings, and private continuity notes.
-   **Admin Verification Hub**: A master portal for managing volunteer CVs and platform integrity.

---

## 📊 Database Schema (Supabase)
The system uses Row Level Security (RLS) to protect anonymous identities:
-   `student_profiles`: Anonymous alias tracking and AI memory context.
-   `mood_entries`: Records of the student's "Healing Curve".
-   `session_bookings`: Managed sessions with meeting tokens (Jitsi integration).
-   `volunteers`: Profile data, CV storage, and verification status.

---

## 🚀 Getting Started
1.  **Install**: `bun install`
2.  **Config**: Set `GEMINI_API_KEY` and `VITE_SUPABASE_URL` in `.env`.
3.  **Deploy**: The platform is ready for Vercel/Netlify deployment with localized Indian NGO data centralized in `src/constants/partners.ts`.

---
**Dedicated to the students of India. Built for the Google Solution Challenge 2026.**
