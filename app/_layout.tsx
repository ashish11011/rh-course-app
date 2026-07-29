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
import { setCredentials } from '@/store/authSlice';
import * as SecureStore from 'expo-secure-store';
import api from '@/lib/api';
import { tryCatch } from '@/lib/apiUtils';
import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { requestUserPermission, getFCMToken, setupNotificationListeners } from '@/lib/notifications';
import { useNetInfo } from '@react-native-community/netinfo';
import OfflineScreen from '@/components/OfflineScreen';
import * as ScreenCapture from 'expo-screen-capture';

// Register background handler early
if (Platform.OS !== 'web') {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });
}

export {
  ErrorBoundary,
} from 'expo-router';

function AppContent() {
  const { colorScheme } = useColorScheme();
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
  const netInfo = useNetInfo();

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
          await requestUserPermission();
          await getFCMToken();
        }
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          dispatch(setCredentials({ token }));
          const { data: userRes, rawError } = await tryCatch(
            () => api.get('/api/auth/mobile/user'),
            'Failed to fetch user profile'
          );
          if (rawError) {
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

  if (!isReady) {
    return null; // Or a splash screen
  }

  if (netInfo.isConnected === false) {
    return <OfflineScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#0a0a0a' : '#ffffff' }}>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ 
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colorScheme === 'dark' ? '#0a0a0a' : '#ffffff' }
        }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
        <PortalHost />
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
