import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';

export default function AboutUsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'About Us', headerBackTitle: 'Back' }} />
      <ScrollView
        className="flex-1 bg-white p-6 dark:bg-neutral-950"
        showsVerticalScrollIndicator={false}>
        <Text className="mb-4 text-2xl font-bold dark:text-white">About Us</Text>
        <Text className="text-base leading-6 text-gray-600 dark:text-gray-300">
          Welcome to the RH Healthcare Simulation Center. Our mission is to provide state-of-the-art simulation-based medical education.
          {'\n\n'}
          We strive to improve patient safety and healthcare quality through rigorous training, research, and innovation in clinical practice.
        </Text>
      </ScrollView>
    </>
  );
}
