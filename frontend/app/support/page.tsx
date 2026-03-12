export const metadata = {
  title: 'Support – TaxFlowAI',
};

export default function SupportPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'sans-serif', color: '#111' }}>
      <h1>Support</h1>
      <p>Need help with TaxFlowAI? We&apos;re here for you.</p>

      <h2>Contact Us</h2>
      <p>Email us at <a href="mailto:support@isaloumapps.com" style={{ color: '#2563eb' }}>support@isaloumapps.com</a> and we&apos;ll respond within 1 business day.</p>

      <h2>Frequently Asked Questions</h2>

      <h3>How do I upload tax documents?</h3>
      <p>Log in to the TaxFlowAI app, navigate to your document checklist, and tap the upload button next to each document type. We accept PDF, JPG, and PNG files.</p>

      <h3>How does my accountant receive my documents?</h3>
      <p>Once you upload a document, your accountant is notified immediately and can review it from their dashboard. You&apos;ll receive a notification when they approve or request changes.</p>

      <h3>Is my data secure?</h3>
      <p>Yes. All files are encrypted in transit and at rest. We use industry-standard security practices and never sell your data.</p>

      <h3>How do I reset my password?</h3>
      <p>On the login screen, tap &quot;Forgot password?&quot; and enter your email address. You&apos;ll receive a reset link within a few minutes.</p>

      <h3>How do I cancel my subscription?</h3>
      <p>Contact us at <a href="mailto:support@isaloumapps.com" style={{ color: '#2563eb' }}>support@isaloumapps.com</a> and we will cancel your subscription and confirm within 1 business day.</p>

      <h3>Which provinces are supported?</h3>
      <p>TaxFlowAI currently supports all Canadian provinces and territories.</p>

      <h2>App Version</h2>
      <p>For the latest version of TaxFlowAI, visit the <a href="https://apps.apple.com" style={{ color: '#2563eb' }}>App Store</a>.</p>
    </main>
  );
}
