# Outly V3

## Quick start
```bash
npm install
npm run dev
```
Open http://localhost:5173

## Supabase setup (already configured)
The app already has your Supabase keys hardcoded. If you need to reset:
1. Go to supabase.com → your Outly project → SQL Editor
2. Run `supabase-schema.sql`
3. Authentication → Providers → Email → turn OFF "Confirm email" (avoids rate limits during dev)

## Adding real AI (optional)
1. Go to console.anthropic.com → API Keys → create a key
2. Create a `.env` file in this folder:
```
VITE_ANTHROPIC_KEY=your-key-here
```
3. Restart the dev server

## Deploy to Vercel
1. Push to GitHub
2. Import on vercel.com
3. Add env vars if needed
4. Deploy
