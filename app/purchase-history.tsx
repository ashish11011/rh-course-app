import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { router } from 'expo-router';
import api from '@/lib/api';
import { tryCatch } from '@/lib/apiUtils';
import { ArrowLeft, Clock, CheckCircle2, XCircle } from 'lucide-react-native';
import { Skeleton } from '@/components/ui/skeleton';

interface Purchase {
  id: string;
  orderType: string;
  orderId: string;
  currency: string;
  gatewayPaymentEventId: string;
  modeOfPayment: string;
  amount: number;
  transactionDate: string | null;
  status: string;
}

export default function PurchaseHistoryScreen() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError('');
      const { data: response, error, rawError } = await tryCatch(
        () => api.get('/api/auth/mobile/purchases'),
        'Failed to load purchase history.'
      );

      if (error || !response) {
        console.error(rawError);
        setError(error || 'Failed to load purchase history.');
        return;
      }

      if (response.data?.success) {
        setPurchases(response.data.purchases || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load purchase history.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle2 size={20} color="#16a34a" />;
      case 'pending':
        return <Clock size={20} color="#eab308" />;
      default:
        return <XCircle size={20} color="#ef4444" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-50 dark:bg-green-950/30';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30';
      default:
        return 'text-red-600 bg-red-50 dark:bg-red-950/30';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-neutral-950">
      {loading ? (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {[1, 2, 3, 4, 5].map((key) => (
            <Card key={key} className="mb-4 bg-white shadow-sm dark:bg-neutral-900">
              <CardContent className="p-4">
                <View className="mb-3 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Skeleton className="h-6 w-16 rounded bg-slate-200 dark:bg-neutral-800" />
                    <Skeleton className="h-6 w-20 rounded-full bg-slate-200 dark:bg-neutral-800" />
                  </View>
                  <Skeleton className="h-6 w-24 rounded bg-slate-200 dark:bg-neutral-800" />
                </View>

                <View className="mt-4 gap-3">
                  <View className="flex-row justify-between">
                    <Skeleton className="h-4 w-16 rounded bg-slate-200 dark:bg-neutral-800" />
                    <Skeleton className="h-4 w-1/2 rounded bg-slate-200 dark:bg-neutral-800" />
                  </View>
                  <View className="flex-row justify-between">
                    <Skeleton className="h-4 w-12 rounded bg-slate-200 dark:bg-neutral-800" />
                    <Skeleton className="h-4 w-24 rounded bg-slate-200 dark:bg-neutral-800" />
                  </View>
                  <View className="flex-row justify-between">
                    <Skeleton className="h-4 w-24 rounded bg-slate-200 dark:bg-neutral-800" />
                    <Skeleton className="h-4 w-16 rounded bg-slate-200 dark:bg-neutral-800" />
                  </View>
                </View>
              </CardContent>
            </Card>
          ))}
        </ScrollView>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="mb-4 text-center text-red-500">{error}</Text>
          <TouchableOpacity className="rounded-lg bg-green-700 px-6 py-2" onPress={fetchPurchases}>
            <Text className="font-semibold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : purchases.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-lg font-medium text-gray-500">No purchases found.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {purchases.map((purchase) => {
            const formattedDate = purchase.transactionDate
              ? new Date(purchase.transactionDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'N/A';

            // Assuming amount is in lowest denomination (e.g. paise), divide by 100
            const displayAmount = purchase.amount.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 2,
            });

            return (
              <Card key={purchase.id} className="mb-4 bg-white shadow-sm dark:bg-neutral-900">
                <CardContent className="p-4">
                  <View className="mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="rounded bg-slate-100 px-2 py-1 dark:bg-neutral-800">
                        <Text className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                          {purchase.orderType}
                        </Text>
                      </View>
                      <View
                        className={`flex-row items-center gap-1 rounded-full px-2 py-1 ${getStatusColor(purchase.status)}`}>
                        {getStatusIcon(purchase.status)}
                        <Text className="text-xs font-medium capitalize">{purchase.status}</Text>
                      </View>
                    </View>
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                      {displayAmount}
                    </Text>
                  </View>

                  <View className="gap-2">
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-500 dark:text-gray-400">Order ID</Text>
                      <Text
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        numberOfLines={1}
                        ellipsizeMode="middle"
                        style={{ maxWidth: '60%' }}>
                        {purchase.orderId}
                      </Text>
                    </View>

                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-500 dark:text-gray-400">Date</Text>
                      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formattedDate}
                      </Text>
                    </View>

                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-500 dark:text-gray-400">Payment Mode</Text>
                      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {purchase.modeOfPayment || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
            );
          })}
          <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
