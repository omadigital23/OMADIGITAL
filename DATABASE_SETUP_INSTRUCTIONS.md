# Database Setup Instructions for OMA Digital

This document provides instructions for setting up your new Supabase database with all required tables and data.

## Files Provided

1. **`.env.local`** - Contains all your new Supabase credentials and API keys
2. **`ALL_REQUIRED_TABLES.sql`** - Single SQL file with all required tables and initial data
3. **`apply-all-migrations-to-new-instance.js`** - Script to apply all migrations programmatically
4. **`verify-supabase-connection.js`** - Script to verify the connection to your new Supabase instance

## Setup Options

### Option 1: Using the Supabase Dashboard (Recommended)

1. **Access your Supabase project:**
   - Go to https://app.supabase.com/project/pcedyohixahtfogfdlig
   - Navigate to the SQL Editor

2. **Enable the vector extension:**
   - In the SQL Editor, run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. **Create all tables:**
   - Copy the entire content of `ALL_REQUIRED_TABLES.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

### Option 2: Using the Supabase CLI

1. **Install the Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Link to your project:**
   ```bash
   npx supabase link --project-ref pcedyohixahtfogfdlig
   ```

3. **Apply migrations:**
   ```bash
   npx supabase migration up
   ```

### Option 3: Using the Node.js Script

1. **Run the migration script:**
   ```bash
   node apply-all-migrations-to-new-instance.js
   ```

## Post-Setup Steps

After creating the tables, you should:

1. **Populate the knowledge base with initial content:**
   ```bash
   node populate-knowledge-base.js
   ```

2. **Create an admin user:**
   ```bash
   node create-admin-user.js
   ```

3. **Verify the connection:**
   ```bash
   node verify-supabase-connection.js
   ```

## Environment Variables

Your `.env.local` file contains all the necessary credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=[REDACTED]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[REDACTED]
SUPABASE_SERVICE_ROLE_KEY=[REDACTED]

# Deepgram API key
DEEPGRAM_API_KEY=[REDACTED]

# Google AI Studio API key
GOOGLE_AI_API_KEY=[REDACTED]
```

## Troubleshooting

### If you encounter permission errors:

1. Make sure you're using the service role key for administrative tasks
2. Check that your Supabase project has the necessary extensions enabled

### If tables already exist:

The SQL scripts use `IF NOT EXISTS` clauses, so running them multiple times is safe.

### If you need to reset the database:

```bash
npx supabase migration reset
npx supabase migration up
```

## Testing the Setup

After completing the setup, verify everything works:

```bash
node verify-supabase-connection.js
```

This should show a successful connection to your Supabase instance.

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Vector Extension Documentation](https://supabase.com/docs/guides/database/extensions/vector)

## Support

For issues with the database setup, contact:
- Email: omasenegal25@gmail.com
- WhatsApp: +212701193811