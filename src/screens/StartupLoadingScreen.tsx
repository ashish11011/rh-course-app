import { ActivityIndicator, View } from 'react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/components/ui/text';

export default function StartupLoadingScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-neutral-950">
      <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#047857'} />
      <Text className="mt-4 text-sm text-slate-500 dark:text-slate-400">Starting app...</Text>
    </View>
  );
}
