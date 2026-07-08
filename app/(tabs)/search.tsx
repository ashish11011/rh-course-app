import { View } from 'react-native';
import { Input } from '@/components/ui/input';

export default function SearchScreen() {
  return (
    <View className="flex-1 px-6 py-10">
      <Input placeholder="Search" />
    </View>
  );
}
