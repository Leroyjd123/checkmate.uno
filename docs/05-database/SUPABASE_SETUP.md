# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: checkmate-uno
   - **Database Password**: Generate strong password (save it)
   - **Region**: Choose closest to your users
4. Wait for project to initialize (~2 min)

## Step 2: Get Connection String

1. In Supabase dashboard, go to **Settings** → **Database**
2. Under "Connection string", find the **Connection pooling** string
3. Copy the PostgreSQL connection string (starts with `postgresql://...`)
4. Replace `[YOUR-PASSWORD]` with the database password you created
5. Add `?sslmode=require` to the end if not already there

**Example format:**
```
postgresql://postgres:[password]@[host]:6543/postgres?sslmode=require
```

## Step 3: Configure Environment

1. Create `.env` file in the backend root:

```bash
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-super-secret-key-at-least-32-chars-long"

# Supabase (optional, if using direct auth)
SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Server
PORT=3000
NODE_ENV=development
```

2. Get Supabase API keys from **Settings** → **API**:
   - Copy `Project URL` → `SUPABASE_URL`
   - Copy `anon public` key → `SUPABASE_ANON_KEY`
   - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 4: Run Prisma Migrations

```bash
cd backend
npx prisma migrate dev --name init
```

This will:
1. Create tables from schema.prisma
2. Generate Prisma client
3. Create `migrations/` folder with SQL

## Verification

```bash
# Check database connection
npx prisma db execute --stdin < /dev/null

# Start backend
npm run start:dev
```

If no errors, database is ready!
