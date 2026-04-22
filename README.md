# SoulSync India Resilience Hub 🇮🇳
### **Empowering students through AI-driven peer support and autonomous resilience tools.**

SoulSync is a high-fidelity mental wellness ecosystem purpose-built for the **Google Solution Challenge 2026**. It bridges the gap between acute student distress and clinical intervention through a "Zero-Trace" anonymous pipeline, designed specifically for the academic and cultural context of Indian universities.

---

## 🌟 The Vision (SDG Alignment)
SoulSync aligns with **UN Sustainable Development Goal 3 (Good Health & Well-being)** and **Goal 17 (Partnerships for the Goals)**. 
- **SDG 3.4**: Promoting mental health and well-being through prevention and accessible peer support.
- **SDG 17**: Building a collaborative ecosystem between student volunteers, university administration, and professional Indian NGOs (e.g., Sangath, NIMHANS).

---

## 🛠️ The "Winner's Suite" (Interactive Resilience)
Our platform goes beyond static content with a modular suite of interactive tools designed to stop panic in its tracks:
- **🌬️ Breathing Visualizer**: Guided respiratory regulation for immediate nervous system stabilization.
- **🌍 Grounding Journey**: An interactive 5-4-3-2-1 sensory exercise to reconnect with the physical world.
- **⚖️ HALT Diagnostic**: A campus-focused tool providing recovery tips for "Hunger, Anger, Loneliness, or Tiredness."
- **📝 Reflection Pad**: A "Zero-Trace" ephemeral space for quick student thought offloading.

---

## 🏗️ Technical Architecture
### AI & ML Intelligence
- **Google Gemini 1.5 Flash**: Orchestrates compassionate dialogue and generates **Intelligent Handoff Briefings** for volunteers.
- **Perspective API**: A real-time safety layer ensuring all communications remain respectful and secure.

### High-Fidelity Frontend
- **React + TanStack Start**: Type-safe, high-performance routing and state management.
- **Framer Motion**: Premium emotional micro-animations and smooth transitions.
- **Data Visualization**: **Recharts** powered "Healing Curve" to visualize emotional progress.

### Governance & Privacy
- **Zero-Trace Identity**: A custom `useAnonymousIdentity` pipeline ensuring student privacy via local UUID persistence.
- **Supporter Command Center**: A CRM-style dashboard for volunteers with AI briefings and private continuity notes.
- **Verification Hub**: A master portal for managing volunteer credentials and platform integrity.

---

## 📊 Database Schema (Supabase)
The system uses Row Level Security (RLS) to protect anonymous identities:
- `student_profiles`: Anonymous alias tracking and AI memory context.
- `mood_entries`: Records of the student's emotional journey.
- `session_bookings`: Managed sessions with meeting tokens and AI-generated briefings.
- `volunteers`: Verified profile data and secure CV storage.

---

## 🚀 Setup & Installation
1. **Install**: `bun install`
2. **Environment**: Add `GEMINI_API_KEY` and `VITE_SUPABASE_URL` to `.env`.
3. **Launch**: `bun dev`

**SoulSync is built by a team dedicated to student resilience. We believe that no student should have to navigate their hardest days alone. Built for the Google Solution Challenge 2026.**
