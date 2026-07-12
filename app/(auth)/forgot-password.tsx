import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { router } from 'expo-router';
import api from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    try {
      // Mock API call - Replace with your actual backend endpoint
      // await api.post('/auth/forgot-password', { email });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStep(2);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword) {
      Alert.alert('Error', 'Please enter the code and new password');
      return;
    }
    setLoading(true);
    try {
      // Mock API call - Replace with your actual backend endpoint
      // await api.post('/auth/reset-password', { email, code, newPassword });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Password reset successfully!', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to reset password');
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
          <Text className="text-3xl font-bold dark:text-white">Reset Password</Text>
          <Text className="mt-2 text-gray-500 dark:text-gray-400">
            {step === 1
              ? 'Enter your email to receive a reset code'
              : 'Enter the code and your new password'}
          </Text>
        </View>

        {step === 1 ? (
          <>
            <View className="gap-4">
              <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity
              className={`mt-8 w-full items-center justify-center rounded-lg bg-green-700 py-2 ${loading ? 'opacity-70' : ''}`}
              activeOpacity={0.8}
              onPress={handleSendCode}
              disabled={loading}>
              <Text className="text-lg font-semibold text-white">
                {loading ? 'Sending...' : 'Send Reset Code'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View className="gap-4">
              <Input
                placeholder="Reset Code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
              />
              <Input
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              className={`mt-8 w-full items-center justify-center rounded-lg bg-green-700 py-2 ${loading ? 'opacity-70' : ''}`}
              activeOpacity={0.8}
              onPress={handleResetPassword}
              disabled={loading}>
              <Text className="text-lg font-semibold text-white">
                {loading ? 'Resetting...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity className="mt-6 self-center" onPress={() => router.back()}>
          <Text className="font-semibold text-gray-600 dark:text-gray-400">Back to Sign In</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
