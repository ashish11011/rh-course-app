import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Text } from '@/components/ui/text';
import { IconCertificate, IconClock, IconUserCircle } from '@tabler/icons-react-native';
import { Link, router } from 'expo-router';
import { LucideIcon, MonitorPlay } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Image,
  type ImageStyle,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import remoteConfig from '@react-native-firebase/remote-config';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { PublicCourse, fetchAllCourses } from '@/store/coursesSlice';

type HomeSectionConfig = {
  id:
    | 'hero'
    | 'seminar_registration'
    | 'course_crousel'
    | 'workshop_registration'
    | 'prev_workhsop_carousel';
  enable: boolean;
  priority: number;
};

export default function FeaturedScreen() {
  const { colorScheme } = useColorScheme();
  const [sections, setSections] = useState<HomeSectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();
  const [refreshing, setRefreshing] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      await remoteConfig().setConfigSettings({
        minimumFetchIntervalMillis: 0,
      });

      await remoteConfig().setDefaults({
        featured_section: JSON.stringify({ homeSection: [] }),
      });
      await remoteConfig().fetchAndActivate();

      const featuredSectionStr = remoteConfig().getValue('featured_section').asString();
      if (featuredSectionStr) {
        const parsed = JSON.parse(featuredSectionStr);
        if (parsed.homeSection && Array.isArray(parsed.homeSection)) {
          const sortedSections = parsed.homeSection
            .filter((sec: HomeSectionConfig) => sec.enable)
            .sort((a: HomeSectionConfig, b: HomeSectionConfig) => a.priority - b.priority);
          setSections(sortedSections);
        }
      }
    } catch (error) {
      console.error('Error fetching remote config:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchConfig(), dispatch(fetchAllCourses())]);
    setRefreshing(false);
  }, [fetchConfig, dispatch]);

  const handleCoursePress = (course: PublicCourse) => {
    router.push(course.slug as any);
  };

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return (
          <View key={sectionId} className="mb-12 flex-row gap-2 px-4">
            <IconUserCircle size={52} strokeWidth={1} color={'#444'} />
            <View>
              <Text className="text-xl font-medium">Welcome, {user?.name || 'User'}</Text>
              <Text>{user?.designation || 'Student'}</Text>
            </View>
          </View>
        );
      case 'seminar_registration':
        return (
          <TouchableOpacity
            key={sectionId}
            activeOpacity={0.8}
            className="mb-12"
            onPress={() =>
              Linking.openURL(
                'https://www.rhhealthcaresimulation.com/rh-healthcare-ntai-conference-ric-jaipur-2026'
              )
            }>
            <AspectRatio className="w-full" ratio={16 / 9}>
              <Image
                source={{
                  uri: 'https://d2c3lsl35lix55.cloudfront.net/website-image/seminar_registration.png',
                }}
                className="h-full w-full"
              />
            </AspectRatio>
          </TouchableOpacity>
        );
      case 'course_crousel':
        return (
          <CourseCardsHorizontal
            key={sectionId}
            onCoursePress={handleCoursePress}
            title="Popular for Nursing/Paramedic"
          />
        );
      case 'workshop_registration':
        return (
          <TouchableOpacity
            key={sectionId}
            activeOpacity={0.8}
            className="mb-12"
            onPress={() => Linking.openURL('https://www.rhhealthcaresimulation.com/workshops')}>
            <AspectRatio className="w-full" ratio={16 / 9}>
              <Image
                source={{
                  uri: 'https://d2c3lsl35lix55.cloudfront.net/website-image/workshop_registration.png',
                }}
                className="h-full w-full"
              />
            </AspectRatio>
          </TouchableOpacity>
        );
      case 'prev_workhsop_carousel':
        return (
          <CourseCardsHorizontal
            key={sectionId}
            onCoursePress={handleCoursePress}
            title="Previous Workshops"
          />
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 dark:bg-neutral-950">
      <ScrollView
        className="flex-1"
        contentContainerClassName="py-20"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colorScheme === 'dark' ? '#ffffff' : '#000000'}
          />
        }>
        {loading ? (
          <HomeSkeleton />
        ) : sections.length > 0 ? (
          sections.map((sec) => renderSection(sec.id))
        ) : (
          <View>
            {/* Fallback layout if config not present */}
            {renderSection('hero')}
            {renderSection('seminar_registration')}
            {renderSection('course_crousel')}
            {renderSection('workshop_registration')}
            {renderSection('prev_workhsop_carousel')}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const HomeSkeleton = () => {
  return (
    <View className="mt-4 gap-12 px-4">
      {/* Hero skeleton */}
      <View className="flex-row gap-4">
        <View className="h-14 w-14 rounded-full bg-gray-200 dark:bg-neutral-800" />
        <View className="justify-center gap-2">
          <View className="h-6 w-48 rounded bg-gray-200 dark:bg-neutral-800" />
          <View className="h-4 w-24 rounded bg-gray-200 dark:bg-neutral-800" />
        </View>
      </View>
      {/* Banner skeleton */}
      <View className="aspect-[16/9] w-full rounded-lg bg-gray-200 dark:bg-neutral-800" />
      {/* Course Carousel skeleton */}
      <View>
        <View className="mb-4 h-6 w-56 rounded bg-gray-200 dark:bg-neutral-800" />
        <View className="flex-row gap-4">
          <View className="w-[70vw]">
            <View className="h-40 w-full rounded-lg bg-gray-200 dark:bg-neutral-800" />
            <View className="mt-3 h-5 w-3/4 rounded bg-gray-200 dark:bg-neutral-800" />
            <View className="mt-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-neutral-800" />
          </View>
          <View className="w-[70vw]">
            <View className="h-40 w-full rounded-lg bg-gray-200 dark:bg-neutral-800" />
            <View className="mt-3 h-5 w-3/4 rounded bg-gray-200 dark:bg-neutral-800" />
            <View className="mt-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-neutral-800" />
          </View>
        </View>
      </View>
    </View>
  );
};

function CourseCardsHorizontal({
  onCoursePress,
  title,
}: {
  onCoursePress: (course: PublicCourse) => void;
  title?: string;
}) {
  const { allCourses, allCoursesLoading } = useSelector((state: RootState) => state.courses);

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
  return (
    <View className="mb-12">
      {title && <Text className="px-4 text-xl font-semibold dark:text-white">{title}</Text>}
      <ScrollView
        horizontal
        className="mt-3 pl-4"
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-8">
        {allCoursesLoading
          ? // Skeleton Loader
            Array.from({ length: 3 }).map((_, index) => (
              <View key={index} className="w-[70vw]">
                <View className="mx-auto h-40 w-full rounded-lg bg-gray-200 dark:bg-neutral-800" />
                <View className="mt-3 h-5 w-3/4 rounded bg-gray-200 dark:bg-neutral-800" />
                <View className="mt-2 flex-row gap-6">
                  <View className="h-4 w-12 rounded bg-gray-200 dark:bg-neutral-800" />
                  <View className="h-4 w-16 rounded bg-gray-200 dark:bg-neutral-800" />
                </View>
              </View>
            ))
          : allCourses.map((courseItem) => {
              return (
                <TouchableOpacity
                  key={courseItem.slug}
                  className="w-[70vw]"
                  activeOpacity={0.8}
                  onPress={() => onCoursePress(courseItem)}>
                  <Image
                    source={{
                      uri: courseItem.bannerImageUrl.startsWith('http')
                        ? courseItem.bannerImageUrl
                        : `https://d12z58c4k5tsm1.cloudfront.net/${courseItem.bannerImageUrl}`,
                    }}
                    className="mx-auto h-auto min-h-40 w-full overflow-hidden rounded-lg object-cover"
                    resizeMode="cover"
                  />
                  <Text className="mt-3 font-medium leading-6 dark:text-white">
                    {courseItem.title}
                  </Text>
                  <View className="flex-row gap-6">
                    <CardDetailIcon
                      IconComponent={IconClock}
                      label={`${courseItem.courseHours} Hrs`}
                    />
                    <CardDetailIcon IconComponent={MonitorPlay} label={courseItem.totalLectures} />
                    <CardDetailIcon IconComponent={IconCertificate} label={'Certificate'} />
                  </View>
                </TouchableOpacity>
              );
            })}
        <View className="w-0"></View>
      </ScrollView>
    </View>
  );
}
