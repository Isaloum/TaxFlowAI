'use client';

import { useVersionCheck } from '@/hooks/useVersionCheck';

export default function VersionChecker() {
  useVersionCheck();
  return null;
}
