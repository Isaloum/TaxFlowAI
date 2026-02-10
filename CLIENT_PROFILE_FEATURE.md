# Client Profile Questionnaire Feature

## Overview

This feature adds a client profile questionnaire to collect data needed by the rules engine. Before uploading documents, clients answer questions about their income sources, deductions, and family situation. The system then provides a personalized checklist of required documents.

## Components Added

### Frontend

1. **ProfileQuestionnaire Component** (`frontend/components/client/ProfileQuestionnaire.tsx`)
   - Collects profile data through a form with three sections:
     - Income Sources (employment, self-employment, investment, rental)
     - Deductions & Credits (RRSP, childcare, tuition, medical, donations, home office, moving)
     - Family Situation (marital status, dependents, number of children)
   - Saves profile data via `APIClient.updateProfile()`

2. **Profile Page** (`frontend/app/client/tax-year/[year]/profile/page.tsx`)
   - Dedicated route for completing/updating the profile questionnaire
   - Loads existing profile data if available
   - Redirects to tax year page after completion

3. **Updated Tax Year Page** (`frontend/app/client/tax-year/[year]/page.tsx`)
   - Shows yellow warning banner if profile is not completed
   - "Complete Profile" button navigates to profile questionnaire
   - Banner disappears once profile is saved

### Backend

1. **Income Source Rules** (`backend/src/services/rules/quebec-rules.ts`)
   - `EMPLOYMENT_T4`: Requires T4 if `has_employment_income` is true
   - `SELF_EMPLOYMENT_T2125`: Requires T2125 if `has_self_employment` is true
   - `INVESTMENT_T5`: Requires T5 if `has_investment_income` is true

2. **Rules Engine Integration** (`backend/src/services/rules/rules-engine.service.ts`)
   - New method `validateIncomeSourceRules()` checks profile-based income rules
   - Integrated into main validation flow
   - Skips validation if profile data is missing
   - Re-validates automatically when profile is updated

3. **API Enhancement** (`backend/src/controllers/validation.controller.ts`)
   - `getCompleteness()` endpoint now returns `taxYear.profile` in response
   - Enables frontend to load existing profile data

## User Flow

1. **Client creates/accesses a tax year**
   - Sees yellow warning: "⚠️ Complete your profile first"
   - Clicks "Complete Profile" button

2. **Client fills questionnaire**
   - Checks income sources they have
   - Checks deductions they want to claim
   - Provides family information
   - Clicks "Save & Continue"

3. **Profile is saved and validated**
   - POST `/api/client/tax-years/:year/update-profile`
   - Profile stored in `tax_years.profile` JSON column
   - Rules engine runs validation with new profile
   - Response includes validation results

4. **Client sees personalized checklist**
   - System shows which documents are required
   - Example: Checked "Employment income" → "Missing T4"
   - Example: Checked "RRSP contributions" → "Missing RRSP_RECEIPT"
   - Warning banner disappears

5. **Client uploads documents**
   - Uploads required documents
   - Validation updates automatically
   - Completeness score increases

## Testing the Feature

### Manual Testing

1. **Setup**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run db:push
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm install
   npm run dev
   ```

2. **Test Profile Creation**
   - Navigate to `/client/tax-year/2024`
   - Verify yellow warning appears
   - Click "Complete Profile"
   - Fill out questionnaire:
     - Check "Employment income (T4/RL-1)"
     - Check "RRSP contributions"
     - Check "Married or common-law"
   - Click "Save & Continue"

3. **Verify Validation**
   - Check that warning banner disappears
   - Open browser DevTools > Network tab
   - Verify POST to `/api/client/tax-years/2024/update-profile` succeeded
   - Check validation results show:
     - "Employment income requires T4" (error/fail)
     - "RRSP contributions require contribution receipts" (error/fail)

4. **Test Document Upload**
   - Upload a T4 document
   - Verify validation updates
   - Check that T4 requirement changes from "fail" to "pass"

### API Testing

```bash
# Get completeness with profile
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/client/tax-years/2024/completeness

# Update profile
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "has_employment_income": true,
    "has_rrsp_contributions": true,
    "is_married": true
  }' \
  http://localhost:3001/api/client/tax-years/2024/update-profile
```

## Validation Rules

### Profile-Triggered Rules

| Rule Code | Trigger Condition | Required Document | Severity |
|-----------|------------------|-------------------|----------|
| EMPLOYMENT_T4_REQUIRED | has_employment_income = true | T4 | error |
| SELF_EMPLOYMENT_T2125_REQUIRED | has_self_employment = true | T2125 | error |
| INVESTMENT_T5_REQUIRED | has_investment_income = true | T5 | warning |
| RRSP_RECEIPT_REQUIRED | has_rrsp_contributions = true | RRSP_RECEIPT | error |
| CHILDCARE_RECEIPT_REQUIRED | has_childcare_expenses = true | CHILDCARE_RECEIPT | error |
| QUEBEC_CHILDCARE_RL24_REQUIRED | has_childcare_expenses = true AND province = QC | RL24 | error |
| MEDICAL_RECEIPTS_REQUIRED | has_medical_expenses = true | MEDICAL_RECEIPT | warning |
| DONATION_RECEIPTS_REQUIRED | has_donations = true | DONATION_RECEIPT | error |
| HOME_OFFICE_T2200_REQUIRED | claims_home_office = true | T2200 | error |

## Profile Data Structure

```typescript
interface TaxYearProfile {
  // Income sources
  has_employment_income: boolean;
  has_self_employment: boolean;
  has_investment_income: boolean;
  has_rental_income: boolean;
  
  // Deductions & credits
  has_rrsp_contributions: boolean;
  has_childcare_expenses: boolean;
  has_tuition: boolean;
  has_medical_expenses: boolean;
  has_donations: boolean;
  claims_home_office: boolean;
  has_moving_expenses: boolean;
  
  // Family situation
  is_married: boolean;
  has_dependents: boolean;
  num_children: number;
}
```

## Benefits

1. **Personalized Experience**: Clients only see requirements relevant to their situation
2. **Early Validation**: Identifies missing documents before client starts uploading
3. **Better UX**: Clear guidance on what documents are needed
4. **Reduced Errors**: Prevents submission with incomplete documentation
5. **Efficient Review**: Accountants receive more complete submissions

## Future Enhancements

- Add more profile questions (province, homeowner status, etc.)
- Support for provincial-specific questions
- Progress indicators showing profile completion
- Ability to save partial profile and return later
- Tooltips explaining each question
- Validation rules based on combinations of profile fields
