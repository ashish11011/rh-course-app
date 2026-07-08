import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { COURSE_DATA } from '@/const/courseData';
import { IconCertificate, IconClock, IconUserCircle } from '@tabler/icons-react-native';
import { Link } from 'expo-router';
import { GraduationCap, MonitorPlay, MoonStarIcon, StarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View, ScrollView } from 'react-native';

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

export default function FeaturedScreen() {
  const { colorScheme } = useColorScheme();

  return (
    <ScrollView className="flex-1" contentContainerClassName="px-4 py-20 pb-32">
      <View className="flex-row gap-2">
        <IconUserCircle size={52} strokeWidth={1} color={'#444'} />
        <View>
          <Text className="text-xl font-medium">Welcome, Ashish Bishnoi</Text>
          <Text>Student</Text>
        </View>
      </View>
      <View className="mt-20 flex-col gap-8">
        {COURSE_DATA.map((courseItem) => {
          return (
            <View key={courseItem.slug}>
              <Image
                source={{ uri: courseItem.bannerImage }}
                className="mx-auto h-auto min-h-52 w-full overflow-hidden rounded-lg object-cover"
                resizeMode="contain"
              />
              <Text className="mt-3 text-lg font-medium leading-7">{courseItem.courseTitle}</Text>
              <View className="flex-row gap-6">
                <View className="mt-2 flex-row items-center gap-0.5">
                  <IconClock color={'#666'} size={20} />
                  <Text>{courseItem.courseHour}</Text>
                </View>
                <View className="mt-2 flex-row items-center gap-0.5">
                  <MonitorPlay color={'#666'} size={20} />
                  <Text>{courseItem.numberOfLacture}</Text>
                </View>
                <View className="mt-2 flex-row items-center gap-0.5 text-green-600">
                  <IconCertificate color={'#16a34a'} size={20} />
                  <Text className="text-green-600">Certificate</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
