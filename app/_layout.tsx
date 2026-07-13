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
import { store } from '@/store';
import { setCredentials } from '@/store/authSlice';
import * as SecureStore from 'expo-secure-store';
import api from '@/lib/api';
import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { requestUserPermission, getFCMToken, setupNotificationListeners } from '@/lib/notifications';

// Register background handler early
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

export {
  ErrorBoundary,
} from 'expo-router';

function AppContent() {
  const { colorScheme } = useColorScheme();
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      try {
        await requestUserPermission();
        await getFCMToken();
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          dispatch(setCredentials({ token }));
          try {
            const userRes = await api.get('/api/auth/mobile/user');
            if (userRes.data?.user) {
              dispatch(setCredentials({ token, user: userRes.data.user }));
            }
          } catch (error) {
            console.error('Failed to fetch user profile', error);
          }
        }
      } catch (e) {
        console.error('Failed to load token');
      } finally {
        setIsReady(true);
      }
    };
    loadToken();

    const unsubscribe = setupNotificationListeners();
    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  if (!isReady) {
    return null; // Or a splash screen
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
