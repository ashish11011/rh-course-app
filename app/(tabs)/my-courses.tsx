import React, { useState, useCallback } from 'react';
import { View, Image, Linking, FlatList, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { IconExternalLink } from '@tabler/icons-react-native';
import { useColorScheme } from 'nativewind';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { Course, fetchPurchasedCourses } from '@/store/coursesSlice';
import { Clock, GraduationCap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { cloudfrontAssetUrl } from '@/lib/cloudfront';

export default function MyCoursesScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { courses, loading } = useSelector((state: RootState) => state.courses);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchPurchasedCourses());
    setRefreshing(false);
  }, [dispatch]);

  if (courses.length === 0 && !loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 px-6 dark:bg-neutral-950">
          <Text className="text-xl font-semibold">My courses</Text>
          <Image
            source={require('../../assets/images/empty_screen.png')}
            className="mx-auto mt-24 h-64 w-64"
            resizeMode="contain"
          />
          <View className="mt-0 flex-col items-center gap-2">
            <Text className="text-2xl font-semibold">What will you learn first?</Text>
            <Text className="text-base text-gray-300">Your courses will go here</Text>
          </View>
          <Button
            className="mt-12 active:bg-neutral-700 dark:bg-neutral-800"
            onPress={() => Linking.openURL('https://www.rhhealthcaresimulation.com/courses')}>
            <Text className="dark:text-neutral-200">View new course</Text>
            <IconExternalLink size={18} color={isDark ? '#e5e5e5' : '#fff'} />
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: Course }) => {
    const imageUrl = cloudfrontAssetUrl(item.bannerImageUrl);

    return (
    <Pressable onPress={() => router.push(`/learning/${item.courseId}` as any)}>
      <Card className="mb-4 overflow-hidden border-0 bg-white p-0 shadow-sm dark:bg-neutral-900">
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="h-40 w-full object-cover" />
        ) : (
          <View className="h-40 w-full bg-slate-100 dark:bg-neutral-800" />
        )}
        <CardContent className="p-4">
          <Text className="line-clamp-2 text-lg font-semibold dark:text-white">
            {item.title}
          </Text>
          <Text className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
            {item.description}
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-4 text-sm">
            <View className="flex-row items-center gap-1.5">
              <Clock size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text className="text-gray-500 dark:text-gray-400">
                {item.courseDuration || `${item.courseHours} hours`}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <GraduationCap size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text className="text-gray-500 dark:text-gray-400">
                {item.totalLectures} lessons
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="dark:bg-neutral-950">
      <View className="flex-1 px-4 py-4">
        <Text className="mb-4 text-2xl font-bold dark:text-white">My Courses</Text>
        <FlatList
          data={courses}
          keyExtractor={(item) => item.enrolmentId}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? '#ffffff' : '#000000'}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}
