import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function AccountScreen() {
  return (
    <View className="flex-1 items-center bg-background px-4 pt-20">
      <View className="mb-4 h-28 w-28 items-center justify-center rounded-full bg-gray-300">
        <Text className="text-4xl font-bold text-gray-600">JD</Text>
      </View>
      <Text className="mb-1 text-2xl font-bold">John Doe</Text>
      <Text className="text-base text-gray-500">johndoe@example.com</Text>
      <View className="h-12"></View>
      <View className="w-full">
        {ACCOUNT_LINKS.map(({ title, links }) => {
          return (
            <Card className="gap-0 p-0">
              <CardHeader className="p-0">
                <Text className="font-bold">{title}</Text>
              </CardHeader>

              <CardContent className="p-0">
                {links.map(({ name }) => {
                  return (
                    <View>
                      <Text>{name}</Text>
                      <Separator />
                    </View>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </View>
    </View>
  );
}

const ACCOUNT_LINKS = [
  {
    title: 'Account',
    links: [
      {
        name: 'Profile',
      },
      {
        name: 'Purchase History',
      },
    ],
  },
  {
    title: 'Learning',
    links: [
      {
        name: 'My workshops',
      },
      {
        name: 'My Certificates',
      },
      {
        name: 'Seminar',
      },
    ],
  },
  {
    title: 'Support',
    links: [
      {
        name: 'Faqs',
      },
      {
        name: 'Terms & condition',
      },
      {
        name: 'Privacy policy',
      },
    ],
  },
];
