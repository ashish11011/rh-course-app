import React from 'react';
import { View, Image, Linking, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import {
  IconClock,
  IconCertificate,
  IconExternalLink,
  IconCheck,
} from '@tabler/icons-react-native';
import { LucideIcon, MonitorPlay } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { cn } from '@/lib/utils';
import { COURSE_DATA } from '@/const/courseData';
import { SafeAreaView } from 'react-native-safe-area-context';

const CourseDetailIcon = ({
  IconComponent,
  label,
  isDark,
}: {
  IconComponent: LucideIcon | React.ElementType;
  label: string | number;
  isDark: boolean;
}) => {
  return (
    <View className="mt-2 flex-row items-center gap-1">
      <IconComponent color={isDark ? '#e5e5e5' : '#666'} size={20} />
      <Text className="text-sm">{label}</Text>
    </View>
  );
};

const SectionHeading = ({ title, className }: { title: string; className?: string }) => (
  <Text className={cn('text-sm font-semibold', className)}>{title}</Text>
);

export default function CourseScreen() {
  const { slug } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Slug might not contain '/courses/' depending on how it's routed,
  // but COURSE_DATA has slugs like '/courses/nrp-for-nurses'
  const course = COURSE_DATA.find((c) => c.slug === `/courses/${slug}` || c.slug === slug);

  if (!course) {
    return (
      <View
        className={`flex-1 items-center justify-center ${isDark ? 'bg-neutral-950' : 'bg-white'}`}>
        <Stack.Screen options={{ title: 'Course Not Found' }} />
        <Text>Course not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-neutral-950' : 'bg-white'}`} edges={['bottom']}>
      <Stack.Screen options={{ title: course.courseTitle, headerBackTitle: 'Back' }} />
      <ScrollView className="flex-1">
        <Image
          source={{ uri: course.bannerImage }}
          className="h-52 w-full object-cover"
          resizeMode="cover"
        />
        <View className="flex-1 px-4 py-6">
          <Text className="text-xl font-semibold">{course.courseTitle}</Text>

          <View className="mt-6 w-full flex-col gap-2">
            <CourseDetailIcon
              IconComponent={IconClock}
              label={course.courseHour + ' Hrs'}
              isDark={isDark}
            />
            <CourseDetailIcon
              IconComponent={MonitorPlay}
              label={course.numberOfLacture + ' Lactures'}
              isDark={isDark}
            />
            <CourseDetailIcon
              IconComponent={IconCertificate}
              label={'Certificate after completion'}
              isDark={isDark}
            />
          </View>

          {/* What you will learn */}
          <View className="mt-10">
            <SectionHeading title="What you will learn" />
            <View className="mt-3 flex-col gap-3">
              {course.whatYoullLearn.map((txt: string) => (
                <View key={txt} className="flex-row gap-2 pr-4">
                  <IconCheck color={isDark ? '#fff' : '#000'} size={18} />
                  <Text
                    className={` ${isDark ? 'text-gray-300' : 'text-gray-500'} text-sm leading-5`}>
                    {txt}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <SectionHeading className="mt-10" title="Description" />
          <Text className="mt-2 text-sm leading-6">{course.courseOverview}</Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View className="border-t border-neutral-100 bg-white px-4 py-4 dark:border-neutral-900 dark:bg-neutral-950">
        <Button
          className="active:bg-neutral-700 dark:bg-green-700"
          onPress={() => Linking.openURL('https://www.rhhealthcaresimulation.com/courses')}>
          <Text className="dark:text-neutral-200">View new course</Text>
          <IconExternalLink size={18} color={isDark ? '#e5e5e5' : '#fff'} />
        </Button>
      </View>
    </SafeAreaView>
  );
}
