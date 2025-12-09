# GitHub Pages Deployment Notes

## Recent Changes (Dec 2025)

The GitHub Pages deployment workflow has been updated to use the official GitHub Pages actions to fix authentication issues.

### What Changed

- **Old approach**: Used `peaceiris/actions-gh-pages@v4` which relied on git push with GITHUB_TOKEN
- **New approach**: Uses official `actions/upload-pages-artifact@v1` and `actions/deploy-pages@v1`

### Benefits

1. **Proper Permissions**: The workflow now explicitly declares required permissions (`contents: write`, `pages: write`, `id-token: write`)
2. **Better Authentication**: Uses the GitHub Pages deployment API instead of git push operations
3. **Environment Support**: Tracks deployments in the GitHub Pages environment
4. **First-time Deploy**: Handles the case where the gh-pages branch doesn't exist yet

### Repository Settings

For this workflow to work, ensure these settings are configured in your repository:

1. **Settings → Pages → Source**: Should be set to "GitHub Actions" (not "Deploy from a branch")
2. **Settings → Actions → General → Workflow permissions**: Should be set to "Read and write permissions"

### Customizing the Build

The current workflow publishes the project root as-is (static site). To add a build process:

1. Add a `build` script to `package.json`
2. Uncomment the build step in `.github/workflows/pages-deploy.yml`
3. Update the `path` in the Upload Pages artifact step to point to your build output directory

### Troubleshooting

If deployment fails with permission errors:
- Check that workflow permissions are set to "Read and write permissions" in repository settings
- Verify that GitHub Pages is configured to use "GitHub Actions" as the source
- Ensure the gh-pages environment is not protected with conflicting rules

### References

- Original issue: Workflow run 57397424606 (commit 37d7763) failed with 403 error
- [GitHub Pages action documentation](https://github.com/actions/deploy-pages)
- [Upload Pages artifact action](https://github.com/actions/upload-pages-artifact)
