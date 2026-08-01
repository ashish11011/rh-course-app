import React, { useCallback, useMemo, forwardRef } from 'react';
import { View, StyleSheet, Image, Linking } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import {
  IconClock,
  IconCertificate,
  IconExternalLink,
  IconCheck,
} from '@tabler/icons-react-native';
import { LucideIcon, MonitorPlay } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { cn } from '@/lib/utils';

export type Course = any;

interface Props {
  course: Course | null;
}

const CourseBottomSheet = forwardRef<BottomSheet, Props>(({ course }, ref) => {
  const snapPoints = useMemo(() => ['70%', '80%'], []);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  const CourseDetailIcon = ({
    IconComponent,
    label,
  }: {
    IconComponent: LucideIcon;
    label: string | number;
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

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      handleComponent={null}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: isDark ? '#0a0a0a' : '#ffffff' }}
      backdropComponent={renderBackdrop}>
      <BottomSheetScrollView
        className={`${isDark ? 'bg-neutral-950' : 'bg-white'} flex-1`}
        showsVerticalScrollIndicator={false}>
        {course ? (
          <>
            <Image
              source={{ uri: course.bannerImage }}
              className="h-52 w-full rounded-t-lg object-cover"
              resizeMode="cover"
            />
            <View className="flex-1 px-4 py-6">
              <Text className="text-xl font-semibold">{course.courseTitle}</Text>

              <View className="mt-6 w-full flex-col gap-2">
                <CourseDetailIcon IconComponent={IconClock} label={course.courseHour + ' Hrs'} />
                <CourseDetailIcon
                  IconComponent={MonitorPlay}
                  label={course.numberOfLacture + ' Lactures'}
                />
                <CourseDetailIcon
                  IconComponent={IconCertificate}
                  label={'Certificate after completion'}
                />
              </View>

              {/* What you will learn */}
              <View className="mt-10">
                <SectionHeading title="What you will learn" />
                <View className="mt-3 flex-col gap-3">
                  {course.whatYoullLearn.map((txt: string) => (
                    <View key={txt} className="flex-row gap-2">
                      <IconCheck color={isDark ? '#fff' : '#000'} size={18} />
                      <Text className={` ${isDark ? 'text-gray-300' : 'text-gray-500'} text-sm`}>
                        {txt}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <SectionHeading className="mt-10" title="Description" />
              <Text className="mt-2 text-sm leading-6">{course.courseOverview}</Text>
              <Button
                className="sticky bottom-0 mt-12 active:bg-neutral-700 dark:bg-green-700"
                onPress={() => Linking.openURL('https://www.rhhealthcaresimulation.com/courses')}>
                <Text className="dark:text-neutral-200">View new course</Text>
                <IconExternalLink size={18} color={isDark ? '#e5e5e5' : '#fff'} />
              </Button>
            </View>
          </>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

export default CourseBottomSheet;
