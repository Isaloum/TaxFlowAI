# TaxFlowAI — Project Status

**Last Updated**: March 5, 2026
**Branch**: `main`
**Overall Health**: 🟢 LIVE & OPERATIONAL

---

## 🏗️ Architecture Overview

| Layer | Technology | URL |
|---|---|---|
| Mobile App | React Native / Expo SDK 52 | App Store / Play Store |
| Web Frontend | Next.js (static export) | https://www.isaloumapps.com |
| Backend API | AWS Lambda (Node.js 22) + API Gateway | https://api.isaloumapps.com |
| Database | Supabase PostgreSQL | swkqwqtgbxymyhcnhmfv.supabase.co |
| CI/CD (backend) | GitHub Actions → AWS SAM | Auto-deploys on push to `backend/**` |
| CI/CD (web) | AWS Amplify | Auto-deploys on push to `frontend/**` |

---

## ✅ Features Completed

### Mobile App (iOS + Android)
- [x] Client login / JWT auth
- [x] Dashboard with tax year cards + progress bar (`completenessScore`)
- [x] Auto-refresh on screen focus (`useFocusEffect`)
- [x] Upload documents with **year selector** (7 years back from current)
- [x] Delete uploaded documents (with confirmation alert)
- [x] Year detail screen — view & manage documents per year
- [x] Push notifications via Expo (`expo-notifications`)
- [x] Profile name + email display

### Web Frontend (www.isaloumapps.com)
- [x] Client dashboard — all tax years visible (including years 5+ back)
- [x] Tax year detail page — document upload + delete
- [x] Accountant dashboard — client list + document review
- [x] Admin dashboard
- [x] Login / forgot password / reset password
- [x] Bilingual (FR/EN) via i18n
- [x] Push notifications via Web Push API + service worker (`/sw.js`)

### Backend API (api.isaloumapps.com)
- [x] Auth (register, login, JWT)
- [x] Document management (upload presign → confirm → delete)
- [x] Accountant approve / reject documents
- [x] Push notifications on approve/reject → client notified instantly
- [x] Push token registration endpoints (`/users/push/expo`, `/users/push/web`)
- [x] VAPID key endpoint for web push setup
- [x] Stripe billing integration
- [x] SES email notifications
- [x] AI document classification (OpenAI)
- [x] Self-migrating `push_tokens` table (no manual migration needed)

---

## 🔑 Infrastructure

### Active AWS Resources
| Resource | Name | Purpose |
|---|---|---|
| Lambda | `taxflowai-backend-UsersFunction-LheGu0SfGlne` | Auth, users, push routes |
| Lambda | `taxflowai-backend-DocumentsFunction-49RHO9Lz4hT5` | Document management |
| Lambda | `taxflowai-backend-AuthFunction-*` | Authentication |
| Lambda | `taxflowai-backend-NotificationsFunction-*` | Email notifications |
| API Gateway | `vpkpe98ucc` (taxflowai-backend) | Routes to all Lambdas |
| Amplify | `d2gxcp91k7yq8u` | Web frontend hosting |
| SQS | `taxflowai-extraction` | Async document processing |
| S3 | `aws-sam-cli-managed-default-*` | Lambda deployment artifacts |

### DNS (Route 53 — isaloumapps.com)
| Record | Type | Points To |
|---|---|---|
| `www.isaloumapps.com` | CNAME | `d3a9la5gxt2rw7.cloudfront.net` (Amplify) |
| `isaloumapps.com` | A (ALIAS) | `d3a9la5gxt2rw7.cloudfront.net` (Amplify) |
| `api.isaloumapps.com` | A (ALIAS) | API Gateway custom domain |

### Environment Variables (UsersFunction Lambda)
| Key | Value |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL (pgbouncer) |
| `JWT_SECRET` | Set |
| `VAPID_PUBLIC_KEY` | Set (March 2026) |
| `VAPID_PRIVATE_KEY` | Set (March 2026) |
| `VAPID_EMAIL` | notifications@isaloumapps.com |
| `STRIPE_SECRET_KEY` | Set |
| `SES_EMAIL` | notifications@isaloumapps.com |
| `OPENAI_API_KEY` | Set |

---

## 📱 Mobile Build Status

| Platform | Version | Build | Status |
|---|---|---|---|
| Android | 1.0.0 (build 2) | EAS — `e2d4892c` | 🔄 Queued (Mar 5 2026) |
| iOS | 1.0.0 (build 2) | EAS — `94a82b0b` | 🔄 Waiting for Android |

**Expo project**: `@isaloum85/taxflowai` (ID: `1d895c0d-ec59-4a18-8e7e-528a557f19dd`)
**Apple Team**: QV66C78N58 (Ihab Saloum — Individual)
**Bundle ID**: `com.isaloumapps.taxflowai`
**APNs Push Key**: Created March 5, 2026 ✅

---

## 📊 Store Status (March 15, 2026)

| Platform | Status | Version | Notes |
|---|---|---|---|
| iOS App Store | ✅ Live | v1.2 (build 9) | Approved & live. Auto-released. |
| Google Play | ⏳ Closed Testing | v1.1.0 (build 7) | Need 12 Android testers opted-in × 14 days |
| Privacy Policy | ✅ Live | — | https://www.isaloumapps.com/privacy-policy |

### Known Bugs
| Bug | Status | Fix | Commit |
|---|---|---|---|
| Login screen twitching on every keystroke | ✅ Fixed | Removed ScrollView, added autoCorrect=false | 02ff8dc |
| Wrong launch image (grid/crosshair shows for 1s) | ✅ Fixed | Replaced splash-icon.png with branded 1284×2778px image | 7333951 |

---

## 🚀 Recent Changes (March 2026)

### Bug Fixes
- Fixed upload confirm URL 404 (`/documents/documents/:id/confirm`)
- Fixed progress bar showing empty (field `completeness` → `completenessScore`)
- Fixed dashboard stale data (added `useFocusEffect` for auto-refresh)
- Fixed upload year selector always defaulting to current year
- Fixed web frontend hiding years older than 5 years (removed `minYear` filter)

### New Features
- **Push notifications** — full stack: Expo (mobile) + Web Push (browser) + backend
- **Delete documents** — clients can delete uploaded docs with confirmation
- **Year selector in upload** — choose any year back 7 years
- **VAPID keys** deployed to Lambda

### Infrastructure
- Identified active Lambdas (`taxflowai-backend-*` not `-production-*`)
- Verified GitHub Actions auto-deploys backend on `backend/**` changes
- Verified Amplify auto-deploys web on `frontend/**` changes
- VAPID keys added to Lambda environment

### March 15, 2026
- iOS v1.2 submitted and **approved same day** ✅
- Branded splash screen generated (1284×2778px, #1E40AF + centered logo)
- Login twitching fix confirmed live
- BillingFunction added to template.yaml + all Stripe env vars deployed
- Stripe products created in CAD: $12/client/year + $3,500 onboarding
- Stripe webhook configured for 4 events
- Billing API live and auth-protected

---

## 💳 Stripe Billing (March 15, 2026)

| Item | Status |
|---|---|
| Stripe products created | ✅ Annual Plan ($12 CAD/client/year) + Onboarding ($3,500 CAD one-time) |
| Annual Plan Price ID | `price_1TBPzpE9neqrFM5LdI0W68fn` |
| Onboarding Price ID | `price_1TBQ1HE9neqrFM5Lvuo7Jo5P` |
| Webhook endpoint | ✅ Created → `https://vpkpe98ucc.execute-api.us-east-1.amazonaws.com/prod/billing/webhook` |
| BillingFunction deployed | ✅ `taxflowai-backend-BillingFunction-ifZyhkP8eQiN` |
| Stripe env vars in Lambda | ✅ All set |
| Billing API live | ✅ `/prod/billing/status` returns `"Access token required"` (correct) |
| Stripe secret key rotation | ⚠️ PENDING — key was accidentally shared in chat, must rotate immediately |

---

## ⏳ Pending / Next Steps (priority order)

- [ ] **Rotate Stripe secret key** — Stripe dashboard → Developers → API keys → Secret key → `...` → Rotate key
- [ ] **Find 12 Android testers** — post in r/androidapps on Reddit
- [ ] **Build Android v1.2.0** — `cd mobile && eas build --platform android --profile production`
- [ ] **Get 5 paying accountants** — LinkedIn / email cold outreach
- [ ] **Wait 14 days** with 12 Android testers opted-in → apply for Google Play Production

---

## 🔐 Secrets Location

All production secrets are in:
- **AWS Lambda env vars** (via AWS Console or SAM deploy)
- **GitHub Secrets** (for CI/CD deploys): `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `DATABASE_URL`, `JWT_SECRET`, `STRIPE_*`, `OPENAI_API_KEY`

---

**Maintained by**: Ihab Saloum
**Built with**: Claude AI (Anthropic)
