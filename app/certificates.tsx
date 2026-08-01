import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Platform,
  RefreshControl,
  View,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, ExternalLink, FileBadge, RefreshCw } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import api from '@/lib/api';
import { tryCatch } from '@/lib/apiUtils';
import { cloudfrontAssetUrl } from '@/lib/cloudfront';

type Certificate = {
  type: 'workshop' | 'seminar';
  certificate: string | null;
  workshopName: string;
  workshopId: string;
  workshopImage: string | null;
  workshopTime: string | null;
};

type CertificatesResponse = {
  success: boolean;
  certificates?: Certificate[];
  workshopCertificates?: Certificate[];
  seminarCertificates?: Certificate[];
};

function formatCertificateDate(value: string | null) {
  if (!value) return 'Date not available';

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getCertificateUrl(certificate: Certificate) {
  return cloudfrontAssetUrl(certificate.certificate);
}

function getCertificateFileName(certificate: Certificate) {
  const cleanName = certificate.workshopName
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  return `${cleanName || 'certificate'}-${certificate.workshopId}.pdf`;
}

export default function CertificatesScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadingId, setDownloadingId] = useState('');

  const fetchCertificates = useCallback(async () => {
    setErrorMessage('');

    const {
      data: response,
      error,
      rawError,
    } = await tryCatch(
      () => api.get<CertificatesResponse>('/api/auth/mobile/certificates'),
      'Failed to load certificates.'
    );

    if (error || !response) {
      console.error(rawError);
      setErrorMessage(error || 'Failed to load certificates.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const payload = response.data;
    const nextCertificates = payload.certificates || [
      ...(payload.workshopCertificates || []),
      ...(payload.seminarCertificates || []),
    ];

    setCertificates(nextCertificates.filter((certificate) => certificate.certificate));
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCertificates();
  }, [fetchCertificates]);

  const sortedCertificates = useMemo(
    () =>
      [...certificates].sort((a, b) => {
        const aTime = a.workshopTime ? new Date(a.workshopTime).getTime() : 0;
        const bTime = b.workshopTime ? new Date(b.workshopTime).getTime() : 0;
        return bTime - aTime;
      }),
    [certificates]
  );

  const handleView = useCallback(async (certificate: Certificate) => {
    const url = getCertificateUrl(certificate);
    if (!url) return;

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Unable to open certificate', 'Please try again later.');
      return;
    }

    Linking.openURL(url);
  }, []);

  const handleDownload = useCallback(async (certificate: Certificate) => {
    const url = getCertificateUrl(certificate);
    if (!url) return;

    if (Platform.OS === 'web') {
      Linking.openURL(url);
      return;
    }

    const downloadKey = `${certificate.type}-${certificate.workshopId}`;
    const fileName = getCertificateFileName(certificate);
    setDownloadingId(downloadKey);

    try {
      const { dirs } = ReactNativeBlobUtil.fs;
      const downloadPath =
        Platform.OS === 'android'
          ? `${dirs.DownloadDir}/${fileName}`
          : `${dirs.DocumentDir}/${fileName}`;

      const config =
        Platform.OS === 'android'
          ? {
              addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                mediaScannable: true,
                title: fileName,
                path: downloadPath,
                mime: 'application/pdf',
                description: 'Downloading certificate',
              },
            }
          : {
              fileCache: true,
              appendExt: 'pdf',
              path: downloadPath,
            };

      const result = await ReactNativeBlobUtil.config(config).fetch('GET', url);

      if (Platform.OS === 'ios') {
        ReactNativeBlobUtil.ios.openDocument(result.path());
      } else {
        Alert.alert('Download complete', 'Certificate saved to your Downloads folder.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Download failed', 'Unable to download this certificate. Please try again.');
    } finally {
      setDownloadingId('');
    }
  }, []);

  const renderCertificate = ({ item }: { item: Certificate }) => {
    const imageUrl = cloudfrontAssetUrl(item.workshopImage);
    const downloadKey = `${item.type}-${item.workshopId}`;
    const isDownloading = downloadingId === downloadKey;

    return (
      <Card className="mb-5 overflow-hidden border-slate-200 bg-white p-0 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="h-44 w-full bg-slate-100"
            resizeMode="contain"
          />
        ) : (
          <View className="h-44 items-center justify-center bg-emerald-50 dark:bg-emerald-950/30">
            <FileBadge size={56} color={isDark ? '#6ee7b7' : '#047857'} strokeWidth={1.5} />
          </View>
        )}

        <CardContent className="p-4">
          <View className="mb-3 flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-lg font-bold leading-6 text-slate-950 dark:text-white">
                {item.workshopName}
              </Text>
              <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {formatCertificateDate(item.workshopTime)}
              </Text>
            </View>

            <View className="rounded-full bg-emerald-50 px-3 py-1 dark:bg-emerald-950/40">
              <Text className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
                {item.type}
              </Text>
            </View>
          </View>

          <View className="mt-2 flex-row gap-3">
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-lg"
              onPress={() => handleView(item)}>
              <ExternalLink size={17} color={isDark ? '#e5e7eb' : '#334155'} />
              <Text>View</Text>
            </Button>

            <Button
              className="h-11 flex-1 rounded-lg bg-emerald-700 active:bg-emerald-800"
              disabled={isDownloading}
              onPress={() => handleDownload(item)}>
              {isDownloading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Download size={17} color="#ffffff" />
              )}
              <Text className="font-semibold text-white">
                {isDownloading ? 'Downloading' : 'Download'}
              </Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-neutral-950">
        <Stack.Screen options={{ title: 'My Certificates', headerBackTitle: 'Back' }} />
        <View className="flex-1 px-4 py-5">
          <Text className="mb-5 text-2xl font-bold text-slate-950 dark:text-white">
            My Certificates
          </Text>
          {[1, 2, 3].map((item) => (
            <Card
              key={item}
              className="mb-5 overflow-hidden border-slate-200 bg-white p-0 dark:border-neutral-800 dark:bg-neutral-900">
              <Skeleton className="h-44 w-full bg-slate-200 dark:bg-neutral-800" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-10/12 rounded-md bg-slate-200 dark:bg-neutral-800" />
                <Skeleton className="mt-2 h-4 w-40 rounded-md bg-slate-200 dark:bg-neutral-800" />
                <View className="mt-5 flex-row gap-3">
                  <Skeleton className="h-11 flex-1 rounded-lg bg-slate-200 dark:bg-neutral-800" />
                  <Skeleton className="h-11 flex-1 rounded-lg bg-slate-200 dark:bg-neutral-800" />
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-neutral-950">
        <Stack.Screen options={{ title: 'My Certificates', headerBackTitle: 'Back' }} />
        <View className="flex-1 items-center justify-center px-6">
          <FileBadge size={54} color={isDark ? '#525252' : '#cbd5e1'} strokeWidth={1.5} />
          <Text className="mt-5 text-center text-xl font-bold text-slate-950 dark:text-white">
            Could not load certificates
          </Text>
          <Text className="mt-3 text-center text-slate-500 dark:text-slate-400">
            {errorMessage}
          </Text>
          <Button
            className="mt-7 h-12 rounded-lg bg-emerald-700 px-6 active:bg-emerald-800"
            onPress={() => {
              setLoading(true);
              fetchCertificates();
            }}>
            <RefreshCw size={18} color="#ffffff" />
            <Text className="font-semibold text-white">Retry</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-neutral-950">
      <Stack.Screen options={{ title: 'My Certificates', headerBackTitle: 'Back' }} />
      <View className="flex-1 px-4 py-5">
        <Text className="text-2xl font-bold text-slate-950 dark:text-white">My Certificates</Text>
        <Text className="mb-5 mt-1 text-slate-500 dark:text-slate-400">
          View and download certificates from completed courses and workshops.
        </Text>

        <FlatList
          data={sortedCertificates}
          keyExtractor={(item) => `${item.type}-${item.workshopId}-${item.certificate}`}
          renderItem={renderCertificate}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? '#ffffff' : '#000000'}
            />
          }
          ListEmptyComponent={
            <View className="mt-24 items-center justify-center rounded-lg border border-dashed border-slate-200 px-6 py-14 dark:border-neutral-800">
              <FileBadge size={52} color={isDark ? '#525252' : '#cbd5e1'} strokeWidth={1.5} />
              <Text className="mt-4 text-center text-base text-slate-500 dark:text-slate-400">
                You haven't earned any certificates yet.
              </Text>
            </View>
          }
          contentContainerClassName={sortedCertificates.length === 0 ? 'flex-grow' : 'pb-8'}
        />
      </View>
    </SafeAreaView>
  );
}
