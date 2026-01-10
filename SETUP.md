# Basketball Camp Management System - Environment Variables

## Supabase Configuration

1. Create a `.env.local` file in the root directory
2. Add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Getting Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to Project Settings > API
3. Copy the "Project URL" and "anon/public" key
4. Paste them into your `.env.local` file

## Running the Migrations

1. In your Supabase project dashboard, go to the SQL Editor
2. Run the migrations in order:
   - First: `supabase/migrations/001_initial_schema.sql`
   - Second: `supabase/migrations/002_rls_policies.sql`
