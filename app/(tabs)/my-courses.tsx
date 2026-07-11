import { View, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { IconExternalLink } from '@tabler/icons-react-native';
import { useColorScheme } from 'nativewind';

export default function MyCoursesScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 px-6 dark:bg-neutral-950">
        <Text className="text-xl font-semibold">My course</Text>
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
