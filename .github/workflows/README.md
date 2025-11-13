# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD and deployment.

## Workflows

### CI (`ci.yml`)
- Runs on push to `main`/`develop` branches and pull requests
- Tests on Node.js 18.x and 20.x
- Runs linter and tests
- Builds the project
- Uploads build artifacts

### Deploy (`deploy.yml`)
- Runs on push to `main` branch or manual trigger
- Builds the React app
- Deploys to GitHub Pages automatically

## Setup Instructions

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **First Deployment**:
   - Push to `main` branch or manually trigger the workflow
   - The workflow will automatically deploy to GitHub Pages
   - Your app will be available at: `https://canace22.github.io/FocusTime`

3. **Automatic Deployments**:
   - Every push to `main` will trigger a new deployment
   - Check the Actions tab to see deployment status

## Permissions

The deploy workflow requires the following permissions:
- `contents: read` - Read repository contents
- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - Required for OIDC authentication

These are automatically granted when using GitHub Actions.

