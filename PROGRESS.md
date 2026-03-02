# TaxFlowAI — Build Progress

Last updated: 2026-03-02 (Session 8)

---

## ✅ What Is Built

### Infrastructure
- AWS Lambda + API Gateway (backend)
- AWS Amplify (frontend, Next.js static export)
- Supabase (PostgreSQL + file storage)
- GitHub Actions CI/CD (auto-deploy on push)
- Prisma ORM with schema migrations
- AWS SES (production) — 50,000 emails/day, out of sandbox

### Auth Flow
- Accountant registers and logs in
- Accountant sends invitation email to client (sets temp password, province, language)
- Client logs in → forced to **change password** (first-login flag)
- After password change → redirected to **Tax Profile** page
- After profile → redirected to **Document Upload** page

### Client — Tax Profile (`/client/tax-year/[year]/profile`)
Client fills in checkboxes across 6 sections:

| Section | Fields |
|---|---|
| Income | Employment, Self-employment, Gig economy, Investments, Securities, Rental, Retirement, EI/RQAP, Social assistance |
| Savings | RRSP, FHSA |
| Deductions | Childcare, Tuition, Student loans, Medical, Donations, Home office, Moving, Disability |
| Living | Is a tenant (triggers RL-31 for QC Solidarity Credit) |
| Business | Vehicle for business (shown only if self-employed) |
| Family | Married, Dependents + number of children |

Profile is stored as JSON in the `TaxYear.profile` column — no migration needed when adding new fields.

### Client — Document Upload (`/client/tax-year/[year]`)
- **Step 1 card** blocks upload until profile is complete
- **Step 2** shows upload form once profile is done
- Province-aware dropdown (QC clients see RL slips; others see their provincial docs)
- Presigned URL upload flow: Presign → Direct upload to Supabase → Confirm
- File input clears after upload (useRef on `<input>`)

### Client — Document Checklist
Built dynamically from the client's profile + province:
- Maps each profile flag to required documents (e.g., `has_ei_rqap` → T4E + RL-6 for QC)
- Shows per-document status badges:
  - `⏳ Scanning…` — OCR in progress
  - `✓ Verified` — AI confirmed correct doc type and year
  - `⚠️ Wrong doc — AI sees T5` — uploaded wrong document type
  - `⚠️ Wrong year — doc shows 2022` — document is from wrong tax year
  - `❌ Unreadable` — too blurry to scan
  - `✓ Approved` / `✗ Needs correction` — accountant review result
- Completeness score calculated on frontend
- Auto-polls every 5 seconds while any doc is still scanning
- "Additional Documents" section for uploads outside the required checklist

### Client — Dashboard (`/client/dashboard`)
- Shows current year card + previous years (always visible, even if empty)
- 5-year rolling window (currentYear-5 to currentYear)
- Each card shows: completeness bar + list of uploaded docs with status badges
- Province badge in nav
- "No previous years on file" empty state message (bilingual EN/FR)

### Document Scanning Pipeline
Every upload goes through:
1. **OCR** — AWS Textract (images via HTTP) + pdf-parse (PDFs, pure JS) — Lambda-compatible, no native binaries
2. **AI Classification** — GPT-4o-mini (~$0.0002/doc) identifies:
   - Document type (25 types: T4, RL1, T4E, T4A_OAS, T5008, T4FHSA, RL32, T2201, etc.)
   - Tax year shown on the document
   - Taxpayer's name
   - Key financial fields (income, tax withheld, etc.)
3. **Mismatch detection**:
   - **Type mismatch** — AI confidence ≥ 80% and extracted type ≠ user-selected type
   - **Year mismatch** — extracted year ≠ tax year being filed
4. Results saved to `Document.extractedData` + `extractionStatus`
5. Runs **synchronously** inside `confirmUpload` (25s timeout) so result is ready immediately

### Accountant — Dashboard (`/accountant/dashboard`)
- Lists all clients with doc counts and completeness scores
- Sorted: submitted → in_review → draft → completed
- Click client → client detail page

### Accountant — Client Detail (`/accountant/client`)
- Shows client info: name, email, phone, province badge
- Lists uploaded documents per tax year
- Add tax year: input + button (enforces 5-year window, blocks duplicates)
- Internal notes textarea (auto-saves, accountant-only)
- Export tax year to Excel

### Accountant — Billing (`/accountant/billing`)
- Stripe per-seat billing: $12.99/month per client (recurring)
- $3,500 one-time setup/onboarding fee
- Stripe Checkout integration

### Admin — Dashboard (`/admin/dashboard`)
- Lists all accountants with client counts, revenue, health status

### Auto-Reload on Deploy
- `public/version.json` generated at build time with a unique timestamp
- `useVersionCheck` hook polls every 30s
- On version mismatch → silent page reload
- Skips polling when tab is hidden, checks instantly on tab focus

### Stripe — Fully Wired (Live + Test)
- Live API keys in GitHub secrets
- Live Price IDs for subscription + onboarding
- Live webhook: `https://api.isaloumapps.com/api/billing/webhook`
- 4 events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- All secrets injected into Lambda via SAM template parameters

---

## 💰 Cost Per Document Upload
| Service | Cost |
|---|---|
| AWS Textract (images) | ~$0.0015/page |
| pdf-parse (PDFs) | $0.00 (free) |
| GPT-4o-mini classification | ~$0.0002 |
| **Total per doc (image)** | **~$0.0017** |
| **Total per doc (PDF)** | **~$0.0002** |

100 clients × 15 docs (mixed) = **~$1–2 total**

---

## 🔜 Next Steps (Priority Order)

### 1. Real rejection email
When accountant rejects a doc, client gets SES email with the rejection reason.
`NotificationService.notifyDocumentRejected` — verify it calls `SESEmailService` and actually sends.

### 2. Submitted date column on accountant dashboard
Show `submittedAt` date so accountant knows how long a file has been waiting.

### 3. Rejection reason on client dashboard
Show rejection reason inline in the dashboard card — no need to click into the year.

### 4. Forgot password flow
Clients have no way to reset their password if they forget it.

### 5. Re-open completed file
Once marked `completed`, accountant cannot push back to `submitted` if they made an error.

### 6. Per-accountant sender email
Each accountant sends invitations from their own email address (not a shared domain address).

### 7. Stripe trial → paid conversion
When trial ends, auto-convert to paid subscription. Handle `customer.subscription.updated` webhook properly.

---

## 🗂️ Key Files

| File | Purpose |
|---|---|
| `backend/src/controllers/document.controller.ts` | presignUpload, confirmUpload (runs OCR sync) |
| `backend/src/controllers/client.controller.ts` | getProfile, getTaxYearCompleteness |
| `backend/src/controllers/accountant.controller.ts` | createTaxYear, exportTaxYearExcel |
| `backend/src/services/extraction.service.ts` | OCR → AI → mismatch detection → DB save |
| `backend/src/services/ai-classifier.service.ts` | GPT-4o-mini prompt, 25 doc types |
| `backend/src/services/ocr.service.ts` | AWS Textract (images) + pdf-parse (PDFs) |
| `backend/template-production.yaml` | SAM template — Lambda + API Gateway + Stripe params |
| `frontend/app/client/dashboard/page.tsx` | Client dashboard with previous years |
| `frontend/app/client/tax-year/[year]/TaxYearClient.tsx` | Upload + checklist + scan badges |
| `frontend/app/client/tax-year/[year]/profile/ProfileClient.tsx` | Tax profile form |
| `frontend/app/accountant/client/page.tsx` | Accountant client detail + add year |
| `frontend/app/accountant/billing/page.tsx` | Stripe billing page |
| `frontend/hooks/useVersionCheck.ts` | Auto-reload on deploy |
| `frontend/scripts/generate-version.js` | Generates public/version.json at build time |
| `.github/workflows/backend-deploy.yml` | SAM deploy with Stripe secrets |
