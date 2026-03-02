import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../lib/auth';

function RootGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) router.replace('/(auth)/login');
    else if (user && inAuth) {
      if (user.role === 'accountant') router.replace('/(accountant)/clients');
      else router.replace('/(client)/dashboard');
    }
  }, [user, loading]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootGuard />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
