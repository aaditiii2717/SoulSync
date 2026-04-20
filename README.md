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
| `recovery_hash` | TEXT | Optional hash for identity recovery |

### `mood_entries`
| Column | Type | Purpose |
| :--- | :--- | :--- |
| `alias_id` | UUID (FK) | Link to student identity |
| `mood` | TEXT | The recorded emotion (great, good, etc.) |
| `note` | TEXT | Quick journal entries for the "Healing Curve" |

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
-   `/check-in`: Quick Mood Check-In & Healing Curve Visualization.
-   `/mood-tracker`: Detailed Mood Journal & Emotional History.
-   `/chat`: The AI Companion Interface (Multilingual Indian context support).
-   `/peer-match`: Anonymous Peer Matching (8-Question Psych Survey).
-   `/volunteer`: Volunteer Onboarding (CV Upload & Profile setup).
-   `/admin`: **Master Control Login** (Dedicated entry for SoulSync Team).
-   `/admin/volunteers`: **Verification Hub** (CV Review & Application Approval).
-   `/partners`: NGO Philanthropic Hub & Donation Gateway.

## 6. Project Highlights (Hackathon Ready)
-   **True Persistence**: High-integrity anonymous mood data saved to Supabase (Zero-Trace).
-   **Verification Workflow**: Multi-stage volunteer onboarding with CV storage and Admin approval.
-   **Multilingual AI**: Real-time switching between English, Hindi, and Hinglish.
-   **Governance Core**: Dedicated supervision portal for platform administrators.

## 7. Admin Credentials
The following admins are authorized in the database:
- `aaditishrivastava17@gmail.com`
- `aniket.aniket07sah@gmail.com`
- `varadprabhu2442@gmail.com`

## 8. Setup & Installation
1.  **Dependencies**: `bun install`
2.  **Environment**: Create `.env` with `GEMINI_API_KEY` and `VITE_SUPABASE_URL`.
3.  **Storage**: Create a **Public** bucket named `volunteers-cvs` in Supabase.
4.  **Migrations**: Run SQL files in `/supabase/migrations/` (Run `20260420_mood_entries.sql` for the core schema).
5.  **Dev Server**: `bun dev`

---
**Build for the Google Solution Challenge 2026**
