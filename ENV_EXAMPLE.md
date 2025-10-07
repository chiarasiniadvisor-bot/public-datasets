# Environment Variables Example

Create a `.env.local` file in the root directory with these variables for local development:

```bash
# Vite client-side envs (devono iniziare con VITE_)
VITE_API_BASE=https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json
# opzionale
VITE_HISTORICAL_DATA_URL=https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/historical-data.json
```

## For Production (Vercel)

Set these environment variables in your Vercel project settings:

- `VITE_API_BASE` → GitHub Raw datasets URL
- `VITE_HISTORICAL_DATA_URL` → GitHub Raw historical data URL (optional)
