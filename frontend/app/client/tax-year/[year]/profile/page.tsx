'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProfileQuestionnaire from '@/components/client/ProfileQuestionnaire';
import { APIClient } from '@/lib/api-client';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const year = parseInt(params.year as string);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [year]);

  const loadProfile = async () => {
    try {
      const data = await APIClient.getCompleteness(year);
      setProfile(data.taxYear?.profile || null);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    router.push(`/client/tax-year/${year}`);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <ProfileQuestionnaire year={year} initialProfile={profile} onComplete={handleComplete} />
    </div>
  );
}
