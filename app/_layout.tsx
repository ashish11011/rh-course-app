import 'react-native-gesture-handler';
import '@/global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from 'expo-router/react-navigation';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { Provider, useDispatch } from 'react-redux';
import { Platform } from 'react-native';
import { store } from '@/store';
import { logout, setCredentials } from '@/store/authSlice';
import * as SecureStore from 'expo-secure-store';
import api from '@/lib/api';
import { isInvalidTokenError, tryCatch } from '@/lib/apiUtils';
import { useEffect, useState } from 'react';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import {
  hasNotificationPermission,
  openNotificationSettings,
  requestUserPermission,
  getFCMToken,
  setupNotificationListeners,
} from '@/lib/notifications';
import { useNetInfo } from '@react-native-community/netinfo';
import OfflineScreen from '@/components/OfflineScreen';
import * as ScreenCapture from 'expo-screen-capture';
import { useMandatoryUpdate } from '@/src/hooks/useMandatoryUpdate';
import StartupLoadingScreen from '@/src/screens/StartupLoadingScreen';
import UpdateRequiredScreen from '@/src/screens/UpdateRequiredScreen';
import { NotificationPermissionSheet } from '@/components/NotificationPermissionSheet';

// Register background handler early
if (Platform.OS !== 'web') {
  setBackgroundMessageHandler(
    getMessaging(getApp()),
    async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
    }
  );
}

export { ErrorBoundary } from 'expo-router';

function AppContent() {
  const { colorScheme } = useColorScheme();
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
  const [notificationSheetMode, setNotificationSheetMode] = useState<'request' | 'settings'>(
    'request'
  );
  const [showNotificationSheet, setShowNotificationSheet] = useState(false);
  const netInfo = useNetInfo();
  const { isCheckingUpdate, updateRequired, config } = useMandatoryUpdate();

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    ScreenCapture.preventScreenCaptureAsync();

    return () => {
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, []);

  useEffect(() => {
    const loadToken = async () => {
      try {
        if (Platform.OS !== 'web') {
          const notificationsAllowed = await hasNotificationPermission();
          if (notificationsAllowed) {
            await getFCMToken();
          } else {
            setNotificationSheetMode('request');
            setShowNotificationSheet(true);
          }
        }
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          dispatch(setCredentials({ token }));
          const { data: userRes, rawError } = await tryCatch(
            () => api.get('/api/auth/mobile/user'),
            'Failed to fetch user profile'
          );
          if (rawError) {
            if (isInvalidTokenError(rawError)) {
              dispatch(logout());
              return;
            }
            console.error('Failed to fetch user profile', rawError);
          }
          if (userRes?.data?.user) {
            dispatch(setCredentials({ token, user: userRes.data.user }));
          }
        }
      } catch (e) {
        console.error('Failed to load token');
      } finally {
        setIsReady(true);
      }
    };
    loadToken();

    const unsubscribe = Platform.OS !== 'web' ? setupNotificationListeners() : undefined;
    return () => {
      unsubscribe?.();
    };
  }, [dispatch]);

  const handleAllowNotifications = async () => {
    const notificationsAllowed = await requestUserPermission();
    if (notificationsAllowed) {
      setShowNotificationSheet(false);
      await getFCMToken();
      return;
    }

    setNotificationSheetMode('settings');
    setShowNotificationSheet(true);
  };

  const handleOpenNotificationSettings = async () => {
    setShowNotificationSheet(false);
    try {
      await openNotificationSettings();
    } catch (error) {
      console.error('Failed to open notification settings', error);
    }
  };

  if (isCheckingUpdate) {
    return <StartupLoadingScreen />;
  }

  if (updateRequired) {
    return (
      <UpdateRequiredScreen
        message={
          config?.currentVersionMessage ||
          'Please update to the latest version to continue using the app.'
        }
        storeUrl={config?.storeUrl || ''}
      />
    );
  }

  if (!isReady) {
    return <StartupLoadingScreen />;
  }

  if (netInfo.isConnected === false) {
    return <OfflineScreen />;
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#0a0a0a' : '#ffffff' }}>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: colorScheme === 'dark' ? '#0a0a0a' : '#ffffff' },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
        <PortalHost />
        <NotificationPermissionSheet
          visible={showNotificationSheet}
          mode={notificationSheetMode}
          onAllow={handleAllowNotifications}
          onDismiss={() => setShowNotificationSheet(false)}
          onOpenSettings={handleOpenNotificationSettings}
        />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
