import { useEffect } from 'react';
import { Alert, BackHandler, Linking, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, ShieldAlert } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type UpdateRequiredScreenProps = {
  message: string;
  storeUrl: string;
};

export default function UpdateRequiredScreen({ message, storeUrl }: UpdateRequiredScreenProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  const handleUpdatePress = async () => {
    if (!storeUrl) {
      Alert.alert('Update unavailable', 'The app store link is not configured yet.');
      return;
    }

    const canOpen = await Linking.canOpenURL(storeUrl);
    if (!canOpen) {
      Alert.alert('Unable to open store', 'Please try again later.');
      return;
    }

    Linking.openURL(storeUrl);
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4 dark:bg-neutral-950">
      <View className="flex-1 justify-center px-7">
        <View className="items-center">
          <View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
            <ShieldAlert size={48} color={isDark ? '#6ee7b7' : '#047857'} strokeWidth={1.6} />
          </View>

          <Text className="text-center text-3xl font-extrabold text-slate-950 dark:text-white">
            Update Required
          </Text>
          <Text className="mt-4 text-center text-base leading-6 text-slate-500 dark:text-slate-400">
            {message}
          </Text>
        </View>

        <Button
          className="mt-10 h-12 rounded-lg bg-emerald-700 active:bg-emerald-800"
          onPress={handleUpdatePress}>
          <Download size={19} color="#ffffff" />
          <Text className="text-base font-semibold text-white">Update Now</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
