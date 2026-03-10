export const metadata = {
  title: 'Privacy Policy – TaxFlowAI',
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'sans-serif', color: '#111' }}>
      <h1>Privacy Policy</h1>
      <p><strong>Last updated: March 10, 2026</strong></p>

      <p>TaxFlowAI (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our web and mobile application.</p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li><strong>Account information:</strong> name, email address, phone number, province, and language preference.</li>
        <li><strong>Tax documents:</strong> files you upload (T4, T5, etc.) for the purpose of tax preparation and review.</li>
        <li><strong>Payment information:</strong> processed securely via Stripe. We do not store credit card numbers.</li>
        <li><strong>Device information:</strong> push notification tokens for sending you updates about your tax files.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide and manage tax document services.</li>
        <li>To communicate with you about your files, including push notifications and emails.</li>
        <li>To process payments for our subscription plans.</li>
        <li>To improve our AI-powered document classification and extraction.</li>
      </ul>

      <h2>3. Data Sharing</h2>
      <p>We do not sell your personal data. We share data only with trusted service providers necessary to operate the platform.</p>
      <ul>
        <li><strong>Supabase</strong> – database and authentication.</li>
        <li><strong>AWS</strong> – cloud infrastructure and file storage.</li>
        <li><strong>Stripe</strong> – payment processing.</li>
        <li><strong>OpenAI</strong> – document classification (document content may be processed).</li>
      </ul>

      <h2>4. Data Retention</h2>
      <p>We retain your data for as long as your account is active or as required by law. You may request deletion of your account and data by contacting us.</p>

      <h2>5. Security</h2>
      <p>We use industry-standard security measures including encrypted connections (HTTPS), JWT authentication, and access controls to protect your data.</p>

      <h2>6. Your Rights</h2>
      <p>You have the right to access, correct, or delete your personal information. To exercise these rights, contact us at the email below.</p>

      <h2>7. Children&apos;s Privacy</h2>
      <p>TaxFlowAI is not intended for use by children under the age of 13. We do not knowingly collect data from children.</p>


      <h2>8. Changes to This Policy</h2>
      <p>We may update this policy from time to time. We will notify you of significant changes via email or in-app notification.</p>

      <h2>9. Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, please contact us at:<br />
        <strong>Email:</strong> <a href="mailto:support@isaloumapps.com">support@isaloumapps.com</a>
      </p>
    </main>
  );
}
