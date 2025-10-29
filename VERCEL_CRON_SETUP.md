# Vercel Cron Jobs Setup for Supabase Free Tier

This setup keeps your Supabase free project active by pinging the database daily, preventing the 1-week inactivity pause.

## What's Been Set Up

### 1. Health Check API Endpoint
**File:** `api/health.js`

- Lightweight serverless function that queries your Supabase DB
- Returns `200` if DB is healthy, `503` if not
- Includes optional cron secret verification for security
- Logs timestamp with each ping

### 2. Vercel Cron Configuration
**File:** `vercel.json`

- Cron job scheduled to run daily at **midnight UTC** (`0 0 * * *`)
- Hits `/api/health` endpoint automatically
- Free on Vercel's Hobby tier

## Deployment Steps

### Step 1: Set Environment Variables in Vercel

Your cron job needs access to Supabase credentials. In Vercel Dashboard:

1. Go to **Your Project** → **Settings** → **Environment Variables**
2. Add these variables (copy from your `.env` file):
   - `REACT_APP_SUPABASE_URL` = Your Supabase project URL
   - `REACT_APP_SUPABASE_ANON_KEY` = Your Supabase anon key
3. **(Optional but recommended)** Add `CRON_SECRET` = Any random string for security

**Important:** Make sure these are set for **Production**, **Preview**, and **Development** environments.

### Step 2: Deploy to Vercel
```bash
git add .
git commit -m "Add Vercel cron job for Supabase health check"
git push
```

Vercel will auto-deploy if you have GitHub integration enabled.

### Step 3: Verify Cron Job Setup

1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Cron Jobs**
2. You should see:
   - **Path:** `/api/health`
   - **Schedule:** `0 0 * * *` (daily at midnight UTC)
   - **Status:** Active

### Step 4: Test the Cron Job

#### Manual Test from Vercel Dashboard:
1. In **Cron Jobs** settings, click **Run** next to your cron job
2. Check the **Logs** tab to see if it executed successfully

#### Test the API Directly:
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "db": true,
  "timestamp": "2025-10-29T03:02:00.000Z",
  "message": "Database is healthy"
}
```

#### Verify in Supabase:
1. Go to **Supabase Dashboard** → **Your Project** → **Reports** → **API**
2. Look for query logs from the health check
3. If you see activity, you're golden! ✅

## Customization Options

### Change Cron Schedule
Edit `vercel.json` to adjust frequency:

```json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "0 0 */2 * *"  // Every 2 days at midnight UTC
    }
  ]
}
```

**Common schedules:**
- `0 0 * * *` - Daily at midnight UTC
- `0 12 * * *` - Daily at noon UTC
- `0 0 */2 * *` - Every 2 days at midnight UTC
- `0 0 * * 0` - Weekly on Sunday at midnight UTC

### Secure the Endpoint
If you added `CRON_SECRET` environment variable, the endpoint will reject requests without the proper header. This prevents unauthorized pings.

### Change the Database Query
Edit `api/health.js` if you want to query a different table:

```typescript
const { data, error } = await supabase
  .from('your_table_name')  // Change this
  .select('id')
  .limit(1);
```

## Troubleshooting

### Cron Job Not Showing Up?
- Make sure `vercel.json` is in the project root
- Redeploy after making changes to `vercel.json`
- Check Vercel build logs for errors

### Health Check Failing?
- Verify environment variables are set in Vercel Dashboard
- Check that `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are correct
- Look at Vercel function logs for error details

### Supabase Still Pausing?
- If already paused, manually restore it first in Supabase Dashboard
- Verify cron is actually running (check Vercel logs)
- Ensure the health check is successfully querying the DB (check Supabase API logs)

## How It Works

1. **Vercel Cron** triggers at scheduled time (midnight UTC daily)
2. **Serverless function** (`/api/health`) executes
3. **Supabase client** connects and runs a lightweight query
4. **Activity logged** in Supabase, resetting the inactivity timer
5. **Response returned** with health status

## Cost & Reliability

- **100% Free** on Vercel Hobby tier (up to 2 cron jobs)
- **99.99%+ uptime** - Vercel's infrastructure is solid
- **Auto-retries** if a ping fails
- **No maintenance** required once set up

## Notes

- This hack has been working since early 2024 and still works in 2025
- Supabase hasn't changed their inactivity policy
- The query is super lightweight (just `SELECT id LIMIT 1`)
- No impact on your Supabase quotas or performance

---

**You're all set!** Your Supabase free project will stay active indefinitely. 🚀
