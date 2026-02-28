import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { LanguageProvider } from '@/lib/i18n';
import VersionChecker from '@/components/VersionChecker';

export const metadata: Metadata = {
  title: 'TaxFlowAI - Canadian Tax Document Verification',
  description: 'Automated tax document completeness checker for Canadian accountants'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <VersionChecker />
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
