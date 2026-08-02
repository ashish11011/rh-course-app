import React, { useEffect, useState } from 'react';
import { Alert, View, Image, ScrollView, TouchableOpacity, Modal, Platform } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import { MonitorPlay, PlayCircle, Clock, Award, FileText } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '@/lib/api';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import { tryCatch } from '@/lib/apiUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { viewCertificate } from '@/lib/certificateDownload';

const MEDIA_BASE_URL = 'https://d2c3lsl35lix55.cloudfront.net';

function buildMediaUrl(mediaUrl: string) {
  const trimmedUrl = mediaUrl.trim();

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  if (trimmedUrl.startsWith('/api/')) {
    const baseUrl = api.defaults.baseURL || '';
    return `${baseUrl}${trimmedUrl}`;
  }

  return `${MEDIA_BASE_URL}/${trimmedUrl.replace(/^\/+/, '')}`;
}

export default function EnrolledCourseScreen() {
  const { id } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Video Player state
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const player = useVideoPlayer(activeVideoUrl, (player) => {
    player.loop = false;
    player.play();
  });

  useEffect(() => {
    if (activeVideoUrl) {
      // Allow rotation when video is playing
      ScreenOrientation.unlockAsync();
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync("hidden");
      }
    } else {
      // Lock back to portrait when closed
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync("visible");
      }
    }
  }, [activeVideoUrl]);

  useEffect(() => {
    let isMounted = true;
    const fetchCourseData = async () => {
      try {
        const { data: response, error } = await tryCatch(
          () => api.get(`/api/auth/mobile/courses/${id}`),
          'An error occurred.'
        );
        if (!isMounted) return;

        if (error || !response) {
          setError(error || 'An error occurred.');
          return;
        }

        if (response.data.success) {
          setCourseData(response.data);
        } else {
          setError('Failed to fetch course data.');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError('An error occurred.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCourseData();
    return () => { isMounted = false; };
  }, [id]);

  const handleItemPress = async (item: any) => {
    if (!item.mediaUrl) return;

    const finalUrl = buildMediaUrl(item.mediaUrl);

    const mediaPath = finalUrl.split('?')[0].toLowerCase();
    const isMp4 = item.mediaType === 'mp4' || item.mediaType === 'video' || mediaPath.endsWith('.mp4');
    const isPdf = item.mediaType === 'pdf' || mediaPath.endsWith('.pdf');

    if (isMp4) {
      setActiveVideoUrl(finalUrl);
    } else if (isPdf) {
      try {
        await viewCertificate(finalUrl);
      } catch (openError) {
        console.error(openError);
        Alert.alert('Unable to open PDF', 'Please try again later.');
      }
    }
  };

  const closeVideo = () => {
    setActiveVideoUrl(null);
  };

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-neutral-950' : 'bg-white'}`} edges={['bottom']}>
        <Stack.Screen options={{ title: '', headerBackTitle: 'Back' }} />
        <CourseDetailSkeleton />
      </SafeAreaView>
    );
  }

  if (error || !courseData?.course) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-neutral-950' : 'bg-white'}`}>
        <Stack.Screen options={{ title: 'Error', headerBackTitle: 'Back' }} />
        <Text className="text-red-500">{error || 'Course not found'}</Text>
      </View>
    );
  }

  const { course } = courseData;
  const items = course.items || [];

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-neutral-950' : 'bg-white'}`} edges={['bottom']}>
      <Stack.Screen options={{ title: course.title, headerBackTitle: 'Back' }} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: course.bannerImageUrl?.startsWith('http') ? course.bannerImageUrl : `https://d2c3lsl35lix55.cloudfront.net/${course.bannerImageUrl}` }}
          className="h-52 w-full object-cover"
          resizeMode="cover"
        />
        <View className="flex-1 px-4 py-6">
          <Text className="text-xl font-semibold dark:text-white">{course.title}</Text>
          <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-6">{course.description}</Text>

          <View className="mt-6 flex-row flex-wrap gap-x-6 gap-y-2">
            <View className="flex-row items-center gap-1">
              <Clock color={isDark ? '#e5e5e5' : '#666'} size={18} />
              <Text className="text-sm dark:text-gray-300">{course.courseHours} Hrs</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <MonitorPlay color={isDark ? '#e5e5e5' : '#666'} size={18} />
              <Text className="text-sm dark:text-gray-300">{course.totalLectures} Lectures</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Award color={isDark ? '#e5e5e5' : '#666'} size={18} />
              <Text className="text-sm dark:text-gray-300">Certificate</Text>
            </View>
          </View>

          <View className="mt-8">
            <Text className="text-lg font-semibold mb-4 dark:text-white">Course Content</Text>
            <View className="flex-col gap-4">
              {items.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  className="flex-row items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-neutral-900"
                  activeOpacity={0.7}
                  onPress={() => handleItemPress(item)}>
                  <View className="flex-1 flex-row items-center gap-3">
                    {(item.mediaType === 'pdf' || (item.mediaUrl && item.mediaUrl.toLowerCase().endsWith('.pdf'))) ? (
                      <FileText size={28} color={isDark ? '#e5e5e5' : '#333'} strokeWidth={1.5} />
                    ) : (
                      <PlayCircle size={28} color={isDark ? '#e5e5e5' : '#333'} strokeWidth={1.5} />
                    )}
                    <View className="flex-1 pr-2">
                      <Text className="font-medium text-gray-900 dark:text-gray-100">{item.title}</Text>
                      {item.duration && (
                        <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{item.duration}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              {items.length === 0 && (
                <Text className="text-sm text-gray-500 dark:text-gray-400">No content available for this course.</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fullscreen Video Player Modal */}
      <Modal
        visible={!!activeVideoUrl}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeVideo}>
        <View className="flex-1 bg-black justify-center">
          <TouchableOpacity 
            className="absolute top-12 right-6 z-10 p-2 bg-neutral-800/80 rounded-full"
            onPress={closeVideo}>
            <Text className="text-white font-semibold">Close</Text>
          </TouchableOpacity>
          {activeVideoUrl && (
            <VideoView
              style={{ width: '100%', height: '100%' }}
              player={player}
              allowsPictureInPicture
            />
          )}
        </View>
      </Modal>

    </SafeAreaView>
  );
}

function CourseDetailSkeleton() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="pb-10"
      showsVerticalScrollIndicator={false}>
      <Skeleton className="h-52 w-full bg-gray-200 dark:bg-neutral-800" />
      <View className="flex-1 px-4 py-6">
        <Skeleton className="h-7 w-11/12 rounded bg-gray-200 dark:bg-neutral-800" />
        <Skeleton className="mt-3 h-4 w-full rounded bg-gray-200 dark:bg-neutral-800" />
        <Skeleton className="mt-2 h-4 w-5/6 rounded bg-gray-200 dark:bg-neutral-800" />
        <Skeleton className="mt-2 h-4 w-2/3 rounded bg-gray-200 dark:bg-neutral-800" />

        <View className="mt-6 flex-row flex-wrap gap-x-6 gap-y-3">
          <Skeleton className="h-5 w-20 rounded bg-gray-200 dark:bg-neutral-800" />
          <Skeleton className="h-5 w-24 rounded bg-gray-200 dark:bg-neutral-800" />
          <Skeleton className="h-5 w-24 rounded bg-gray-200 dark:bg-neutral-800" />
        </View>

        <View className="mt-8">
          <Skeleton className="mb-4 h-6 w-40 rounded bg-gray-200 dark:bg-neutral-800" />
          <View className="flex-col gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <View
                key={index}
                className="flex-row items-center rounded-xl bg-gray-50 p-4 dark:bg-neutral-900">
                <Skeleton className="h-8 w-8 rounded bg-gray-200 dark:bg-neutral-800" />
                <View className="ml-3 flex-1">
                  <Skeleton className="h-5 w-4/5 rounded bg-gray-200 dark:bg-neutral-800" />
                  <Skeleton className="mt-2 h-3 w-24 rounded bg-gray-200 dark:bg-neutral-800" />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
