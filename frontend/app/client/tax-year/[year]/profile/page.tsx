import ProfileClient from './ProfileClient';

export function generateStaticParams() {
  return [2020, 2021, 2022, 2023, 2024, 2025, 2026].map((year) => ({ year: String(year) }));
}

export default function ProfilePage() {
  return <ProfileClient />;
}
