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
- **API**: Google Apps Script staging endpoint
- **URL**: `https://public-datasets-<hash>.vercel.app`

### Production
- **Branch**: `main`
- **API**: Google Apps Script production endpoint
- **URL**: `https://public-datasets-1dy9.vercel.app`

## Environment Variables

Configure these in Vercel project settings:

| Variable | Preview | Production |
|----------|---------|------------|
| `NEXT_PUBLIC_API_BASE` | `https://script.google.com/macros/s/<ID_STAGING>/exec` | `https://script.google.com/macros/s/<ID_PROD>/exec` |

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for detailed setup instructions.

## Development

```bash
npm install
npm run dev
```

## Deployment

- **Staging**: Push to `staging` branch
- **Production**: Push to `main` branch

Deployments are handled automatically by GitHub Actions using Vercel CLI.
