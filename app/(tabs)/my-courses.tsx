import { View, Image } from 'react-native';
import { Text } from '@/components/ui/text';

export default function MyCoursesScreen() {
  return (
    <View className="flex-1 px-6 py-10">
      <Text className="text-xl font-semibold">My course</Text>
      <Image
        source={require('../../assets/images/empty_screen.png')}
        className="mx-auto mt-24 h-64 w-64"
        resizeMode="contain"
      />
      <View className="mt-12 flex-col items-center gap-2">
        <Text className="text-2xl font-semibold">What will you learn first?</Text>
        <Text className="text-base">Your courses will go here</Text>
      </View>
    </View>
  );
}
