import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { CreditCard, LogIn, RefreshCw } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { IdCardFormFlow } from '@/components/id-card/IdCardFormFlow';
import { IdCardView } from '@/components/id-card/IdCardView';
import { IdCardApiResponse, IdCardFormValues, UserCardRecord } from '@/components/id-card/types';
import api from '@/lib/api';
import { tryCatch } from '@/lib/apiUtils';
import { RootState } from '@/store';

const EMPTY_FORM_VALUES: IdCardFormValues = {
  fullName: '',
  mobileNumber: '',
  email: '',
  gender: '',
  bloodGroup: '',
  rhFactor: '',
  dateOfBirth: '',
  state: '',
  city: '',
  profession: '',
  qualification: '',
  organizationName: '',
  passportPhoto: '',
  passportPhotoUrl: '',
  referralCode: '',
  hearAboutRh: '',
  termsAccepted: false,
};

export default function IdCardScreen() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const [card, setCard] = useState<UserCardRecord | null>(null);
  const [defaults, setDefaults] = useState<Partial<IdCardFormValues>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchCard = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setErrorMessage('');
    const {
      data: response,
      error,
      rawError,
    } = await tryCatch(
      () => api.get<IdCardApiResponse>('/api/auth/mobile/id-card'),
      'Failed to fetch membership card'
    );

    if (error) {
      console.error(rawError);
      setErrorMessage(error);
    } else {
      setCard(response?.data?.card || null);
      setDefaults(response?.data?.defaults || {});
    }

    setLoading(false);
    setRefreshing(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCard();
  }, [fetchCard]);

  const initialValues = useMemo<IdCardFormValues>(
    () => ({
      ...EMPTY_FORM_VALUES,
      fullName: defaults.fullName || user?.name || '',
      mobileNumber: defaults.mobileNumber || user?.mobileNumber || user?.number || '',
      email: defaults.email || user?.email || '',
      city: defaults.city || user?.city || '',
      organizationName: defaults.organizationName || user?.instituteName || '',
    }),
    [defaults, user]
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCard();
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-neutral-950">
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
            <CreditCard size={30} color="#047857" />
          </View>
          <Text className="text-center text-2xl font-extrabold text-slate-950 dark:text-white">
            Membership Card
          </Text>
          <Text className="mt-3 text-center text-slate-500 dark:text-slate-400">
            Login to view or generate your RH Healthcare ID card.
          </Text>
          <Button
            className="mt-7 h-12 rounded-lg bg-emerald-700 px-6 active:bg-emerald-800"
            onPress={() => router.push('/(auth)/login' as any)}>
            <LogIn size={18} color="#ffffff" />
            <Text className="font-semibold text-white">Login</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-neutral-950">
        <IdCardLoadingSkeleton />
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-neutral-950">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-xl font-bold text-slate-950 dark:text-white">
            Could not load card
          </Text>
          <Text className="mt-3 text-center text-slate-500 dark:text-slate-400">
            {errorMessage}
          </Text>
          <Button
            className="mt-7 h-12 rounded-lg bg-emerald-700 px-6 active:bg-emerald-800"
            onPress={() => {
              setLoading(true);
              fetchCard();
            }}>
            <RefreshCw size={18} color="#ffffff" />
            <Text className="font-semibold text-white">Retry</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!card) {
    return <IdCardFormFlow initialValues={initialValues} onGenerated={setCard} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-neutral-950">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-28 pt-10"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        <View className="mb-6">
          <Text className="text-3xl font-extrabold text-slate-950 dark:text-white">
            Membership Card
          </Text>
          <Text className="mt-2 text-slate-500 dark:text-slate-400">
            Your RH Healthcare ID card is active.
          </Text>
        </View>

        <IdCardView card={card} />

        <View className="mt-6 rounded-lg border border-slate-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <Text className="text-base font-bold text-slate-950 dark:text-white">
            Membership details
          </Text>
          <View className="mt-4 gap-3">
            <View className="flex-row justify-between gap-4">
              <Text className="text-sm text-slate-500 dark:text-slate-400">Member ID</Text>
              <Text className="flex-1 text-right text-sm font-semibold text-slate-900 dark:text-white">
                {card.memberShipId}
              </Text>
            </View>
            <View className="flex-row justify-between gap-4">
              <Text className="text-sm text-slate-500 dark:text-slate-400">Membership</Text>
              <Text className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Free
              </Text>
            </View>
            <View className="flex-row justify-between gap-4">
              <Text className="text-sm text-slate-500 dark:text-slate-400">Status</Text>
              <Text className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                {card.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function IdCardLoadingSkeleton() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-5 pb-28 pt-10"
      showsVerticalScrollIndicator={false}>
      <View className="mb-6">
        <Skeleton className="h-9 w-56 rounded-md bg-slate-200 dark:bg-neutral-800" />
        <Skeleton className="mt-3 h-5 w-72 rounded-md bg-slate-200 dark:bg-neutral-800" />
      </View>

      <Skeleton className="aspect-[3/2] w-full rounded-lg bg-slate-200 dark:bg-neutral-800" />

      <View className="mt-6 rounded-lg border border-slate-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Skeleton className="h-5 w-40 rounded-md bg-slate-200 dark:bg-neutral-800" />
        <View className="mt-5 gap-4">
          <Skeleton className="h-4 w-full rounded-md bg-slate-200 dark:bg-neutral-800" />
          <Skeleton className="h-4 w-10/12 rounded-md bg-slate-200 dark:bg-neutral-800" />
          <Skeleton className="h-4 w-8/12 rounded-md bg-slate-200 dark:bg-neutral-800" />
        </View>
      </View>
    </ScrollView>
  );
}
