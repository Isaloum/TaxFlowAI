# 🤝 Contributing to TaxSyncQC

First off, **thank you** for considering contributing to TaxSyncQC! 🎉

TaxSyncQC is a free, open-source tax credits estimator for Quebec and Federal calculations. Whether you're fixing a bug, adding a feature, improving documentation, or just asking questions — your contribution matters!

This guide will help you get started, even if you're new to open source. Don't worry if you make mistakes — we're here to help!

---

## 📚 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How to Contribute](#how-to-contribute)
4. [Setting Up Your Development Environment](#setting-up-your-development-environment)
5. [Making Changes](#making-changes)
6. [Coding Standards](#coding-standards)
7. [Testing Your Changes](#testing-your-changes)
8. [Submitting Your Contribution](#submitting-your-contribution)
9. [Issue Labels and Tagging](#issue-labels-and-tagging)
10. [Getting Help](#getting-help)

---

## 📜 Code of Conduct

By participating in this project, you agree to be respectful, inclusive, and constructive. We want everyone to feel welcome, regardless of experience level.

- **Be kind and patient** with others
- **Be respectful** of differing viewpoints
- **Focus on what's best** for the community
- **Show empathy** towards other contributors

---

## 🚀 Getting Started

### What Can I Contribute?

There are many ways to contribute to TaxSyncQC:

- 🐛 **Report bugs** — Found something broken? Let us know!
- 💡 **Suggest features** — Have an idea to make TaxSyncQC better?
- 📝 **Improve documentation** — Help make our docs clearer
- 🌍 **Improve translations** — Enhance French/English translations
- 🔧 **Fix issues** — Tackle bugs or implement new features
- ✨ **Code review** — Review pull requests from other contributors

### Before You Start

1. Check if your issue or idea already exists in [Issues](https://github.com/Isaloum/TaxSyncQC/issues)
2. Read this contributing guide completely
3. Review the [README.md](README.md) to understand the project

---

## 🛠️ Setting Up Your Development Environment

### Prerequisites

Before you begin, make sure you have:

- **Git** installed ([Download Git](https://git-scm.com/downloads))
- **Node.js** (v14 or higher) and **npm** installed ([Download Node.js](https://nodejs.org/))
- A **GitHub account** ([Sign up here](https://github.com/join))
- A **text editor** (VS Code, Sublime, Atom, etc.)

### Step 1: Fork the Repository

A fork creates your own copy of the repository where you can make changes safely.

1. Go to the [TaxSyncQC repository](https://github.com/Isaloum/TaxSyncQC)
2. Click the **"Fork"** button in the top-right corner
3. This creates a copy at `https://github.com/YOUR-USERNAME/TaxSyncQC`

### Step 2: Clone Your Fork

Clone your forked repository to your local machine:

```bash
# Replace YOUR-USERNAME with your GitHub username
git clone https://github.com/YOUR-USERNAME/TaxSyncQC.git

# Navigate into the project directory
cd TaxSyncQC
```

### Step 3: Add Upstream Remote

Set up the original repository as an "upstream" remote so you can stay updated:

```bash
# Add the original repo as upstream
git remote add upstream https://github.com/Isaloum/TaxSyncQC.git

# Verify your remotes
git remote -v
```

You should see:

```
origin    https://github.com/YOUR-USERNAME/TaxSyncQC.git (fetch)
origin    https://github.com/YOUR-USERNAME/TaxSyncQC.git (push)
upstream  https://github.com/Isaloum/TaxSyncQC.git (fetch)
upstream  https://github.com/Isaloum/TaxSyncQC.git (push)
```

### Step 4: Install Dependencies

Install the project's development dependencies:

```bash
npm install
```

This installs ESLint, Prettier, and other development tools.

### Step 5: Verify Your Setup

Test that everything is working:

```bash
# Run the linter
npm run lint

# Format code
npm run format

# Run tests (currently minimal)
npm test
```

If these commands run without errors, you're ready to start developing! 🎉

---

## 🔄 How to Contribute

### Creating an Issue

Found a bug or have a feature request? Create an issue!

1. Go to [Issues](https://github.com/Isaloum/TaxSyncQC/issues)
2. Click **"New Issue"**
3. Choose a descriptive title
4. Provide details:
   - **For bugs**: What happened? What did you expect? Steps to reproduce?
   - **For features**: What problem does this solve? How should it work?
5. Add relevant labels (see [Issue Labels](#issue-labels-and-tagging))
6. Click **"Submit new issue"**

**Good Bug Report Example:**

```
Title: RRSP calculator shows incorrect marginal rate for $60k income

Description:
When I enter $60,000 as income in the RL-1 calculator with Box A,
the RRSP section shows a marginal rate of 38.85% instead of 28.85%.

Expected: 28.85% marginal rate
Actual: 38.85% marginal rate

Steps to reproduce:
1. Go to https://Isaloum.github.io/TaxSyncQC
2. Select RL-1 slip
3. Enter 60000 in Box A
4. Observe RRSP marginal rate in results

Browser: Chrome (latest)
```

### Commenting on Issues

Before starting work on an issue:

1. **Comment on the issue** saying you'd like to work on it
2. Wait for a maintainer to assign it to you or give you the go-ahead
3. This prevents duplicate work!

---

## 💻 Making Changes

### Step 1: Sync Your Fork

Before creating a new branch, sync with the latest changes:

```bash
# Switch to main branch
git checkout main

# Fetch latest changes from upstream
git fetch upstream

# Merge upstream changes into your local main
git merge upstream/main

# Push updates to your fork
git push origin main
```

### Step 2: Create a Feature Branch

Create a new branch for your changes. Use a descriptive name:

```bash
# Create and switch to a new branch
git checkout -b feature/add-pdf-parser
# or
git checkout -b fix/rrsp-calculation-bug
# or
git checkout -b docs/update-readme
```

**Branch naming conventions:**

- `feature/` — New features (e.g., `feature/multi-year-comparison`)
- `fix/` — Bug fixes (e.g., `fix/solidarity-credit-threshold`)
- `docs/` — Documentation updates (e.g., `docs/contributing-guide`)
- `refactor/` — Code refactoring (e.g., `refactor/cleanup-parsers`)

### Step 3: Make Your Changes

Now edit the files! Here are the main project files:

- **`index.html`** — Main web interface
- **`credit-calculator.js`** — Core calculation logic
- **`rrsp-calculator.js`** — RRSP impact calculations
- **`income-slip-parser.js`** — RL-1/T4 parsing logic
- **`rl1-parser.js`** — RL-1 specific parser
- **`i18n.js`** — Bilingual translations (FR/EN)
- **`cli.js`** — Command-line interface

**Tips:**

- Make small, focused commits
- Test your changes as you go
- Keep changes minimal and relevant to the issue

### Step 4: Follow Coding Standards

See the [Coding Standards](#coding-standards) section below.

### Step 5: Test Your Changes

See the [Testing Your Changes](#testing-your-changes) section below.

### Step 6: Commit Your Changes

Write clear, descriptive commit messages:

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Fix: Correct RRSP marginal rate for $60k income bracket"
```

**Good commit message examples:**

- `Fix: Correct solidarity credit phase-out calculation`
- `Feature: Add PDF drag-and-drop support for RL-1 parsing`
- `Docs: Update README with CLI examples`
- `Refactor: Extract credit calculation into separate function`

**Commit message format:**

```
Type: Short description (50 chars or less)

Optional longer explanation:
- Why this change was needed
- What problem it solves
- Any relevant context

Fixes #123
```

---

## 📏 Coding Standards

TaxSyncQC uses **ESLint** and **Prettier** to maintain consistent code quality.

### Code Style Rules

- **Indentation:** 2 spaces (no tabs)
- **Line length:** Maximum 100 characters
- **Quotes:** Single quotes for strings (`'hello'`)
- **Semicolons:** Always use semicolons (`;`)
- **Trailing commas:** Use ES5 style trailing commas

### Running Linters

Before committing, always run:

```bash
# Check for linting errors
npm run lint

# Auto-fix linting issues
npm run lint -- --fix

# Format all files with Prettier
npm run format
```

### Pre-commit Hooks

The project uses **Husky** and **lint-staged** to automatically lint and format files when you commit. This runs automatically, but you can also run it manually:

```bash
# This happens automatically on git commit
npm run lint
npm run format
```

### Code Quality Guidelines

1. **Write clear, self-documenting code**

   - Use descriptive variable names: `totalIncome` not `ti`
   - Avoid magic numbers: Use named constants

2. **Add comments for complex logic**

   ```javascript
   // Calculate Quebec solidarity credit phase-out
   // Phase-out starts at $57,965 and ends at $64,125
   const phaseOutStart = 57965;
   const phaseOutEnd = 64125;
   ```

3. **Keep functions small and focused**

   - Each function should do one thing well
   - Aim for functions under 50 lines

4. **Handle edge cases**

   - Check for null/undefined values
   - Validate user input
   - Handle division by zero

5. **Maintain bilingual support**
   - All user-facing text goes in `i18n.js`
   - Test both French and English translations

### JavaScript Best Practices

```javascript
// ✅ Good
const income = parseFloat(inputValue) || 0;
if (income > 0 && income < 100000) {
  calculateCredit(income);
}

// ❌ Avoid
var income = inputValue; // Use const/let, not var
if (income) {
  // Check for specific conditions
  calculateCredit(income);
}
```

---

## 🧪 Testing Your Changes

While TaxSyncQC doesn't have extensive automated tests yet, you should manually test your changes thoroughly.

### Manual Testing Checklist

#### For Web UI Changes:

1. **Test in multiple browsers:**

   - Chrome/Edge
   - Firefox
   - Safari (if available)

2. **Test both language modes:**

   - Switch between French and English
   - Verify all text translates correctly

3. **Test with different inputs:**

   ```bash
   # Low income (solidarity credit eligible)
   Box A: $30,000

   # Medium income (work premium eligible)
   Box A: $50,000

   # High income (phase-out zone)
   Box A: $65,000
   ```

4. **Test edge cases:**

   - Empty inputs
   - Zero values
   - Very large numbers
   - Negative numbers (should be rejected)
   - Non-numeric input

5. **Test RRSP calculator:**
   - Slide through different contribution amounts
   - Verify marginal rates are correct
   - Check that tax savings calculate properly

#### For CLI Changes:

Test the command-line interface:

```bash
# Basic RL-1 calculation
node cli.js --slip "Case A: 60000"

# With RRSP contribution
node cli.js --slip "Case A: 60000" --rrsp 5000

# With multiple boxes
node cli.js --slip "Case A: 60000, F: 400, B.A: 3200"

# Test error handling
node cli.js --slip "Case A: invalid"
```

#### For Calculation Changes:

Verify your calculations against official sources:

- **Quebec credits:** [Revenu Québec](https://www.revenuquebec.ca/)
- **Federal credits:** [Canada Revenue Agency](https://www.canada.ca/en/revenue-agency.html)
- **RRSP rates:** [Canadian income tax rates](https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html)

### Running the Web App Locally

To test the web interface locally:

```bash
# Option 1: Use Python's built-in server
python3 -m http.server 8000

# Option 2: Use Node's http-server (install first)
npx http-server -p 8000

# Then open: http://localhost:8000
```

### Debugging Tips

- **Use browser DevTools:** Press F12 to open developer tools
- **Check the console:** Look for JavaScript errors
- **Use console.log():** Add logging to track values
  ```javascript
  console.log('Income:', income, 'Credit:', credit);
  ```
- **Test incrementally:** Make small changes and test after each one

---

## 📤 Submitting Your Contribution

### Step 1: Push to Your Fork

Push your feature branch to your GitHub fork:

```bash
# Push your branch
git push origin feature/your-feature-name
```

If this is your first push on this branch, Git will provide the exact command.

### Step 2: Create a Pull Request

1. Go to your fork on GitHub: `https://github.com/YOUR-USERNAME/TaxSyncQC`
2. You'll see a **"Compare & pull request"** button — click it
3. Or go to the [main repository](https://github.com/Isaloum/TaxSyncQC) and click **"New Pull Request"**
4. Select:
   - **Base repository:** `Isaloum/TaxSyncQC`
   - **Base branch:** `main`
   - **Head repository:** `YOUR-USERNAME/TaxSyncQC`
   - **Compare branch:** `feature/your-feature-name`

### Step 3: Fill Out the PR Template

Write a clear pull request description:

**Title:** Short, descriptive summary (e.g., "Fix RRSP marginal rate calculation")

**Description template:**

```markdown
## Description

Brief explanation of what this PR does.

## Related Issue

Fixes #123

## Changes Made

- Fixed RRSP marginal rate for $60k income bracket
- Updated rate from 38.85% to 28.85%
- Added test case for edge case

## Testing Done

- [x] Tested with income of $60,000
- [x] Verified in both FR and EN modes
- [x] Tested in Chrome and Firefox
- [x] Ran `npm run lint` with no errors

## Screenshots (if applicable)

[Add screenshots showing before/after if UI changed]

## Checklist

- [x] My code follows the project's coding standards
- [x] I have tested my changes thoroughly
- [x] I have updated documentation (if needed)
- [x] My commits have clear messages
- [x] I have checked for linting errors
```

### Step 4: Wait for Review

- A maintainer will review your PR
- They may request changes or ask questions
- Be patient — reviews can take a few days
- Respond to feedback constructively

### Step 5: Make Requested Changes

If changes are requested:

```bash
# Make the changes in your local branch
# ... edit files ...

# Commit the changes
git add .
git commit -m "Address review feedback: update calculation"

# Push to update your PR
git push origin feature/your-feature-name
```

The PR will automatically update!

### Step 6: Celebrate! 🎉

Once your PR is merged, congratulations! You're now a TaxSyncQC contributor!

Your contribution will be visible in:

- The project's commit history
- The contributors list
- The project's releases

---

## 🏷️ Issue Labels and Tagging

We use labels to organize issues and make them easier to find:

### Priority Labels

- `priority: high` 🔴 — Critical bugs or urgent features
- `priority: medium` 🟡 — Important but not urgent
- `priority: low` 🟢 — Nice to have, low priority

### Type Labels

- `bug` 🐛 — Something isn't working correctly
- `feature` ✨ — New feature or enhancement request
- `documentation` 📝 — Documentation improvements
- `question` ❓ — General questions or clarifications
- `enhancement` 💡 — Improvements to existing features

### Difficulty Labels (Great for new contributors!)

- `good first issue` 🌱 — Perfect for first-time contributors
- `help wanted` 🙋 — We need help with this issue
- `easy` 🎯 — Should be straightforward to implement
- `medium` 🎲 — Requires some familiarity with the codebase
- `hard` 🔥 — Complex, requires deep understanding

### Status Labels

- `in progress` 🔄 — Someone is working on this
- `blocked` 🚫 — Can't proceed until something else is done
- `needs review` 👀 — Waiting for code review
- `duplicate` 👯 — This issue already exists elsewhere
- `wontfix` ⛔ — We won't work on this

### Component Labels

- `component: calculator` 🧮 — Core calculation logic
- `component: ui` 🎨 — User interface changes
- `component: cli` 💻 — Command-line interface
- `component: i18n` 🌍 — Translation/bilingual features
- `component: parser` 📄 — RL-1/T4 parsing logic

### Looking for Your First Contribution?

Filter for these labels:

- [`good first issue`](https://github.com/Isaloum/TaxSyncQC/labels/good%20first%20issue)
- [`help wanted`](https://github.com/Isaloum/TaxSyncQC/labels/help%20wanted)
- [`easy`](https://github.com/Isaloum/TaxSyncQC/labels/easy)

---

## 💬 Getting Help

### Where to Ask Questions

- **General questions:** Open a [GitHub Discussion](https://github.com/Isaloum/TaxSyncQC/discussions)
- **Bug reports:** Create an [Issue](https://github.com/Isaloum/TaxSyncQC/issues)
- **Feature requests:** Create an [Issue](https://github.com/Isaloum/TaxSyncQC/issues)
- **PR questions:** Comment directly on your Pull Request

### Response Time

- We aim to respond to issues/PRs within 3-5 business days
- For urgent security issues, please tag with `priority: high`

### Community Guidelines

- **No question is too small** — We welcome beginners!
- **Search first** — Your question might already be answered
- **Be specific** — Provide context and examples
- **Be patient** — Maintainers are volunteers

---

## 📚 Additional Resources

### Learning Resources

**New to Git/GitHub?**

- [GitHub's Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [First Contributions Tutorial](https://github.com/firstcontributions/first-contributions)
- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)

**New to JavaScript?**

- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [JavaScript.info](https://javascript.info/)
- [You Don't Know JS (book series)](https://github.com/getify/You-Dont-Know-JS)

**Tax Calculation References:**

- [Revenu Québec - Solidarity Tax Credit](https://www.revenuquebec.ca/en/online-services/forms-and-publications/current-details/tp-1029.cs/)
- [CRA - Canada Workers Benefit](https://www.canada.ca/en/revenue-agency/programs/about-canada-revenue-agency-cra/federal-government-budgets/budget-2021-strong-recovery-plan/canada-workers-benefit.html)
- [CRA - RRSP Contribution Limits](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans/contributing-a-rrsp-prpp.html)

### Project Documentation

- [README.md](README.md) — Project overview and features
- [LICENSE](LICENSE) — MIT License details
- [package.json](package.json) — Project dependencies and scripts

---

## 🎯 Quick Start Checklist

Ready to contribute? Here's a quick checklist:

- [ ] Read this CONTRIBUTING.md file completely
- [ ] Read the [README.md](README.md)
- [ ] Fork the repository
- [ ] Clone your fork locally
- [ ] Install dependencies with `npm install`
- [ ] Run `npm run lint` to verify setup
- [ ] Find an issue to work on (or create one)
- [ ] Comment on the issue to claim it
- [ ] Create a feature branch
- [ ] Make your changes
- [ ] Test thoroughly
- [ ] Run linter and formatter
- [ ] Commit with clear messages
- [ ] Push to your fork
- [ ] Create a Pull Request
- [ ] Wait for review and respond to feedback
- [ ] Celebrate your contribution! 🎉

---

## 🙏 Thank You!

Thank you for taking the time to contribute to TaxSyncQC! Your efforts help make tax calculations accessible and transparent for everyone in Quebec and across Canada.

Every contribution, no matter how small, makes a difference. We appreciate your help! ❤️

---

**Questions?** Open a [GitHub Discussion](https://github.com/Isaloum/TaxSyncQC/discussions) or comment on an issue.

**🇨🇦 Happy Contributing! Bonne Contribution! 🇨🇦**
