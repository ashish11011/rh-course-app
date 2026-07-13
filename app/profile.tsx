import React, { useState, useEffect } from 'react';
import { View, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';
import api from '@/lib/api';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const token = useSelector((state: any) => state.auth.token);

  const [name, setName] = useState(user?.name || '');
  const [number, setNumber] = useState(user?.number || user?.mobileNumber || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [instituteName, setInstituteName] = useState(user?.instituteName || '');
  const [city, setCity] = useState(user?.city || '');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setNumber(user.number || user.mobileNumber || '');
      setDesignation(user.designation || '');
      setInstituteName(user.instituteName || '');
      setCity(user.city || '');
    }
  }, [user]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = {
        name,
        number,
        designation,
        instituteName,
        city,
      };

      await api.put('/api/auth/mobile/user', payload);
      
      // Update local redux state
      const updatedUser = { ...user, ...payload, mobileNumber: payload.number };
      dispatch(setCredentials({ token, user: updatedUser }));
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Update Failed', error?.response?.data?.error || error?.response?.data?.message || 'Something went wrong');
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
            <Text className="text-3xl font-bold dark:text-white">Profile</Text>
            <Text className="mt-2 text-gray-500 dark:text-gray-400">Manage your account details</Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</Text>
              <Input 
                placeholder="Full Name" 
                value={name}
                onChangeText={setName}
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</Text>
              <Input 
                placeholder="Email" 
                value={user?.email || ''}
                editable={false}
                className="bg-gray-100 text-gray-500 dark:bg-neutral-800"
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</Text>
              <Input 
                placeholder="Phone Number" 
                value={number}
                onChangeText={setNumber}
                keyboardType="phone-pad"
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Designation</Text>
              <Input 
                placeholder="e.g. Student, Doctor, etc." 
                value={designation}
                onChangeText={setDesignation}
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Institute Name</Text>
              <Input 
                placeholder="Your Institute Name" 
                value={instituteName}
                onChangeText={setInstituteName}
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">City</Text>
              <Input 
                placeholder="Your City" 
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>

          <TouchableOpacity 
            className={`mt-10 w-full items-center justify-center rounded-lg bg-green-700 py-3 ${loading ? 'opacity-70' : ''}`}
            activeOpacity={0.8}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-lg font-semibold text-white">Save Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            className="mt-6 self-center"
            onPress={() => router.back()}
          >
            <Text className="font-semibold text-gray-600 dark:text-gray-400">Cancel</Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
