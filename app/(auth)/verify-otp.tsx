import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      // Mock API call - Replace with your actual backend endpoint
      // const response = await api.post('/auth/verify', { email, code: otp });
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Account verified successfully!', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error: any) {
      Alert.alert('Verification Failed', error?.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <View className="mb-10">
          <Text className="text-3xl font-bold dark:text-white">Verify Account</Text>
          <Text className="mt-2 text-gray-500 dark:text-gray-400">
            Enter the 6-digit code sent to {email || 'your email'}
          </Text>
        </View>

        <View className="gap-4">
          <Input 
            placeholder="Verification Code" 
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <TouchableOpacity 
          className={`mt-8 w-full items-center justify-center rounded-lg bg-blue-600 py-4 ${loading ? 'opacity-70' : ''}`}
          activeOpacity={0.8}
          onPress={handleVerify}
          disabled={loading}
        >
          <Text className="text-lg font-semibold text-white">
            {loading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="mt-6 self-center"
          onPress={() => router.back()}
        >
          <Text className="font-semibold text-gray-600 dark:text-gray-400">Back</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
