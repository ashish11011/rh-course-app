import React, { useEffect, useState } from 'react';
import { Alert, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import { tryCatch } from '@/lib/apiUtils';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  FileBadge,
} from 'lucide-react-native';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getCertificateUrl,
  viewCertificate,
} from '@/lib/certificateDownload';

interface Workshop {
  registrationId: string;
  workshopId: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  whatsappLink: string | null;
  modeOfAttendance: string;
  paymentStatus: string;
  certificateUrl: string | null;
  registeredAt: string;
}

export default function WorkshopsScreen() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      setError('');
      const { data: response, error, rawError } = await tryCatch(
        () => api.get('/api/auth/mobile/workshops'),
        'Failed to load workshops.'
      );

    if (error || !response) {
        if (__DEV__) {
          console.warn('Failed to load workshops', rawError);
        }
        setError(error || 'Failed to load workshops.');
        return;
      }

      if (response.data?.success) {
        setWorkshops(response.data.workshops || []);
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('Failed to load workshops', err);
      }
      setError('Failed to load workshops.');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return <CheckCircle2 size={16} color="#16a34a" />;
      case 'pending':
        return <Clock size={16} color="#eab308" />;
      default:
        return null;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'text-green-600 bg-green-50 dark:bg-green-950/30';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCertificateView = async (workshop: Workshop) => {
    const url = getCertificateUrl(workshop.certificateUrl);
    if (!url) return;

    try {
      await viewCertificate(url);
    } catch (viewError) {
      if (__DEV__) {
        console.warn('Unable to open workshop certificate', viewError);
      }
      Alert.alert('Unable to open certificate', 'Please try again later.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-neutral-950">
      {loading ? (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {[1, 2, 3].map((key) => (
            <Card key={key} className="mb-4 bg-white shadow-sm dark:bg-neutral-900">
              <CardContent className="p-4">
                <View className="mb-3">
                  <View className="flex-row items-start justify-between">
                    <Skeleton className="h-6 w-2/3 rounded-md bg-slate-200 dark:bg-neutral-800" />
                    <Skeleton className="h-5 w-16 rounded-full bg-slate-200 dark:bg-neutral-800" />
                  </View>
                  <Skeleton className="mt-2 h-4 w-full rounded-md bg-slate-200 dark:bg-neutral-800" />
                  <Skeleton className="mt-1 h-4 w-3/4 rounded-md bg-slate-200 dark:bg-neutral-800" />
                </View>

                <View className="mb-4 gap-2 rounded-lg bg-slate-50 p-3 dark:bg-neutral-800/50">
                  <View className="flex-row items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded bg-slate-200 dark:bg-neutral-700" />
                    <Skeleton className="h-4 w-1/2 rounded bg-slate-200 dark:bg-neutral-700" />
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded bg-slate-200 dark:bg-neutral-700" />
                    <Skeleton className="h-4 w-1/3 rounded bg-slate-200 dark:bg-neutral-700" />
                  </View>
                </View>

                <View className="flex-row gap-2">
                  <Skeleton className="h-10 flex-1 rounded-lg bg-slate-200 dark:bg-neutral-800" />
                  <Skeleton className="h-10 flex-1 rounded-lg bg-slate-200 dark:bg-neutral-800" />
                </View>
              </CardContent>
            </Card>
          ))}
        </ScrollView>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="mb-4 text-center text-red-500">{error}</Text>
          <TouchableOpacity className="rounded-lg bg-green-700 px-6 py-2" onPress={fetchWorkshops}>
            <Text className="font-semibold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : workshops.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-lg font-medium text-gray-500">No workshops found.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {workshops.map((workshop) => {
            return (
              <Card
                key={workshop.registrationId}
                className="mb-4 bg-white shadow-sm dark:bg-neutral-900">
                <CardContent className="p-4">
                  <View className="mb-3">
                    <View className="flex-row items-start justify-between">
                      <Text className="mr-2 flex-1 text-lg font-bold text-gray-900 dark:text-white">
                        {workshop.name}
                      </Text>
                      <View
                        className={`flex-row items-center gap-1 rounded-full px-2 py-1 ${getPaymentStatusColor(workshop.paymentStatus)}`}>
                        {getPaymentStatusIcon(workshop.paymentStatus)}
                        <Text className="text-[10px] font-bold uppercase">
                          {workshop.paymentStatus}
                        </Text>
                      </View>
                    </View>
                    {workshop.description ? (
                      <Text
                        className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                        numberOfLines={2}>
                        {workshop.description}
                      </Text>
                    ) : null}
                  </View>

                  <View className="mb-4 gap-2 rounded-lg bg-slate-50 p-3 dark:bg-neutral-800">
                    <View className="flex-row items-center gap-2">
                      <CalendarDays size={16} color="#64748b" />
                      <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {formatDate(workshop.startTime)} • {formatTime(workshop.startTime)}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <MapPin size={16} color="#64748b" />
                      <Text className="text-sm font-medium capitalize text-slate-700 dark:text-slate-300">
                        {workshop.modeOfAttendance || 'Online'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2">
                    {workshop.whatsappLink ? (
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2.5"
                        onPress={() => Linking.openURL(workshop.whatsappLink!)}>
                        <MessageCircle size={18} color="white" />
                        <Text className="font-semibold text-white">Join WhatsApp</Text>
                      </TouchableOpacity>
                    ) : null}

                    {workshop.certificateUrl ? (
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-green-700 py-2.5"
                        onPress={() => handleCertificateView(workshop)}>
                        <FileBadge size={18} color="white" />
                        <Text className="font-semibold text-white">Certificate</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {!workshop.whatsappLink && !workshop.certificateUrl && (
                    <View className="w-full items-center py-2">
                      <Text className="text-sm text-gray-400">Registration Complete</Text>
                    </View>
                  )}
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
