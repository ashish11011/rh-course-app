import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Text } from '@/components/ui/text';
import { COURSE_DATA } from '@/const/courseData';
import { IconCertificate, IconClock, IconUserCircle } from '@tabler/icons-react-native';
import { Link, router } from 'expo-router';
import { LucideIcon, MonitorPlay } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View, ScrollView, TouchableOpacity, Linking } from 'react-native';

export default function FeaturedScreen() {
  const { colorScheme } = useColorScheme();

  const handleCoursePress = (course: any) => {
    router.push(course.slug);
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="py-20">
        <View className="flex-row gap-2 px-4">
          <IconUserCircle size={52} strokeWidth={1} color={'#444'} />
          <View>
            <Text className="text-xl font-medium">Welcome, Ashish Bishnoi</Text>
            <Text>Student</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => Linking.openURL('https://www.rhhealthcaresimulation.com/courses')}>
          <AspectRatio className="mt-12 w-full" ratio={16 / 9}>
            <Image
              source={{
                uri: 'https://d2c3lsl35lix55.cloudfront.net/website-image/Registration+Page.png',
              }}
              className="h-full w-full"
            />
          </AspectRatio>
        </TouchableOpacity>

        <CourseCardsHorizontal onCoursePress={handleCoursePress} />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => Linking.openURL('https://www.rhhealthcaresimulation.com/courses')}>
          <AspectRatio className="mt-12 w-full" ratio={16 / 9}>
            <Image
              source={{
                uri: 'https://d2c3lsl35lix55.cloudfront.net/website-image/Registration+Page.png',
              }}
              className="h-full w-full"
            />
          </AspectRatio>
        </TouchableOpacity>

        <CourseCardsHorizontal onCoursePress={handleCoursePress} />
      </ScrollView>
    </View>
  );
}

function CourseCardsHorizontal({ onCoursePress }: { onCoursePress: (course: any) => void }) {
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
    <View>
      <Text className="mt-12 px-4 text-xl font-semibold">Popular for Nursing/Paramedic</Text>
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
