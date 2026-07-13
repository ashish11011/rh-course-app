import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Text } from '@/components/ui/text';
import { COURSE_DATA } from '@/const/courseData';
import { IconCertificate, IconClock, IconUserCircle } from '@tabler/icons-react-native';
import { Link, router } from 'expo-router';
import { LucideIcon, MonitorPlay } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { Image, type ImageStyle, View, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import remoteConfig from '@react-native-firebase/remote-config';
import { useSelector } from 'react-redux';

type HomeSectionConfig = {
  id: 'hero' | 'seminar_registration' | 'course_crousel' | 'workshop_registration' | 'prev_workhsop_carousel';
  enable: boolean;
  priority: number;
};

export default function FeaturedScreen() {
  const { colorScheme } = useColorScheme();
  const [sections, setSections] = useState<HomeSectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Set fetch interval to 0 for development so changes show up instantly
        await remoteConfig().setConfigSettings({
          minimumFetchIntervalMillis: 0,
        });

        await remoteConfig().setDefaults({
          featured_section: JSON.stringify({ homeSection: [] })
        });
        await remoteConfig().fetchAndActivate();
        
        const featuredSectionStr = remoteConfig().getValue('featured_section').asString();
        if (featuredSectionStr) {
          const parsed = JSON.parse(featuredSectionStr);
          if (parsed.homeSection && Array.isArray(parsed.homeSection)) {
            // Filter enabled and sort by priority
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
    };

    fetchConfig();
  }, []);

  const handleCoursePress = (course: any) => {
    router.push(course.slug);
  };

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return (
          <View key={sectionId} className="flex-row gap-2 px-4 mb-12">
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
            onPress={() => Linking.openURL('https://www.rhhealthcaresimulation.com/courses')}>
            <AspectRatio className="w-full" ratio={16 / 9}>
              <Image
                source={{
                  uri: 'https://d2c3lsl35lix55.cloudfront.net/website-image/Registration+Page.png',
                }}
                className="h-full w-full"
              />
            </AspectRatio>
          </TouchableOpacity>
        );
      case 'course_crousel':
        return <CourseCardsHorizontal key={sectionId} onCoursePress={handleCoursePress} title="Popular for Nursing/Paramedic" />;
      case 'workshop_registration':
        return (
          <TouchableOpacity
            key={sectionId}
            activeOpacity={0.8}
            className="mb-12"
            onPress={() => Linking.openURL('https://www.rhhealthcaresimulation.com/courses')}>
            <AspectRatio className="w-full" ratio={16 / 9}>
              <Image
                source={{
                  uri: 'https://d2c3lsl35lix55.cloudfront.net/website-image/Registration+Page.png',
                }}
                className="h-full w-full"
              />
            </AspectRatio>
          </TouchableOpacity>
        );
      case 'prev_workhsop_carousel':
        return <CourseCardsHorizontal key={sectionId} onCoursePress={handleCoursePress} title="Previous Workshops" />;
      default:
        return null;
    }
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="py-20">
        {loading ? (
          <ActivityIndicator size="large" className="mt-10" />
        ) : sections.length > 0 ? (
          sections.map(sec => renderSection(sec.id))
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

function CourseCardsHorizontal({ onCoursePress, title }: { onCoursePress: (course: any) => void, title?: string }) {
  const CardDetailIcon = ({
    IconComponent,
    label,
  }: {
    IconComponent: LucideIcon;
    label: string | number;
  }) => {
    return (
      <View className="mt-2 flex-row items-center gap-1">
        <IconComponent color={'#666'} size={18} />
        <Text className="text-sm">{label}</Text>
      </View>
    );
  };
  return (
    <View className="mb-12">
      {title && <Text className="px-4 text-xl font-semibold">{title}</Text>}
      <ScrollView
        horizontal
        className="mt-3 pl-4"
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-8">
        {COURSE_DATA.map((courseItem) => {
          return (
            <TouchableOpacity
              key={courseItem.slug}
              className="w-[70vw]"
              activeOpacity={0.8}
              onPress={() => onCoursePress(courseItem)}>
              <Image
                source={{ uri: courseItem.bannerImage }}
                className="mx-auto h-auto min-h-40 w-full overflow-hidden rounded-lg object-cover"
                resizeMode="contain"
              />
              <Text className="mt-3 font-medium leading-6">{courseItem.courseTitle}</Text>
              <View className="flex-row gap-6">
                <CardDetailIcon IconComponent={IconClock} label={courseItem.courseHour} />
                <CardDetailIcon IconComponent={MonitorPlay} label={courseItem.numberOfLacture} />
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
