# 🏀 Basketball Camp Management System

A full-stack web application for managing basketball camps, tracking player statistics, and monitoring player development. Built with Next.js, Tailwind CSS, and Supabase.

## Features

### For Students
- 📝 Enroll in basketball camps
- 📊 View performance statistics (points, rebounds, assists, steals, blocks)
- 📈 Track progress with coach evaluations and feedback

### For Coaches
- 🏕️ Full CRUD management of camps
- 👥 View and manage enrolled students
- 🏀 Create games and track player statistics
- 📋 Create training sessions and evaluate players
- ✏️ Edit and delete all data

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend & Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with role-based access
- **Security**: Row Level Security (RLS) policies

## Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd BasketballCampMS
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from **Project Settings > API**
3. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Migrations

In your Supabase dashboard's SQL Editor, run these migrations in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` 🚀

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication page
│   ├── student/           # Student features
│   └── coach/             # Coach features
├── components/
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
├── lib/
│   ├── supabase/          # Supabase client configuration
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
└── supabase/
    └── migrations/        # Database schema & RLS policies
```

## Database Schema

- **profiles**: User information with roles (student/coach)
- **camps**: Basketball camp details
- **enrollments**: Student-camp relationships
- **games**: Game records
- **game_stats**: Individual player statistics per game
- **training_sessions**: Training session records
- **evaluations**: Coach evaluations of student performance

## Security

- Row Level Security (RLS) policies ensure:
  - Students can only view their own data
  - Coaches have full access to all data
  - Automatic authorization at the database level

## Documentation

- 📖 [Complete Walkthrough](./walkthrough.md) - Detailed features and testing guide
- 🛠️ [Setup Guide](./SETUP.md) - Configuration instructions

## Contributing

Contributions are welcome! Please read the contributing guidelines first.

## License

This project is licensed under the MIT License.

---

Built with ❤️ using Next.js and Supabase
