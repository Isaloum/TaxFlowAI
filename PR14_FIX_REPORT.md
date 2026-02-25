# PR #14 Debug Report - CI Failure Analysis and Fixes

## Summary

PR #14 (branch: `copilot/add-ci-lint-prettier`) has **two critical CI failures** that prevent it from being merged:

### Issue #1: GitHub Actions Artifact Name Conflict

**Problem**: The CI workflow uploads artifacts with the same name (`ci-logs`) for both Node.js 18.x and 20.x matrix jobs, causing a conflict.

**Location**: `.github/workflows/ci.yml` line 32

**Error**: When running the matrix build, the second job tries to upload an artifact with the same name as the first, causing the upload to fail or overwrite.

**Fix**: Change the artifact name to be unique per matrix combination:

```yaml
# Before (line 32):
name: ci-logs

# After:
name: ci-logs-node-${{ matrix.node-version }}
```

### Issue #2: ESLint/Prettier Lint Failures (123 errors)

**Problem**: The CI workflow runs `npm run lint` which finds 123 ESLint/Prettier errors:

- 99 errors are auto-fixable (formatting issues)
- 24 errors are due to missing `.eslintignore` file

**Files affected**:

- All `.js` files need Prettier formatting
- `index.html` - HTML file being linted as JavaScript (parsing error)
- `fix-calculate.js` - Browser script with undefined globals (no-undef errors)

**Fix**:

1. Create `.eslintignore` file to exclude files that shouldn't be linted:

```gitignore
# HTML files
index.html
index.html.backup

# Script that runs in browser context with undefined globals (getFormData, TaxCalculator, _)
# These are defined by other scripts loaded in index.html
fix-calculate.js

# Dependencies
node_modules/

# Build artifacts
dist/
build/
```

2. Run auto-fix command:

```bash
npm run lint -- --fix
```

This will automatically format all JavaScript files according to Prettier/ESLint rules.

## Verification

After applying the fixes:

```bash
npm ci
npm run lint --if-present  # ✓ Passes
npm test --if-present      # ✓ Passes
```

## Root Cause Analysis

1. **Artifact naming**: The original CI workflow template didn't account for matrix builds needing unique artifact names
2. **Missing .eslintignore**: The PR added linting but didn't exclude files that shouldn't be linted (HTML, browser-specific scripts)
3. **Unformatted code**: The codebase wasn't formatted with Prettier before enabling the lint check in CI

## Impact

- **Current state**: PR #14 cannot be merged due to CI failures
- **With fixes applied**: All CI checks pass, PR can be safely merged
- **No functionality changes**: All fixes are cosmetic (formatting) and configuration only
