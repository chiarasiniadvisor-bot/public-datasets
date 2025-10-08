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

## Deploy & Environment Variables

### Required Environment Variables

Configure these in **Vercel** → Project → Settings → Environment Variables:

| Variable | Preview/Staging | Production |
|----------|-----------------|------------|
| `VITE_API_BASE` | GitHub Raw datasets URL | GitHub Raw datasets URL |
| `VITE_ENV_LABEL` | `STAGING` | `PROD` |

### Optional Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_HISTORICAL_DATA_URL` | GitHub Raw historical data URL |

### How to Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `VITE_API_BASE`
   - **Value**: `https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json`
   - **Environment**: Select "Preview" and/or "Production"
4. Repeat for `VITE_ENV_LABEL` with values `STAGING`/`PROD`

**Important**: With Vite, client-visible environment variables MUST start with `VITE_*`. The app automatically falls back to GitHub Raw datasets if `VITE_API_BASE` is not set.

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for detailed setup instructions.

## Development

```bash
npm install
npm run dev
```

## Deployment

### Automatic Deployment via Deploy Hooks
- **Staging**: Push to `staging` branch → triggers Vercel Preview
- **Production**: Push to `main` branch → triggers Vercel Production

Deployments use **Vercel Deploy Hooks** for fast, reliable deployments without build steps on GitHub.

### Manual Deployment
Execute workflows manually via GitHub Actions tab:
- **GitHub Actions → Deploy Staging (Vercel) → Run workflow**
- **GitHub Actions → Deploy Production (Vercel) → Run workflow**

### Deploy con Vercel Deploy Hook

For deployments via Deploy Hook (simplified, no build on GitHub):

1. **Vercel** → Project → Settings → Git → Deploy Hooks → Create 2 hooks:
   - Production hook → Copy URL
   - Staging hook → Copy URL
2. **GitHub** → repo → Settings → Secrets → Actions → Add secrets:
   - `VERCEL_DEPLOY_HOOK_URL` (Production → branch main)
   - `VERCEL_DEPLOY_HOOK_URL_STAGING` (Staging → branch staging)
3. **Automatic**: Push to `main` or `staging` triggers deployment
4. **Manual**: Execute workflows via Actions tab

The Deploy Hook provides instant deployment without GitHub build steps.
