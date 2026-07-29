import React, { useState } from 'react';
import {
  View,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { router } from 'expo-router';
import api from '@/lib/api';
import { tryCatch } from '@/lib/apiUtils';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
      const { error, rawError } = await tryCatch(
        () => api.post('/api/auth/mobile/signup', { name, email, password, phone }),
        'Signup failed'
      );

      if (error) {
        console.log(rawError);
        Alert.alert('Signup Failed', error);
        return;
      }

      // Proceed to OTP verification screen
      router.push({ pathname: '/(auth)/verify-otp', params: { email } });
    } catch (error) {
      console.log(error);
      Alert.alert('Signup Failed', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <KeyboardAwareScrollView 
        className="flex-1 px-6" 
        contentContainerClassName="pt-12 pb-40 flex-grow"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={120}
        extraHeight={120}
      >
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
              placeholder="Phone (Optional)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
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
        </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
