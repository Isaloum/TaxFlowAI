# TaxFlowAI — Build Progress

Last updated: 2026-02-22

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
1. **OCR** — Tesseract.js (free), Google Vision fallback (if `USE_GOOGLE_VISION_FALLBACK=true`)
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

---

## 🔜 Next Steps (Priority Order)

### 1. Accountant Document Review UI ← **most critical**
Accountants need a UI to approve or reject each document with notes.
The DB already has `reviewStatus`, `rejectionReason`, `reviewedBy`, `reviewedAt`.
Just needs a frontend panel.

### 2. Client Notification on Review
When accountant approves/rejects, client should see a clear alert on their dashboard.

### 3. "Submit for Review" Button
Client explicitly marks their file as ready → accountant gets notified.

### 4. Accountant Sees Scan Results
Accountant client detail page should show OCR-extracted data (name, year, key fields)
alongside any mismatch warnings — so accountant knows at a glance if a doc is valid.

---

## 🗂️ Key Files

| File | Purpose |
|---|---|
| `backend/src/controllers/document.controller.ts` | presignUpload, confirmUpload (runs OCR sync) |
| `backend/src/controllers/client.controller.ts` | getProfile (returns taxYears+docs), getTaxYearCompleteness |
| `backend/src/services/extraction.service.ts` | OCR → AI → mismatch detection → DB save |
| `backend/src/services/ai-classifier.service.ts` | GPT-4o-mini prompt, 25 doc types |
| `backend/src/services/ocr.service.ts` | Tesseract + Google Vision fallback |
| `frontend/app/client/dashboard/page.tsx` | Client dashboard with doc preview |
| `frontend/app/client/tax-year/[year]/TaxYearClient.tsx` | Upload + checklist + scan badges |
| `frontend/app/client/tax-year/[year]/profile/ProfileClient.tsx` | Tax profile form |
| `frontend/app/client/change-password/page.tsx` | First-login password change |
| `frontend/app/accountant/client/page.tsx` | Accountant client detail view |

---

## 💰 Cost Per Document Upload
| Service | Cost |
|---|---|
| Tesseract OCR | $0.00 (free) |
| GPT-4o-mini classification | ~$0.0002 |
| Google Vision (fallback only) | ~$0.0015 (off by default) |
| **Total per doc** | **~$0.0002** |

100 clients × 15 docs = **~$0.30 total**
