import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { IconCertificate, IconClock } from '@tabler/icons-react-native';
import { MonitorPlay, LucideIcon } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { PublicCourse } from '@/store/coursesSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { courseAssetUrl } from '@/lib/cloudfront';

const CardDetailIcon = ({
  IconComponent,
  label,
}: {
  IconComponent: LucideIcon | any;
  label: string | number;
}) => {
  return (
    <View className="mt-2 flex-row items-center gap-1">
      <IconComponent color={'#666'} size={18} />
      <Text className="text-sm dark:text-gray-400">{label}</Text>
    </View>
  );
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { allCourses, allCoursesLoading } = useSelector((state: RootState) => state.courses);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return allCourses;
    return allCourses.filter((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allCourses]);

  const handleCoursePress = (course: PublicCourse) => {
    router.push(course.slug as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950" edges={['top']}>
      <View className="flex-1 pt-4">
        <View className="mb-4 px-6">
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="w-full"
          />
        </View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerClassName="pb-20"
          showsVerticalScrollIndicator={false}>
          {allCoursesLoading ? (
            <View className="gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <View key={index} className="mb-4 w-full">
                  <Skeleton className="h-48 w-full rounded-lg bg-gray-200 dark:bg-neutral-800" />
                  <Skeleton className="mt-3 h-5 w-3/4 rounded bg-gray-200 dark:bg-neutral-800" />
                  <View className="mt-2 flex-row gap-6">
                    <Skeleton className="h-4 w-12 rounded bg-gray-200 dark:bg-neutral-800" />
                    <Skeleton className="h-4 w-16 rounded bg-gray-200 dark:bg-neutral-800" />
                  </View>
                </View>
              ))}
            </View>
          ) : filteredCourses.length > 0 ? (
            <View className="gap-6">
              {filteredCourses.map((course) => {
                const imageUrl = courseAssetUrl(course.bannerImageUrl);

                return (
                  <TouchableOpacity
                    key={course.slug}
                    className="mb-4 w-full"
                    activeOpacity={0.8}
                    onPress={() => handleCoursePress(course)}>
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        className="h-48 w-full overflow-hidden rounded-lg object-cover"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="h-48 w-full rounded-lg bg-slate-100 dark:bg-neutral-800" />
                    )}
                    <Text className="mt-3 text-lg font-medium leading-6 dark:text-white">
                      {course.title}
                    </Text>
                    <View className="flex-row flex-wrap gap-x-6 gap-y-2">
                      <CardDetailIcon IconComponent={IconClock} label={`${course.courseHours} Hrs`} />
                      <CardDetailIcon IconComponent={MonitorPlay} label={course.totalLectures} />
                      <CardDetailIcon IconComponent={IconCertificate} label={'Certificate'} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View className="mt-20 items-center justify-center">
              <Text className="text-lg text-gray-500 dark:text-gray-400">
                No courses found for "{searchQuery}"
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
