# SoulSync / Empathy Engine

> "You're not alone. We're here to listen."

A safe, anonymous, and AI-powered platform for emotional support, powered by Cognitive Behavioral Therapy (CBT) techniques, trained peer volunteers, and professional resources. 

## 🌟 Overview

Empathy Engine (SoulSync) is designed to provide immediate, judgment-free support to anyone navigating anxiety, stress, or everyday challenges. The platform requires **no sign-up**, ensuring 100% anonymity and privacy. It connects users seamlessly to either friendly AI-guided therapeutic support, human peer volunteers, or community resources based on their immediate needs.

## ✨ Key Features

- **🛡️ 100% Anonymous & Secure:** No accounts, no sign-ups. Your identity is always protected.
- **💬 AI-Guided & CBT-Based Chat:** Dynamic conversational interfaces delivering evidence-backed Cognitive Behavioral Therapy guidance. 
- **👥 Peer Matching:** Get matched instantly with trained peer volunteers for a real human connection when you need it most.
- **🧭 Mood Tracking & Check-ins:** Regularly assess and log your emotional state.
- **📚 Community Q&A & Resources:** Browse helpful articles, find professional resources, and connect over shared experiences securely.
- **🤝 Volunteer Portal:** Dedicated workflows for trained volunteers to join and support the community.

## 🛠️ Tech Stack

This project is built using a modern, scalable web stack:

**Frontend Ecosystem**
* **Framework:** [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
* **Routing:** [TanStack Router](https://tanstack.com/router/latest)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) for animations.
* **Component Library:** [Radix UI](https://www.radix-ui.com/) and [shadcn/ui](https://ui.shadcn.com/) (configured via `components.json`).
* **State Management / Data Fetching:** [TanStack React Query](https://tanstack.com/query/latest)
* **Form Handling & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
* **Icons:** [Lucide React](https://lucide.dev/)

**Backend & Infrastructure**
* **Database & Auth:** [Supabase](https://supabase.com/)
* **Deployment & Edge Computing:** Built for edge deployment, integrated with Cloudflare Workers via [Wrangler](https://developers.cloudflare.com/workers/wrangler/).

## 📂 Project Structure

```text
empathy-engine/
├── .tanstack/            # TanStack generated files
├── .wrangler/            # Cloudflare Wrangler specific configs
├── public/               # Static assets
├── src/                  # Main application source code
│   ├── components/       # Reusable UI components & sections
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Third-party integrations (Supabase etc.)
│   ├── lib/              # Utility functions and library wrappers
│   ├── routes/           # Application routes (pages) managed by TanStack Router
│   ├── utils/            # Helper functions
│   ├── styles.css        # Global CSS variables and Tailwind imports
│   └── router.tsx        # Main application router instance
├── supabase/             # Supabase configuration & migrations
├── package.json          # Project dependencies & scripts
├── vite.config.ts        # Vite build configuration
└── eslint.config.js      # Linting configuration
```

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
* Configuration for [Supabase](https://supabase.com/)

### 1. Clone & Install
Clone the repository, then navigate to the project root and install the necessary dependencies:

```bash
npm install
# or
bun install
```

### 2. Environment Variables

Create a `.env` file in the root directory based on the expected environment variables for Supabase and Cloudflare:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# ... add any other specific secrets required
```

### 3. Start the Development Server

```bash
npm run dev
# or
bun run dev
```

The app will typically run on `http://localhost:5173`.

### 4. Build for Production

To create an optimized production build:

```bash
npm run build
```

## 📦 Scripts

- `npm run dev`: Starts the local Vite development server.
- `npm run build`: Bundles the application for production deployment.
- `npm run build:dev`: Compiles a build explicitly intended for a staging/development environment.
- `npm run preview`: Bootstraps a local server to preview the production build.
- `npm run lint`: Analyzes the codebase for potential linting issues using ESLint.

## 🌐 Deployment 

This application uses the `vite-plugin-cloudflare` and is natively configured for edge deployment utilizing [Cloudflare Workers](https://workers.cloudflare.com/).

To deploy via Wrangler:
```bash
npx wrangler deploy
# Make sure your wrangler.jsonc is properly configured with your account ID.
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details or reach out to the repository owner.
