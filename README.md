# SoulSync Technical Showcase 🛠️ (Hackathon Submission)

A professional Mental Wellness Ecosystem built using Google Technology Stack.

## 1. Core Tech Stack
-   **AI & ML Layer**:
    -   **Google Gemini 2.5 Flash**: Dialogue, Intelligence Handoff Synthesis, and Post-Session Summarization.
    -   **Perspective API**: Real-time toxicity filtering for absolute safety.
    -   **Local RoBERTa Models**: Sentiment and emotion detection.
-   **Frontend Architecture**:
    -   **TanStack Start / Router**: Progressive, type-safe full-stack routing.
    -   **Framer Motion**: Premium emotional animations for high-fidelity UX.
    -   **Recharts**: Visualizing the "Healing Curve" and NGO impact stats.
-   **Backend & Identity**:
    -   **Supabase / Postgres**: RLS-secured autonomous data layer.
    -   **Custom Identity Hook**: `useAnonymousIdentity` for account-less persistence.

## 2. Global Identity & Anonymity
SoulSync protects students through a **Zero-Trace Identity Pipeline**:
-   **Alias ID**: UUID stored exclusively in `localStorage`.
-   **Database Linkage**: All records (moods, sessions, memory) are linked to the Alias UUID, ensuring no university or campus link to real identities.

## 3. Database Architecture (Supabase Schema)

### `student_profiles`
| Column | Type | Purpose |
| :--- | :--- | :--- |
| `alias_id` | UUID (PK) | Primary anonymous identifier |
| `memory_context` | TEXT | AI-synthesized bullet points of user history |
| `primary_volunteer_id`| UUID | Linked volunteer for continuity |

### `session_bookings` (The CRM Layer)
| Column | Type | Purpose |
| :--- | :--- | :--- |
| `handoff_briefing` | TEXT | Intelligent AI briefing for the volunteer |
| `ai_session_summary` | TEXT | Summary added after the session ends |
| `meeting_token` | TEXT | Random token for Jitsi rooms |
| `mood_before/after` | TEXT | 1-10 sentiment tracking for Impact Dashboard |

## 4. AI Server Functions (API Testing Payloads)
The following functions can be tested via the `/utils/chat.functions.ts` server entry points.

### `sendChatMessage` (Dialogue)
```json
{
  "messages": [{"role": "user", "content": "I'm overwhelmed by my thesis."}],
  "aliasId": "8f8e-..."
}
```

### `generateVolunteerBriefing` (Intelligent Handoff)
```json
{
  "chatReport": {
    "emotions": [{"label": "anxiety", "score": 0.9}],
    "summary": "Student is struggling with academic pressure."
  },
  "surveyAnswers": {
    "intensity": "High",
    "priority": "Shared Experience"
  }
}
```

## 5. Route Map
-   `/`: Landing Page (Movement Vision, Live Ticker, Impact Dashboard).
-   `/chat`: The AI Companion Interface (Infinite Memory Chat).
-   `/peer-match`: Anonymous Peer Matching (8-Question Psych Survey).
-   `/volunteer/dashboard`: Supporter Hub (AI Briefing access and Session Reporting).
-   `/admin/command-center`: **HQ Hub** (Reserved for 3 Super-Admins to oversee global metrics, manage volunteers, and audit briefings).
-   `/partners`: NGO Philanthropic Hub.

## 6. Admin Governance (3 Super-Admins)
We have implemented a dual-layer security model:
1.  **Peer Volunteers**: Verified individuals who handle student reports and sessions.
2.  **Super-Admins**: A group of exactly 3 authorized managers who govern the entire registry, verify CVs, and monitor platform performance in the **Command Center**.

## 7. Setup & Installation
1.  **Dependencies**: `bun install`
2.  **Environment**: Create `.env` with `GEMINI_API_KEY` and `VITE_SUPABASE_URL`.
3.  **Migrations**: Run SQL files in `/supabase/migrations/` (01_Master -> 03_Governance).
4.  **Dev Server**: `bun dev`

---
**Build for the Google Solution Challenge 2026**
