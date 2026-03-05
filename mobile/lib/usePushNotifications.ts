import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

// Show notifications even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    registerForPushNotifications();

    // Handle notification received in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Push received:', notification);
    });

    // Handle notification tap
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Push tapped:', response);
      // Could navigate to a specific screen here based on response.notification.request.content.data
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
}

async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return;
  }

  // Request permission
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return;
  }

  // Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'TaxFlowAI',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1E40AF',
    });
  }

  // Get Expo push token
  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: '1d895c0d-ec59-4a18-8e7e-528a557f19dd',
    });
    console.log('Expo push token:', token);
    // Register with backend
    await api.post('/users/push/expo', { token });
  } catch (err) {
    console.warn('Failed to get/register push token:', err);
  }
}
