# World Cup Predictor 2026

A Next.js + Supabase prediction platform for the 2026 FIFA World Cup. Users can register, submit match predictions, join private leagues, and compete on leaderboards.

## Features

- **User Authentication**: Email/password + magic link via Supabase Auth
- **Match Predictions**: Predict scores for World Cup matches
- **Scoring System**: 3 points for exact scores, 1 point for correct results
- **Leaderboards**: Global and league-specific rankings
- **Mini Leagues**: Create private leagues and compete with friends
- **Admin Panel**: Manage matches, enter results, lock predictions

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- npm or yarn

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned

### 2. Run Database Migration

1. Go to the Supabase dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/001_initial.sql`
3. Run the SQL to create all tables, policies, and triggers

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_SECRET=your_secure_random_string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

To find these values:
- **SUPABASE_URL**: Project Settings → API → Project URL
- **SUPABASE_ANON_KEY**: Project Settings → API → anon public key
- **ADMIN_SECRET**: Generate a secure random string (e.g., `openssl rand -base64 32`)

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
# Create a GitHub repo and push
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Import your GitHub repository
3. Add the environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_SECRET`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel domain)
4. Deploy

## Admin Access

To access the admin panel:

1. Navigate to `/admin`
2. Enter the `ADMIN_SECRET` value you set in your environment variables

Admin features:
- Add new matches with teams, flags, groups, and kickoff times
- Enter match results (triggers scoring)
- Lock/unlock predictions for matches

## Project Structure

```
world-cup-predictor/
├── supabase/
│   └── migrations/
│       └── 001_initial.sql    # Database schema
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   ├── middleware.ts      # Auth protection
│   │   ├── auth/
│   │   │   ├── login/         # Login page
│   │   │   ├── signup/        # Signup page
│   │   │   ├── callback/      # Auth callback
│   │   │   └── logout/        # Logout action
│   │   ├── dashboard/         # User dashboard
│   │   ├── fixtures/          # Match predictions
│   │   ├── leaderboard/       # Global rankings
│   │   ├── leagues/           # Mini leagues
│   │   ├── admin/             # Admin panel
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── lib/
│   │   └── supabase/          # Supabase clients
│   └── types/                 # TypeScript types
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Scoring Logic

- **Exact score**: 3 points
- **Correct result** (home win/draw/away win): 1 point
- **Wrong**: 0 points

When an admin enters a match result, the scoring function automatically calculates and awards points to all users who predicted that match.

## Database Schema

- **profiles**: User profiles linked to auth.users
- **matches**: World Cup matches with teams, scores, kickoff times
- **predictions**: User predictions per match
- **leagues**: Private prediction leagues
- **league_members**: League memberships
- **bonus_predictions**: Special predictions (future feature)

## License

MIT