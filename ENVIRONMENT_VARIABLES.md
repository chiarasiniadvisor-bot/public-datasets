# Environment Variables Configuration

## Vercel Environment Variables

Configure these variables in your Vercel project settings:

### Preview Environment (staging and all branches ≠ main)
```
VITE_API_BASE = https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json
VITE_HISTORICAL_DATA_URL = https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/historical-data.json
VITE_ENV_LABEL = STAGING
```

### Production Environment (main branch)
```
VITE_API_BASE = https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json
VITE_HISTORICAL_DATA_URL = https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/historical-data.json
VITE_ENV_LABEL = PROD
```

**Important**: Create two separate environment variables with the same name `VITE_API_BASE` but assign them to different environments (Preview vs Production). This allows you to point to different data sources for staging and production if needed.

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the variables:
   - **Name**: `VITE_API_BASE`
   - **Value**: GitHub Raw datasets URL
   - **Environment**: Select "Preview" and/or "Production"
4. Add the historical data variable (optional):
   - **Name**: `VITE_HISTORICAL_DATA_URL`
   - **Value**: GitHub Raw historical data URL
   - **Environment**: Select "Preview" and/or "Production"

## GitHub Secrets for Deploy Hooks

Configure these secrets in GitHub → Settings → Secrets → Actions:

- `VERCEL_DEPLOY_HOOK_URL` → Production hook URL (branch main)
- `VERCEL_DEPLOY_HOOK_URL_STAGING` → Staging hook URL (branch staging)

## Fallback

If `VITE_API_BASE` is not set, the app will fallback to:
```
https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json
```

If `VITE_HISTORICAL_DATA_URL` is not set, the app will fallback to:
```
https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/historical-data.json
```

## Local Development

For local development, create a `.env.local` file:
```
VITE_API_BASE=https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json
VITE_HISTORICAL_DATA_URL=https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/historical-data.json
```

## Important Notes

- With Vite, client-visible environment variables MUST start with `VITE_*`
- No more `NEXT_PUBLIC_*` variables needed
- All data now comes from GitHub Raw datasets (no Google Apps Script required)
