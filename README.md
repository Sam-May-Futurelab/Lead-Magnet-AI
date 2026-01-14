# 🧲 Lead Magnet AI

Create high-converting lead magnets in seconds with AI. Built with the same tech stack as Inkfluence AI for iOS.

## 🏗️ Tech Stack

**Frontend:** React 19, TypeScript, Tailwind CSS, Vite, Radix UI, Framer Motion

**Backend:** Firebase (Auth, Firestore), Vercel Serverless Functions, OpenAI GPT-4

**Mobile:** Capacitor (iOS/Android)

---

## 📁 Project Structure

```
├── api/                    # Vercel serverless functions
│   └── generate.ts         # AI content generation endpoint
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # Base UI components (Shadcn-style)
│   │   ├── Header.tsx     # App header with navigation
│   │   ├── HomePage.tsx   # Landing page
│   │   ├── CreatePage.tsx # Lead magnet creation flow
│   │   ├── DashboardPage.tsx # User's lead magnets
│   │   └── AuthModal.tsx  # Sign-in modal
│   ├── hooks/             # Custom React hooks
│   │   ├── use-auth.tsx   # Firebase auth hook
│   │   └── use-theme.ts   # Theme management
│   ├── stores/            # Zustand state stores
│   │   └── lead-magnet-store.ts
│   ├── lib/               # Utilities and services
│   │   ├── firebase.ts    # Firebase config & operations
│   │   ├── ai-service.ts  # AI generation service
│   │   ├── types.ts       # TypeScript types
│   │   ├── templates.ts   # Lead magnet templates
│   │   ├── haptics.ts     # iOS haptic feedback
│   │   └── utils.ts       # Utility functions
│   └── styles/
│       └── globals.css    # Tailwind + custom styles
├── ios/                   # iOS native project (after cap add ios)
├── capacitor.config.ts    # Capacitor configuration
└── vercel.json           # Vercel deployment config
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# OpenAI
VITE_OPENAI_API_KEY=sk-your-key

# Firebase (get from Firebase Console)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# API URL (your Vercel deployment URL in production)
VITE_API_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for iOS

```bash
# Install Capacitor iOS
npx cap add ios

# Build and sync
npm run ios:dev

# Open in Xcode
npm run ios
```

---

## 📊 Data Models

### LeadMagnet vs EbookProject (Inkfluence)

| LeadMagnet (this app) | EbookProject (Inkfluence) |
|-----------------------|---------------------------|
| Single content block | Multiple chapters |
| 7 format types | Ebook-focused |
| Quick generation (< 60s) | Long-form content |
| Simple PDF export | PDF, EPUB, DOCX |
| Focus: Email list growth | Focus: Publishing |

### Lead Magnet Types

1. **Checklist** - Step-by-step actionable items
2. **Cheat Sheet** - Quick reference guide
3. **Guide** - Short educational content
4. **Template** - Fill-in-the-blank
5. **Swipe File** - Copy-paste examples
6. **Resource List** - Curated tools/resources
7. **Worksheet** - Interactive exercises

---

## 🔌 API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/generate` | POST | Generate lead magnet content |

### Generate Request

```typescript
{
  type: 'checklist' | 'cheatsheet' | 'guide' | 'template' | 'swipefile' | 'resourcelist' | 'worksheet',
  title: string,
  prompt: string,
  targetAudience?: string,
  niche?: string,
  tone: 'professional' | 'friendly' | 'educational' | 'persuasive',
  length: 'short' | 'standard' | 'detailed',
  itemCount?: number
}
```

### Generate Response

```typescript
{
  success: boolean,
  content: string,      // HTML content
  rawContent: string,   // Plain text
  wordCount: number,
  itemCount?: number
}
```

---

## 💰 Subscription Tiers

| Feature | Free | Pro | Premium |
|---------|------|-----|---------|
| Daily Generations | 3 | 15 | 50 |
| Max Lead Magnets | 5 | 50 | Unlimited |
| Export Formats | PDF | PDF, PNG | All |
| Premium Templates | ❌ | ✅ | ✅ |
| Custom Branding | ❌ | ✅ | ✅ |
| Remove Watermark | ❌ | ✅ | ✅ |

---

## 🛠️ Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### iOS App Store

1. Build with `npm run ios`
2. Configure signing in Xcode
3. Archive and upload to App Store Connect

---

## 🔗 Comparison to Inkfluence AI

This is a **complementary product**, not a replacement:

- **Inkfluence AI**: Full ebook creation platform
- **Lead Magnet AI**: Quick lead magnet generator

**Use Case Flow:**
1. User creates lead magnet → captures emails
2. Nurtures list with content
3. Upgrades to Inkfluence to create full ebook
4. Sells ebook to email list

---

## 📄 License

MIT License - Feel free to use as a boilerplate for your own projects.
