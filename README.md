# Public Datasets - Analytics Dashboard

A React/TypeScript dashboard for analyzing Brevo contact data with automated data processing and multi-environment deployment.

## Features

- 📊 **Analytics Dashboard** - Comprehensive funnel analysis and data visualization
- 🔄 **Automated Data Sync** - Daily GitHub Actions to fetch and process Brevo data
- 🌍 **Multi-Environment** - Separate staging and production deployments
- 🎨 **Responsive Design** - Mobile-optimized with iOS-specific fixes
- 🌐 **Internationalization** - Italian and English language support

## Environment Configuration

### Staging/Preview
- **Branch**: `staging`
- **API**: GitHub Raw datasets
- **URL**: `https://public-datasets-<hash>.vercel.app`

### Production
- **Branch**: `main`
- **API**: GitHub Raw datasets
- **URL**: `https://public-datasets-1dy9.vercel.app`

## Environment Variables

Configure these in Vercel project settings:

| Variable | Preview | Production |
|----------|---------|------------|
| `VITE_API_BASE` | `https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json` | `https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json` |
| `VITE_HISTORICAL_DATA_URL` | `https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/historical-data.json` | `https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/historical-data.json` |

**Note**: With Vite, client-visible environment variables MUST start with `VITE_*`. The default fallback points to GitHub Raw datasets from this repository.

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for detailed setup instructions.

## Development

```bash
npm install
npm run dev
```

## Deployment

### Automatic Deployment
- **Staging**: Push to `staging` branch
- **Production**: Push to `main` branch

Deployments are handled automatically by GitHub Actions using Vercel CLI.

### Deploy con Vercel Deploy Hook

For manual deployments via Deploy Hook:

1. **Vercel** → Project → Settings → Git → Deploy Hooks → Copy URL
2. **GitHub** → repo → Settings → Secrets → Actions → Add `VERCEL_DEPLOY_HOOK_URL`
3. **Execute** workflow "Trigger Vercel Deploy" (workflow_dispatch) or push to main

The Deploy Hook provides instant deployment without waiting for automatic triggers.
