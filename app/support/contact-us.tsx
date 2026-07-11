import { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { IconCopy, IconCheck, IconPhone } from '@tabler/icons-react-native';
import { useColorScheme } from 'nativewind';
import * as Clipboard from 'expo-clipboard';

export default function ContactUsScreen() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopy = useCallback(async (text: string, type: 'email' | 'phone') => {
    await Clipboard.setStringAsync(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  }, []);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <>
      <Stack.Screen options={{ title: 'Contact Us', headerBackTitle: 'Back' }} />
      <ScrollView className="flex-1 bg-white p-6 dark:bg-neutral-950">
        <Text className="mb-4 text-2xl font-bold dark:text-white">Contact Us</Text>
        <Text className="mb-8 text-base text-gray-600 dark:text-gray-300">
          We'd love to hear from you. Send us a message or reach out directly.
        </Text>

        <Text className="mb-4 text-xl font-semibold dark:text-white">Contact Info</Text>

        <TouchableOpacity className="mb-6" activeOpacity={0.7} onPress={() => handleCopy('rhhealthcaresimulationcenter@gmail.com', 'email')}>
          <Text className="font-semibold text-gray-800 dark:text-gray-200">
            {' '}
            Email {copiedEmail ? <IconCheck color={isDark ? '#fff' : '#000'} size={18} /> : <IconCopy color={isDark ? '#fff' : '#000'} size={18} />}{' '}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            rhhealthcaresimulationcenter@gmail.com
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="mb-6" activeOpacity={0.7} onPress={() => handleCopy('+91 99289 07780', 'phone')}>
          <Text className="font-semibold text-gray-800 dark:text-gray-200">
            Phone {copiedPhone ? <IconCheck color={isDark ? '#fff' : '#000'} size={18} /> : <IconCopy color={isDark ? '#fff' : '#000'} size={18} />}{' '}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">+91 99289 07780</Text>
        </TouchableOpacity>

        <View className="mb-6">
          <Text className="font-semibold text-gray-800 dark:text-gray-200">Location</Text>
          <Text className="text-gray-600 dark:text-gray-400">
            18-Shakti nagar, Gopalpura bypass road, near Triveni nagar chouraha, Jaipur (Raj)
            -302015
          </Text>
        </View>

        <View className="mb-6">
          <Text className="font-semibold text-gray-800 dark:text-gray-200">Working Hours</Text>
          <Text className="text-gray-600 dark:text-gray-400">Mon - Fri: 9:00 AM - 6:00 PM</Text>
        </View>
      </ScrollView>
    </>
  );
}
