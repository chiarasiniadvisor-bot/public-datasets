# Environment Variables Example

## Local Development

Create a `.env.local` file in the root directory:

```bash
# Vite client-side envs (must start with VITE_)
VITE_API_BASE=https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json
VITE_ENV_LABEL=LOCAL
VITE_HISTORICAL_DATA_URL=https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/historical-data.json
```

## Vercel Environment Variables

### Production Environment
```
VITE_API_BASE=https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json
VITE_ENV_LABEL=PROD
VITE_HISTORICAL_DATA_URL=https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/historical-data.json
```

### Preview/Staging Environment
```
VITE_API_BASE=https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json
VITE_ENV_LABEL=STAGING
VITE_HISTORICAL_DATA_URL=https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/historical-data.json
```

## Notes

- **Automatic Fallback**: App uses GitHub Raw datasets if `VITE_API_BASE` fails
- **Environment Badge**: Shows `STAGING`/`PROD` based on `VITE_ENV_LABEL`
- **Timeout**: 8-second timeout with graceful error handling
- **UI Feedback**: Error banner appears if data loading fails
