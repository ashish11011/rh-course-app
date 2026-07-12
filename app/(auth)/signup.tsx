import React, { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { router } from 'expo-router';
import api from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Mock API call - Replace with your actual backend endpoint
      // const response = await api.post('/auth/signup', { name, email, password });

      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Proceed to OTP verification screen
      router.push({ pathname: '/(auth)/verify-otp', params: { email } });
    } catch (error: any) {
      Alert.alert('Signup Failed', error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView className="flex-1 px-6" contentContainerClassName="py-12">
          <View className="mb-10">
            <Text className="text-3xl font-bold dark:text-white">Create Account</Text>
            <Text className="mt-2 text-gray-500 dark:text-gray-400">Sign up to get started</Text>
          </View>

          <View className="gap-4">
            <Input placeholder="Full Name" value={name} onChangeText={setName} />
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
            <Input
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className={`mt-8 w-full items-center justify-center rounded-lg bg-green-700 py-2 ${loading ? 'opacity-70' : ''}`}
            activeOpacity={0.8}
            onPress={handleSignup}
            disabled={loading}>
            <Text className="text-lg font-semibold text-white">
              {loading ? 'Creating account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <View className="mt-8 flex-row justify-center">
            <Text className="text-gray-600 dark:text-gray-400">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="font-semibold text-blue-600">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
