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
- Deploys to GitHub Pages automatically using **GitHub Actions as the source**

## Setup Instructions

### 1. Enable GitHub Pages with GitHub Actions Source

**Important**: You must set GitHub Pages source to GitHub Actions:

1. Go to repository Settings → Pages
2. Under "Source" section, select **"GitHub Actions"** (not "Deploy from a branch")
3. Save the settings

### 2. First Deployment

1. Push code to `main` branch, or manually trigger the workflow
2. The workflow will automatically build and deploy to GitHub Pages
3. Your app will be available at: `https://canace22.github.io/FocusTime`

### 3. Automatic Deployments

- Every push to `main` branch will trigger a new deployment
- Check deployment status in the Actions tab
- GitHub Pages will automatically update after deployment completes

## Workflow Details

### CI Workflow
- Tests on multiple Node.js versions in parallel
- Runs linter and tests
- Builds the project and saves artifacts

### Deploy Workflow
- Uses Node.js 20.x
- Installs dependencies and builds production version
- Uses `actions/configure-pages@v4` to configure Pages
- Uses `actions/upload-pages-artifact@v3` to upload build artifacts
- Uses `actions/deploy-pages@v4` to deploy to GitHub Pages

## Permissions

The deploy workflow requires the following permissions:
- `contents: read` - Read repository contents
- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - Required for OIDC authentication

These are automatically granted when using GitHub Actions.

## Troubleshooting

If deployment fails, check:
1. Whether GitHub Pages source is set to "GitHub Actions"
2. Whether GitHub Pages is enabled in repository settings
3. Error messages in the Actions tab
4. Whether the build completed successfully

