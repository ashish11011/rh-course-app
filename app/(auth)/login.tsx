import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';
import * as SecureStore from 'expo-secure-store';
import api from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      // Mock API call - Replace with your actual backend endpoint
      // const response = await api.post('/auth/login', { email, password });

      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockToken = 'mock_jwt_token_12345';
      const mockUser = { id: 1, email };

      // Save token securely
      await SecureStore.setItemAsync('userToken', mockToken);

      dispatch(setCredentials({ token: mockToken, user: mockUser }));

      // Navigate to tabs
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6">
        <View className="mb-10">
          <Text className="text-3xl font-bold dark:text-white">Welcome Back</Text>
          <Text className="mt-2 text-gray-500 dark:text-gray-400">Sign in to continue</Text>
        </View>

        <View className="gap-4">
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="mt-2 self-end py-2"
          onPress={() => router.push('/(auth)/forgot-password')}>
          <Text className="font-medium">Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`mt-6 w-full items-center justify-center rounded-lg bg-green-700 py-2 ${loading ? 'opacity-70' : ''}`}
          activeOpacity={0.8}
          onPress={handleLogin}
          disabled={loading}>
          <Text className="text-lg font-semibold text-white">
            {loading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <View className="mt-8 flex-row justify-center">
          <Text className="text-gray-600 dark:text-gray-400">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text className="font-semibold text-blue-600">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
