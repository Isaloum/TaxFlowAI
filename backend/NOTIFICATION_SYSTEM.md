# Notification System

This document describes the notification system implemented in TaxFlowAI to enable communication between clients and accountants.

## Overview

The notification system provides real-time alerts via email and SMS for key events in the tax document workflow:
- Document uploads
- Document rejections
- Client submissions
- Daily digest for accountants

## Architecture

### Components

1. **Email Service** (`src/services/notifications/email.service.ts`)
   - Uses Resend API for email delivery
   - Supports HTML email templates
   - Handles all email notifications

2. **SMS Service** (`src/services/notifications/sms.service.ts`)
   - Uses Twilio API for SMS delivery
   - Supports urgent notifications
   - Gracefully degrades if not configured

3. **Notification Service** (`src/services/notifications/notification.service.ts`)
   - Orchestrates email and SMS notifications
   - Logs all notifications to database
   - Respects user notification preferences

4. **Daily Digest Cron** (`src/jobs/daily-digest.cron.ts`)
   - Runs daily at 8 AM (server local time)
   - Sends digest to accountants with pending reviews
   - Can be disabled per accountant

### Database Schema

#### Client Model Extensions
```prisma
model Client {
  // ... existing fields
  emailNotifications Boolean @default(true)
  smsNotifications   Boolean @default(false)
}
```

#### Accountant Model Extensions
```prisma
model Accountant {
  // ... existing fields
  emailNotifications Boolean @default(true)
  smsNotifications   Boolean @default(true)
  dailyDigest        Boolean @default(true)
}
```

#### NotificationLog Model
```prisma
model NotificationLog {
  id          String   @id @default(uuid())
  recipientId String
  type        String   // email, sms
  channel     String   // document_uploaded, document_rejected, etc.
  status      String   // sent, failed
  sentAt      DateTime @default(now())
  metadata    Json     @default("{}")
}
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@taxflowai.com

# SMS (Twilio) - Optional
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL for links in emails
FRONTEND_URL=http://localhost:3000
```

### Getting API Keys

#### Resend (Required for Email)
1. Sign up at https://resend.com
2. Create an API key from the dashboard
3. Add domain verification for production use

#### Twilio (Optional for SMS)
1. Sign up at https://twilio.com
2. Get Account SID and Auth Token from console
3. Purchase a phone number for sending SMS

## Notification Events

### 1. Document Uploaded
**Trigger:** Client uploads a document
**Recipient:** Client
**Channel:** Email
**When:** Immediately after successful upload

### 2. Document Rejected
**Trigger:** Accountant rejects a document
**Recipient:** Client
**Channel:** Email + SMS (if enabled)
**When:** Immediately after rejection

### 3. Submission Ready
**Trigger:** Client submits documents for review via `POST /api/client/tax-years/:year/submit`
**Recipient:** Accountant
**Channel:** Email + SMS (if enabled)
**When:** Immediately after submission

### 4. Daily Digest
**Trigger:** Scheduled cron job
**Recipient:** Accountants with `dailyDigest` enabled
**Channel:** Email
**When:** Daily at 8 AM server time

## API Endpoints

### Submit Documents for Review
```http
POST /api/client/tax-years/:year/submit
Authorization: Bearer <client-token>
```

Marks the tax year as submitted and notifies the accountant.

**Response:**
```json
{
  "message": "Submitted successfully"
}
```

## Usage Examples

### Sending Document Upload Notification

```typescript
import { NotificationService } from './services/notifications/notification.service';

// After document upload
await NotificationService.notifyDocumentUploaded(
  clientId,
  'T4',
  2024
);
```

### Sending Document Rejection Notification

```typescript
// After document rejection
await NotificationService.notifyDocumentRejected(
  documentId,
  'The T4 slip appears to be from 2023, not 2024. Please upload the correct year.'
);
```

### Sending Submission Notification

```typescript
// When client submits documents
await NotificationService.notifyAccountantSubmission(
  clientId,
  2024
);
```

### Sending Missing Documents Reminder

```typescript
// Manually trigger missing docs reminder
await NotificationService.sendMissingDocumentsReminder(
  clientId,
  2024
);
```

## Graceful Degradation

The notification system is designed to fail gracefully:

- If `RESEND_API_KEY` is not configured, email notifications are skipped with a warning
- If Twilio credentials are not configured, SMS notifications are skipped with a warning
- If user has disabled notifications in their preferences, notifications are skipped
- Failed notifications are logged to the database with status "failed"

## Testing

### Development Testing

For local development, you can:

1. Use Resend's test mode (emails are not actually sent)
2. Use Twilio's test credentials (SMS are not actually sent)
3. Check console logs for notification attempts
4. Query `notification_logs` table to verify logging

### Email Preview

When developing email templates, you can:
1. Send test emails to yourself
2. Use a service like Mailtrap for testing
3. View logs in Resend dashboard

## Monitoring

Monitor notification health by:

1. Checking `notification_logs` table for failed notifications
2. Reviewing application logs for warnings/errors
3. Monitoring Resend and Twilio dashboards for delivery rates
4. Setting up alerts for high failure rates

## Customization

### Email Templates

Email templates are defined in `src/services/notifications/email.service.ts`. To customize:

1. Edit the HTML in the respective method
2. Use inline CSS for styling (for email client compatibility)
3. Test across multiple email clients
4. Keep total email size under 102KB

### SMS Messages

SMS messages are defined in `src/services/notifications/sms.service.ts`. Keep messages:

- Under 160 characters for single SMS
- Clear and actionable
- Include app name for context

### Cron Schedule

To change the daily digest time, edit `src/jobs/daily-digest.cron.ts`:

```typescript
// Run at 9 AM instead of 8 AM
cron.schedule('0 9 * * *', async () => {
  // ...
});
```

**Note:** The schedule uses server local time. Configure your server's timezone appropriately.

## Troubleshooting

### Emails Not Sending

1. Verify `RESEND_API_KEY` is set correctly
2. Check Resend dashboard for API errors
3. Ensure domain is verified (for production)
4. Check application logs for error messages

### SMS Not Sending

1. Verify Twilio credentials are set
2. Check phone number format (E.164 format: +1234567890)
3. Verify Twilio phone number is purchased and active
4. Check Twilio console for error logs

### Notifications Not Logged

1. Verify database connection
2. Check that `notification_logs` table exists
3. Review application logs for database errors

## Future Enhancements

Potential improvements:

- [ ] Add in-app notifications
- [ ] Support notification templates in database
- [ ] Add notification preferences UI
- [ ] Support multiple languages
- [ ] Add retry logic for failed notifications
- [ ] Support batch notifications
- [ ] Add notification analytics dashboard
