import { ScrollView, View, Pressable, Share as RNShare } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  BadgeQuestionMark,
  ChevronRight,
  CreditCard,
  FileBadge,
  Info,
  Mail,
  MonitorPlay,
  Presentation,
  Share,
  User,
  LogOut,
} from 'lucide-react-native';
import { IconUserFilled } from '@tabler/icons-react-native';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/authSlice';
import * as SecureStore from 'expo-secure-store';

export default function AccountScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const dispatch = useDispatch();

  const handlePress = async (link: any) => {
    if (link.name === 'Share this app') {
      RNShare.share({
        message: 'Check out this amazing app!',
      });
    } else if (link.name === 'Logout') {
      await SecureStore.deleteItemAsync('userToken');
      dispatch(logout());
      router.replace('/(auth)/login' as any);
    } else if (link.href) {
      router.push(link.href as any);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-neutral-950">
      <View className="w-full flex-1 items-center">
        <View className="w-full flex-1 items-center pt-20">
          <LinearGradient
            colors={isDark ? ['#064e3b', '#0a0a0a'] : ['#77bfa3', '#f8fafc']}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />
          <View className="mb-4 h-28 w-28 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">
            {/* <Text className="text-4xl font-bold text-gray-600">JD</Text> */}
            <IconUserFilled size={24} color={isDark ? '#e2e8f0' : '#000'} />
          </View>
          <Text className="mb-1 text-2xl font-bold dark:text-white">Your account</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">johndoe@example.com</Text>
          <View className="h-12"></View>
        </View>
        <View className="my-12 flex w-full flex-col gap-5 px-5">
          {ACCOUNT_LINKS.map(({ title, links }) => {
            return (
              <Card
                key={title}
                className="border-1 gap-0 border-neutral-600 bg-white p-0 shadow-sm dark:bg-neutral-900">
                <CardHeader className="px-4 py-2">
                  <Text className="text-lg font-bold dark:text-white">{title}</Text>
                </CardHeader>

                <CardContent className="p-0">
                  {links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Pressable
                        key={link.name}
                        onPress={() => handlePress(link)}
                        className="flex-row items-center justify-between border-t border-gray-100 px-4 py-3 last:border-0 active:bg-slate-100 dark:border-neutral-800 dark:active:bg-neutral-800">
                        <View className="flex-row items-center gap-3">
                          <Icon
                            size={18}
                            color={isDark ? '#cbd5e1' : '#444'}
                            className="text-gray-50"
                          />
                          <Text className="text-sm text-[#444] dark:text-slate-200">
                            {link.name}
                          </Text>
                        </View>
                        <ChevronRight size={18} color={isDark ? '#64748b' : '#ccc'} />
                      </Pressable>
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
        href: '/profile',
      },
      {
        name: 'Purchase History',
        icon: CreditCard,
        href: '/purchase-history',
      },
    ],
  },
  {
    title: 'Learning',
    links: [
      {
        name: 'Course',
        icon: MonitorPlay,
        href: '/courses',
      },
      {
        name: 'My workshops',
        icon: Presentation,
        href: '/workshops',
      },
      {
        name: 'My Certificates',
        icon: FileBadge,
        href: '/certificates',
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
        href: '/support/faqs',
      },
      {
        name: 'About us',
        icon: Info,
        href: '/support/about-us',
      },
      {
        name: 'Contact us',
        icon: Mail,
        href: '/support/contact-us',
      },
      {
        name: 'Logout',
        icon: LogOut,
      },
    ],
  },
];
