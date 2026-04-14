# MzansiBuilds

A platform for South African developers to **build in public**, share progress, collaborate, and celebrate completed projects.

Built for the **Derivco Code Skills Challenge**.

## Features

- **Account Management** - Sign up, log in, and manage your developer profile with skills, bio, and social links
- **Project Creation** - Create project entries with title, description, stage, tech stack, and support needed
- **Live Feed** - Real-time feed of community projects with auto-refresh, stage filtering, and engagement metrics
- **Comments & Collaboration** - Comment on projects and raise your hand to offer collaboration
- **Milestone Tracking** - Set and track project milestones with visual progress indicators
- **Celebration Wall** - Completed projects are showcased on a dedicated celebration page
- **Responsive Design** - Fully responsive with green, white, and black theme

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | SQLite via Prisma ORM |
| Auth | NextAuth.js (Credentials) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Aston-Raiden/Derivco-Assessment.git
cd Derivco-Assessment

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# (Optional) Seed with demo data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Accounts (after seeding)

| Email | Password |
|-------|----------|
| thabo@mzansibuilds.dev | demo123 |
| naledi@mzansibuilds.dev | demo123 |
| sipho@mzansibuilds.dev | demo123 |

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/               # Auth endpoints (NextAuth + register)
│   │   ├── projects/           # Projects CRUD, milestones, comments, collaboration
│   │   └── users/              # User profile endpoints
│   ├── celebration-wall/       # Celebration Wall page
│   ├── feed/                   # Live Feed page
│   ├── login/                  # Login page
│   ├── profile/                # Profile management page
│   ├── projects/
│   │   ├── new/                # New project form
│   │   └── [id]/               # Project detail page
│   ├── register/               # Registration page
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Landing page
├── components/
│   ├── Navbar.tsx              # Navigation bar
│   ├── ProjectCard.tsx         # Reusable project card component
│   └── Providers.tsx           # Session provider wrapper
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   └── prisma.ts               # Prisma client singleton
└── types/
    └── next-auth.d.ts          # NextAuth type extensions
```

## Architecture Decisions

- **Next.js App Router** - Server-side rendering, API routes, and file-based routing in one framework
- **SQLite + Prisma** - Zero-config database that's portable and requires no external services
- **JWT Sessions** - Stateless auth that scales horizontally without session storage
- **Component-based UI** - Reusable components (ProjectCard, Navbar) for consistency
