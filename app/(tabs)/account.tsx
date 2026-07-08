import { ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  BadgeQuestionMark,
  ChevronRight,
  CreditCard,
  FileBadge,
  Info,
  MonitorPlay,
  Presentation,
  Share,
  User,
} from 'lucide-react-native';
import { IconUserFilled } from '@tabler/icons-react-native';

export default function AccountScreen() {
  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="w-full flex-1 items-center">
        <View className="w-full flex-1 items-center pt-20">
          <LinearGradient
            colors={['#77bfa3', '#f8fafc']}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />
          <View className="mb-4 h-28 w-28 items-center justify-center rounded-full bg-slate-50">
            {/* <Text className="text-4xl font-bold text-gray-600">JD</Text> */}
            <IconUserFilled size={24} />
          </View>
          <Text className="mb-1 text-2xl font-bold">Your account</Text>
          <Text className="text-sm text-gray-500">johndoe@example.com</Text>
          <View className="h-12"></View>
        </View>
        <View className="my-12 flex w-full flex-col gap-5 px-5">
          {ACCOUNT_LINKS.map(({ title, links }) => {
            return (
              <Card key={title} className="gap-0 border-0 bg-white p-0 shadow-sm">
                <CardHeader className="px-4 py-2">
                  <Text className="text-lg font-bold">{title}</Text>
                </CardHeader>

                <CardContent className="p-0">
                  {links.map(({ name, icon }) => {
                    const Icon = icon;
                    return (
                      <View
                        key={name}
                        className="flex-row items-center justify-between border-t border-gray-100 px-4 py-3 last:border-0">
                        <View className="flex-row items-center gap-3">
                          <Icon size={18} color={'#444'} className="text-gray-50" />
                          <Text className="text-sm text-[#444]">{name}</Text>
                        </View>
                        <ChevronRight size={18} color={'#ccc'} />
                      </View>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const ACCOUNT_LINKS = [
  {
    title: 'Account',
    links: [
      {
        name: 'Profile',
        icon: User,
      },
      {
        name: 'Purchase History',
        icon: CreditCard,
      },
    ],
  },
  {
    title: 'Learning',
    links: [
      {
        name: 'Course',
        icon: MonitorPlay,
      },
      {
        name: 'My workshops',
        icon: Presentation,
      },
      {
        name: 'My Certificates',
        icon: FileBadge,
      },
    ],
  },
  {
    title: 'Support',
    links: [
      {
        name: 'Share this app',
        icon: Share,
      },
      {
        name: 'Faqs',
        icon: BadgeQuestionMark,
      },
      {
        name: 'About us',
        icon: Info,
      },
    ],
  },
];
