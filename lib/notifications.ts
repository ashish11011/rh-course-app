import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export async function requestUserPermission() {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  } else if (Platform.OS === 'android') {
    // For Android 13+ we should ideally request POST_NOTIFICATIONS permission
    // But @react-native-firebase/messaging handles basic permissions.
  }
}

export async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Failed to get FCM token', error);
  }
}

export function setupNotificationListeners() {
  // Listen to foreground notifications
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));
    // You can show a custom toast or alert here since background notifications don't automatically show in foreground
  });

  return unsubscribe;
}
