import { getApp } from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  hasPermission,
  onMessage,
  requestPermission,
} from '@react-native-firebase/messaging';
import { Linking, PermissionsAndroid, Platform } from 'react-native';

function getAppMessaging() {
  return getMessaging(getApp());
}

function isMessagingPermissionGranted(status: number) {
  return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
}

export async function hasNotificationPermission() {
  if (Platform.OS === 'ios') {
    const currentStatus = await hasPermission(getAppMessaging());
    return isMessagingPermissionGranted(currentStatus);
  }

  if (Platform.OS === 'android') {
    const androidVersion = Number(Platform.Version);
    if (!Number.isFinite(androidVersion) || androidVersion < 33) {
      return true;
    }

    return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }

  return false;
}

async function requestIosNotificationPermission() {
  const currentStatus = await hasPermission(getAppMessaging());
  if (isMessagingPermissionGranted(currentStatus)) {
    return true;
  }

  const nextStatus = await requestPermission(getAppMessaging());
  return isMessagingPermissionGranted(nextStatus);
}

async function requestAndroidNotificationPermission() {
  const androidVersion = Number(Platform.Version);
  if (!Number.isFinite(androidVersion) || androidVersion < 33) {
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
  const hasNotificationPermission = await PermissionsAndroid.check(permission);
  if (hasNotificationPermission) {
    return true;
  }

  const result = await PermissionsAndroid.request(permission, {
    title: 'Enable notifications',
    message:
      'Allow RH Healthcare to send important updates about courses, workshops, certificates, and your account.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now',
  });

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export async function requestUserPermission() {
  if (Platform.OS === 'ios') {
    return requestIosNotificationPermission();
  }

  if (Platform.OS === 'android') {
    return requestAndroidNotificationPermission();
  }

  return false;
}

export function openNotificationSettings() {
  return Linking.openSettings();
}

export async function getFCMToken() {
  try {
    const token = await getToken(getAppMessaging());
    return token;
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to get FCM token', error);
    }
  }
}

export function setupNotificationListeners() {
  const unsubscribe = onMessage(getAppMessaging(), async () => {
  });

  return unsubscribe;
}
