export const metadata = {
  title: 'Support – TaxFlowAI',
  description: 'Get help with TaxFlowAI. Contact our support team, browse FAQs, and find answers to common questions about your Canadian tax document management app.',
};

export default function SupportPage() {
  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#111827', lineHeight: 1.7 }}>

      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, background: '#1D4ED8', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 22 }}>📋</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 20, color: '#1D4ED8' }}>TaxFlowAI</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px', color: '#111827' }}>Support Center</h1>
        <p style={{ fontSize: 17, color: '#6B7280', margin: 0 }}>
          Have a question or need help? We&apos;re here for you — reach out any time.
        </p>
      </div>

      {/* Contact Card — prominent */}
      <div style={{ background: '#EFF6FF', border: '2px solid #BFDBFE', borderRadius: 16, padding: '32px 36px', marginBottom: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1E40AF', marginTop: 0, marginBottom: 8 }}>📬 Contact Support</h2>
        <p style={{ color: '#374151', margin: '0 0 20px' }}>
          Our support team responds to all inquiries within <strong>1 business day</strong>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>✉️</span>
            <div>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>Email (fastest response)</div>
              <a href="mailto:support@isaloumapps.com" style={{ color: '#2563EB', fontSize: 16, textDecoration: 'none', fontWeight: 500 }}>
                support@isaloumapps.com
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>🌐</span>
            <div>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>Web App</div>
              <a href="https://www.isaloumapps.com" style={{ color: '#2563EB', fontSize: 16, textDecoration: 'none', fontWeight: 500 }}>
                www.isaloumapps.com
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>🕐</span>
            <div>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>Support Hours</div>
              <span style={{ color: '#374151', fontSize: 15 }}>Monday – Friday, 9 AM – 6 PM EST</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #BFDBFE' }}>
          <p style={{ margin: 0, color: '#374151', fontSize: 14 }}>
            When emailing, please include your <strong>account email</strong> and a description of your issue so we can help you quickly.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#111827' }}>Frequently Asked Questions</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Account */}
          <div style={{ padding: '24px 0', borderTop: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>How do I create an account?</h3>
            <p style={{ margin: 0, color: '#4B5563', fontSize: 15 }}>
              Clients are invited by their accountant. Once your accountant adds you to TaxFlowAI, you&apos;ll receive an email with your temporary password and instructions to log in for the first time. Accountants can register at <a href="https://www.isaloumapps.com" style={{ color: '#2563EB' }}>www.isaloumapps.com</a>.
            </p>
          </div>

          <div style={{ padding: '24px 0', borderTop: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>How do I reset my password?</h3>
            <p style={{ margin: 0, color: '#4B5563', fontSize: 15 }}>
              On the login screen, tap <strong>&quot;Forgot password?&quot;</strong> and enter your email address. You&apos;ll receive a password reset link within a few minutes. Check your spam folder if it doesn&apos;t arrive. If you still have trouble, email us at <a href="mailto:support@isaloumapps.com" style={{ color: '#2563EB' }}>support@isaloumapps.com</a>.
            </p>
          </div>

          <div style={{ padding: '24px 0', borderTop: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>I can&apos;t log in — what should I do?</h3>
            <p style={{ margin: 0, color: '#4B5563', fontSize: 15 }}>
              First, double-check that you&apos;re using the same email address your accountant used to invite you. If your password isn&apos;t working, use the <strong>&quot;Forgot password?&quot;</strong> link on the login screen. If you&apos;re still locked out, contact us at <a href="mailto:support@isaloumapps.com" style={{ color: '#2563EB' }}>support@isaloumapps.com</a> and we&apos;ll restore access promptly.
            </p>
          </div>

          {/* Documents */}
          <div style={{ padding: '24px 0', borderTop: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>How do I upload tax documents?</h3>
            <p style={{ margin: 0, color: '#4B5563', fontSize: 15 }}>
              Log in to the TaxFlowAI app, navigate to your document checklist, and tap the upload button next to each required document. We accept <strong>PDF, JPG, and PNG</strong> files. Documents are encrypted and sent directly to your accountant.
            </p>
          </div>

          <div style={{ padding: '24px 0', borderTop: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>How does my accountant receive my documents?</h3>
            <p style={{ margin: 0, color: '#4B5563', fontSize: 15 }}>
              Once you upload a document, your accountant is notified immediately and can review it from their dashboard. You&apos;ll receive an in-app notification and email when they approve a document or request changes.
            </p>
          </div>

          <div style={{ padding: '24px 0', borderTop: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>What document types can I upload?</h3>
            <p style={{ margin: 0, color: '#4B5563', fontSize: 15 }}>
              TaxFlowAI supports all common Canadian tax documents including T4 (employment income), T5 (investment income), T3, RRSP receipts, charitable donation receipts, medical expense receipts, business income statements, and more. Your accountant customizes the checklist for your specific situation.
            </p>
          </div>

          <div style={{ padding: '24px 0', borderTop: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>A document I uploaded was rejected — what now?</h3>
            <p style={{ margin: 0, color: '#4B5563', fontSize: 15 }}>
              Your accountant will leave a note explaining what needs to be corrected. You&apos;ll receive a notification. Simply upload a corrected version of the document from the same checklist item. If you&apos;re unsure what&apos;s needed, reply to your accountant or email us at <a href="mailto:support@isaloumapps.com" style={{ color: '#2563EB' }}>support@isaloumapps.com</a>.
            </p>
          </div>

          {/* Security & Privacy */}
          <div style={{ padding: '24px 0', borderTop: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>Is my data secure?</h3>
            <p style={{ margin: 0, color: '#4B5563', fontSize: 15 }}>
              Yes. All files are encrypted in transit (TLS) and at rest (AES-256). We use AWS infrastructure and follow industry-standard security practices. We never sell your personal or financial data to third parties. Your documents are accessible only to you and your designated accountant.
            </p>
          </div>

          <div style={{ padding: '24px 0', borderTop: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>How do I delete my account and data?</h3>
            <p style={{ margin: 0, color: '#4B5563', fontSize: 15 }}>
              To request account deletion and removal of your personal data, email us at <a href="mailto:support@isaloumapps.com" style={{ color: '#2563EB' }}>support@isaloumapps.com</a> with the subject line <strong>&quot;Account Deletion Request&quot;</strong>. We will process your request within 5 business days.
            </p>
          </div>

          {/* Billing */}
          <div style={{ padding: '24px 0', borderTop: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>How does billing work?</h3>
            <p style={{ margin: 0, color: '#4B5563', fontSize: 15 }}>
              TaxFlowAI is billed to the accountant (not the client). Accountants subscribe to a plan that covers their entire client base. Clients use the app for free. For billing questions, accountants can contact us at <a href="mailto:support@isaloumapps.com" style={{ color: '#2563EB' }}>support@isaloumapps.com</a>.
            </p>
          </div>

          <div style={{ padding: '24px 0', borderTop: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>How do I cancel my subscription?</h3>
            <p style={{ margin: 0, color: '#4B5563', fontSize: 15 }}>
              Email us at <a href="mailto:support@isaloumapps.com" style={{ color: '#2563EB' }}>support@isaloumapps.com</a> with your account email and we will cancel your subscription and confirm within 1 business day. No cancellation fees apply.
            </p>
          </div>

          {/* General */}
          <div style={{ padding: '24px 0', borderTop: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>Which provinces are supported?</h3>
            <p style={{ margin: 0, color: '#4B5563', fontSize: 15 }}>
              TaxFlowAI supports all 10 Canadian provinces and 3 territories. Province-specific tax document requirements are built into each client&apos;s checklist automatically.
            </p>
          </div>

          <div style={{ padding: '24px 0', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>Is the app available on Android?</h3>
            <p style={{ margin: 0, color: '#4B5563', fontSize: 15 }}>
              TaxFlowAI is currently available on iOS (iPhone and iPad) via the App Store. Android support is planned for a future release. You can also access TaxFlowAI from any browser at <a href="https://www.isaloumapps.com" style={{ color: '#2563EB' }}>www.isaloumapps.com</a>.
            </p>
          </div>
        </div>
      </div>

      {/* App Store links */}
      <div style={{ background: '#F9FAFB', borderRadius: 16, padding: '28px 32px', marginBottom: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 12, color: '#111827' }}>Get the App</h2>
        <p style={{ color: '#4B5563', margin: '0 0 16px', fontSize: 15 }}>
          Download TaxFlowAI on your iPhone to upload documents and track your tax file on the go.
        </p>
        <a
          href="https://apps.apple.com/app/taxflowai/id6760155912"
          style={{ display: 'inline-block', background: '#111827', color: '#fff', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
        >
          Download on the App Store →
        </a>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 28, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
        <p style={{ margin: '0 0 6px' }}>TaxFlowAI · Canadian Tax Document Management</p>
        <p style={{ margin: 0 }}>
          Questions? Email <a href="mailto:support@isaloumapps.com" style={{ color: '#2563EB' }}>support@isaloumapps.com</a>
        </p>
      </div>
    </main>
  );
}
