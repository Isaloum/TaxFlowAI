import { useEffect } from 'react';
import api from '@/lib/api-client';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export function usePushNotifications() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    registerWebPush();
  }, []);
}

async function registerWebPush() {
  try {
    // Register service worker
    const reg = await navigator.serviceWorker.register('/sw.js');

    // Ask for permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    // Get VAPID public key from backend
    const { data } = await api.get('/users/push/vapid-public');
    if (!data.key) return;

    // Unsubscribe any existing subscription (handles VAPID key rotation)
    const existing = await reg.pushManager.getSubscription();
    if (existing) await existing.unsubscribe();

    // Subscribe
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.key) as BufferSource,
    });

    // Send subscription to backend
    const json = sub.toJSON();
    await api.post('/users/push/web', {
      endpoint: json.endpoint,
      keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
    });

    console.log('Web push registered');
  } catch (err) {
    console.warn('Web push setup failed:', err);
  }
}
