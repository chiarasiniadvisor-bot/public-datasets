# Environment Variables Configuration

## Vercel Environment Variables

Configure these variables in your Vercel project settings:

### Preview Environment (staging and all branches ≠ main)
```
NEXT_PUBLIC_API_BASE = https://script.google.com/macros/s/<ID_STAGING>/exec
```

### Production Environment (main branch)
```
NEXT_PUBLIC_API_BASE = https://script.google.com/macros/s/<ID_PROD>/exec
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the variable:
   - **Name**: `NEXT_PUBLIC_API_BASE`
   - **Value**: The appropriate Google Apps Script URL
   - **Environment**: Select "Preview" and/or "Production"

## Fallback

If `NEXT_PUBLIC_API_BASE` is not set, the app will fallback to:
```
https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json
```

## Local Development

For local development, create a `.env.local` file:
```
NEXT_PUBLIC_API_BASE=https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json
```
