# Contributing to TaxFlowAI

Thank you for your interest in contributing to TaxFlowAI! This project helps estimate Provincial and Federal tax credits for Canadian residents. We welcome contributions from everyone — beginners included.

## Quick start

1. Fork the repository on GitHub.
2. Clone your fork locally:

```bash
git clone https://github.com/<your-username>/TaxFlowAI.git
cd TaxFlowAI
```

3. Create a feature branch for your work:

```bash
git checkout -b my-feature-branch
```

4. Make changes, run the linters/formatters, and run tests (if present):

```bash
npm ci
npm run lint || true
npm run format || true
npm test || true
```

5. Commit and push your branch, then open a Pull Request to `main`.

```bash
git add .
git commit -m "Describe your change"
git push origin my-feature-branch
```

## Submitting issues

- Use issues to report bugs, request features, or ask questions.
- Provide a clear title and steps to reproduce for bugs.
- Include expected vs actual behavior and, if possible, a minimal reproducible example.
- Tag issues appropriately (bug, enhancement, good-first-issue, etc.).

## Pull Request process

- Fork the repo and work from a branch.
- Keep PRs focused and small; one logical change per PR.
- Include a descriptive title and a short summary of what the PR changes and why.
- Link related issues in the PR description (e.g., "Fixes #23").
- Maintain commit hygiene: squash or rebase when appropriate.

## Coding standards

- JavaScript follows modern ES modules and syntax.
- Formatting and linting are enforced with Prettier and ESLint.

Run formatting/linting before committing:

```bash
npm run format
npm run lint
```

We follow the existing ESLint and Prettier configuration in the repository. If you add or modify rules, please explain why in the PR.

## Testing

- If you add functionality, include tests where reasonable.
- Run tests locally with `npm test`.

## Labels and issue triage

- We use labels such as `good-first-issue`, `bug`, and `enhancement` to help contributors find work.
- If you're unsure which label to apply, leave it unset and mention it in the issue body — maintainers will triage.

## Communication

- Use GitHub Issues for bug reports and feature requests.
- For broader discussion or community help, we may enable GitHub Discussions — check the repo home page.

## Code of Conduct

- Be respectful and constructive. If you maintain a CONTRIBUTING guide to be more formal, link to a CODE_OF_CONDUCT.md file.

## Need help?

If you're new to open source or need help picking a task, comment on an issue or open a new issue titled "help wanted" or "good first issue" describing what you want to do.

Thanks for contributing — your help improves TaxFlowAI for everyone!
