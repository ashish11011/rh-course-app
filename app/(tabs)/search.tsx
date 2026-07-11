import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { COURSE_DATA } from '@/const/courseData';
import { router } from 'expo-router';
import { IconCertificate, IconClock } from '@tabler/icons-react-native';
import { MonitorPlay, LucideIcon } from 'lucide-react-native';

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
      <Text className="text-sm">{label}</Text>
    </View>
  );
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return COURSE_DATA;
    return COURSE_DATA.filter((course) =>
      course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleCoursePress = (course: any) => {
    router.push(course.slug);
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

        <ScrollView className="flex-1 px-6" contentContainerClassName="pb-20">
          {filteredCourses.length > 0 ? (
            <View className="gap-6">
              {filteredCourses.map((course) => (
                <TouchableOpacity
                  key={course.slug}
                  className="mb-4 w-full"
                  activeOpacity={0.8}
                  onPress={() => handleCoursePress(course)}>
                  <Image
                    source={{ uri: course.bannerImage }}
                    className="h-48 w-full overflow-hidden rounded-lg object-cover"
                    resizeMode="cover"
                  />
                  <Text className="mt-3 text-lg font-medium leading-6 dark:text-white">
                    {course.courseTitle}
                  </Text>
                  <View className="flex-row flex-wrap gap-x-6 gap-y-2">
                    <CardDetailIcon IconComponent={IconClock} label={course.courseHour} />
                    <CardDetailIcon IconComponent={MonitorPlay} label={course.numberOfLacture} />
                    <CardDetailIcon IconComponent={IconCertificate} label={'Certificate'} />
                  </View>
                </TouchableOpacity>
              ))}
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
