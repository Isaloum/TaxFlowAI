export default function PrivacyPolicy() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px", fontFamily: "sans-serif", color: "#111" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>Last updated: March 13, 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>1. Who We Are</h2>
        <p>TaxFlowAI is a Canadian tax document management application operated by Ihab Saloum. We help accountants and their clients securely manage tax documents.</p>
        <p style={{ marginTop: 8 }}>Contact: <a href="mailto:ihabsaloum85@gmail.com" style={{ color: "#2563eb" }}>ihabsaloum85@gmail.com</a></p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>2. Information We Collect</h2>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
          <li><strong>Account information:</strong> name, email address, and password (hashed)</li>
          <li><strong>Tax documents:</strong> files you upload (T4, T5, and other Canadian tax forms)</li>
          <li><strong>Usage data:</strong> login timestamps, document upload activity</li>
          <li><strong>Payment information:</strong> processed securely by Stripe — we do not store card numbers</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>3. How We Use Your Information</h2>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
          <li>To provide and operate the TaxFlowAI service</li>
          <li>To authenticate your account and keep it secure</li>
          <li>To allow accountants to review documents uploaded by their clients</li>
          <li>To send transactional emails (e.g. password resets) via AWS SES</li>
          <li>To process subscription payments via Stripe</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>4. Data Storage &amp; Security</h2>
        <p>Your data is stored on secure infrastructure including AWS S3 (documents) and a PostgreSQL database hosted on Supabase. All data is encrypted in transit (TLS) and at rest. We do not sell your data to third parties.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>5. Data Sharing</h2>
        <p>We do not sell or rent your personal information. We share data only with:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
          <li><strong>Your accountant</strong> — who you are directly linked to within the app</li>
          <li><strong>AWS</strong> — for document storage and email delivery</li>
          <li><strong>Stripe</strong> — for payment processing</li>
          <li><strong>Supabase</strong> — for database hosting</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>6. Advertising</h2>
        <p>TaxFlowAI does not use advertising SDKs and does not collect or share advertising identifiers.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>7. Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at <a href="mailto:ihabsaloum85@gmail.com" style={{ color: "#2563eb" }}>ihabsaloum85@gmail.com</a>. We will respond within 30 days.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>8. Children&apos;s Privacy</h2>
        <p>TaxFlowAI is not intended for users under the age of 18. We do not knowingly collect personal information from minors.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>9. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify users of significant changes via email or in-app notice.</p>
      </section>

      <section>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>10. Contact</h2>
        <p>For any privacy-related questions, contact us at:<br />
        <a href="mailto:ihabsaloum85@gmail.com" style={{ color: "#2563eb" }}>ihabsaloum85@gmail.com</a></p>
      </section>
    </main>
  );
}
