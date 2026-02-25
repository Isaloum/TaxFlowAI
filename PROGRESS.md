# TaxFlowAI — Build Progress

Last updated: 2026-02-23 (Session 5)

---

## ✅ What Is Built

### Infrastructure
- AWS Lambda + API Gateway (backend)
- Cloudflare Pages (frontend, Next.js)
- Supabase (PostgreSQL + file storage)
- GitHub Actions CI/CD (auto-deploy on push)
- Prisma ORM with schema migrations

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
- Completeness score calculated on frontend (not broken backend)
- Auto-polls every 5 seconds while any doc is still scanning
- "Additional Documents" section for uploads outside the required checklist

### Client — Dashboard (`/client/dashboard`)
- Shows 3 year cards (current year, -1, -2)
- Each card shows: completeness bar + list of uploaded docs with status badges
- Province badge in nav
- No need to click into a year to see what was uploaded

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
- Click client → client detail page

### Accountant — Client Detail (`/accountant/client`)
- Shows client info: name, email, phone (formatted `(514) 571-2812`), province badge
- Lists uploaded documents per tax year

### Client — Multi-Document Support
- Certain document types allow multiple uploads: T4, T4A, T5, RL1, GigPlatformReport, VehicleLog, and others
- Each copy gets a **label** (e.g. "McDonald's", "Uber") to tell copies apart
- Checklist shows all copies per type as sub-rows with the label in bold
- "+ Add another" button pre-selects that doc type in the upload form
- `docSubtype` field saved to DB and returned in all document responses

---

## ✅ Session 3 — Completed (commit 03a7523)

### Accountant Sees Scan Results (fixed + upgraded)
- **Bug fixed**: documents weren't showing at all — backend returns `taxYear.documents`, not `documents` at root
- Each doc now shows: scan badge (⏳/✓/⚠️/❌), extracted taxpayer name, tax year, employer/payer, key dollar amounts
- Orange row highlight + full mismatch description when AI detects wrong doc type or wrong year
- Rejection reason shown inline on each rejected doc
- Summary bar shows "X docs need attention" pill

### Client Rejection Alert
- Red banner at top of client dashboard when any doc is rejected
- Tells client to click the year to fix it

### Submit for Review Button
- Appears on tax year page once profile is done + at least 1 doc uploaded
- Sets `taxYear.status = 'submitted'`, stamps `submittedAt`
- Button disabled while docs are still scanning
- Replaced by blue "File submitted" confirmation after submission
- Backend: `POST /api/client/tax-years/:year/submit`

---

## ✅ Session 4 — Completed (commit bf074cd)

### Root Cause: 502 on All /documents/* Endpoints — Fixed
The Lambda was crashing on cold start before handling any request. Root cause chain:

1. `document.controller.ts` imported `queueDocumentExtraction` → not imported → TypeScript error → **fixed by adding import**
2. `queue.service.ts` imports `bull` (Redis) → native dependency → Lambda crash → **fixed by removing queue import, calling ExtractionService directly**
3. `ocr.service.ts` had `import Tesseract from 'tesseract.js'` at module level → `tesseract.js` has native C++ binaries → Lambda crash on cold start → **fixed by replacing entire OCR service**

### OCR: Replaced Tesseract with AWS Textract + pdf-parse
- `ocr.service.ts` completely rewritten — no more Tesseract or Google Vision
- **PDFs** → `pdf-parse` (pure JS, zero native deps, instant)
- **Images** (JPG/PNG/HEIC) → AWS `DetectDocumentText` (HTTP call to Textract)
- Textract IAM policy added to `DocumentsFunction` in `template-production.yaml`
- `tesseract.js` and `@google-cloud/vision` removed from all esbuild External lists

### Lambda Timeout Safety
- `confirmUpload` races OCR against a **20s timeout** using `Promise.race`
- If timeout fires → explicitly sets `extractionStatus = 'failed'` in DB before returning
- Frontend stops polling after **12 polls (60s)** to prevent infinite "Scanning…" state

---

## ✅ Session 5 — Completed (commits 39a455a → c876f7b)

### Full Workflow Closed (Mark as Complete)
- Accountant: "✅ Mark as Complete" button on tax year (shown when status = submitted)
- Sets `status = completed`, `completedAt` timestamp — new field added to schema
- Client gets bilingual SES email (FR/EN) confirming their return is done
- Client dashboard shows green "🎉 Your tax return is complete!" banner
- Accountant gets email when client clicks "Submit for Review"

### Document Verification — Gaps Fixed
- **Smart checklist**: a doc only counts as ✓ done when at least one clean copy exists (no typeMismatch, no yearMismatch, not failed, not rejected). Previously a wrong doc still checked the box.
- **🗑 Delete button**: appears on any doc with issues. Client deletes → uploads correct file.
- **Submit blocked**: "Submit for Review" is disabled + orange warning if any doc has issues.
- **Duplicate RL10** removed from QC_RL_SLIPS dropdown.

### Accountant Internal Notes
- Free-text notes textarea on each tax year (accountant side only)
- "Only visible to you — not shown to client" label
- Auto-loads existing notes when switching years, `✓ Saved` confirmation
- Backend: `PATCH /api/accountant/tax-years/:taxYearId/notes`

### Accountant Dashboard Sort
- Clients now sorted: `submitted` → `in_review` → `draft` → `completed`
- Clients needing attention always float to the top

### Bug Fixed: Lambda 500 on All /users/* Routes
- Root cause: broken JSDoc in `ses-email.service.ts` caused TypeScript parse failure → `UsersFunction` crashed on cold start → 500 on all client and accountant endpoints
- Fix: removed malformed comment block, file parses cleanly

---

## 🔜 Next Steps (Priority Order)

### 1. Real email when accountant rejects a document
`NotificationService.notifyDocumentRejected` calls `EmailService` (not `SESEmailService`).
Need to verify `EmailService` is wired to SES and actually sends to the client's inbox.

### 2. Accountant dashboard — submitted date column
Show `submittedAt` date on the dashboard table so accountant knows how long a file has been waiting.

### 3. Client can see rejection reason inline without clicking into the year
Currently the rejection detail is only inside `/client/tax-year/[year]`.
Add the rejection reason text directly in the dashboard card.

### 4. Password reset / "Forgot password" flow
Currently clients have no way to reset their password if they forget it.

### 5. Accountant can re-open a completed file
Once marked `completed`, there is no way to go back to `submitted` if the accountant made an error.

---

## 🗂️ Key Files

| File | Purpose |
|---|---|
| `backend/src/controllers/document.controller.ts` | presignUpload, confirmUpload (runs OCR sync) |
| `backend/src/controllers/client.controller.ts` | getProfile (returns taxYears+docs), getTaxYearCompleteness |
| `backend/src/services/extraction.service.ts` | OCR → AI → mismatch detection → DB save |
| `backend/src/services/ai-classifier.service.ts` | GPT-4o-mini prompt, 25 doc types |
| `backend/src/services/ocr.service.ts` | AWS Textract (images) + pdf-parse (PDFs) |
| `frontend/app/client/dashboard/page.tsx` | Client dashboard with doc preview |
| `frontend/app/client/tax-year/[year]/TaxYearClient.tsx` | Upload + checklist + scan badges |
| `frontend/app/client/tax-year/[year]/profile/ProfileClient.tsx` | Tax profile form |
| `frontend/app/client/change-password/page.tsx` | First-login password change |
| `frontend/app/accountant/client/page.tsx` | Accountant client detail view |

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
