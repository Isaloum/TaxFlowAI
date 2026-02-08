# Main Branch Setup

## Overview

This repository is configured to use `main` as the default branch. All CI/CD workflows and contributing guidelines reference the `main` branch.

## Current Status

- Local `main` branch has been created from `copilot/push-main-branch`
- The main branch is ready to be pushed to origin
- All workflows in `.github/workflows/` are configured for the `main` branch

## To Push Main Branch to Origin

From the repository root, execute:

```bash
cd /path/to/TaxFlowAI
git push origin main
```

This will establish `main` as a branch on the remote repository.

## Branch Configuration

The following workflows are configured to trigger on `main`:

- **ci.yml**: Runs on push and pull requests to main
- **pages-deploy.yml**: Deploys GitHub Pages from main (if configured)
- **pages-smoke-test.yml**: Tests after Pages deployment

## Contributing

Contributors should:
1. Fork the repository
2. Create feature branches from `main`
3. Submit pull requests targeting `main`

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## Repository Structure

This is referenced in:
- `.github/workflows/ci.yml` (line 5: `branches: [main]`)
- `CONTRIBUTING.md` (line 30: "open a Pull Request to `main`")

## Next Steps

After pushing `main` to origin:
1. Set `main` as the default branch in GitHub repository settings
2. Update branch protection rules if needed
3. Archive or delete feature branches that have been merged
