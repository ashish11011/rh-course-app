import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { SunIcon, MoonStarIcon } from 'lucide-react-native';
import { IconBook, IconSearch, IconStar, IconUser } from '@tabler/icons-react-native';

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 mr-4 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}

export default function TabLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: NAV_THEME[colorScheme ?? 'light'].colors.primary,
        headerRight: () => <ThemeToggle />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Featured',
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon as={IconStar} className="size-5" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon as={IconSearch} className="size-5" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-courses"
        options={{
          title: 'My Courses',
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon as={IconBook} className="size-5" color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon as={IconUser} className="size-5" color={color} />,
        }}
      />
    </Tabs>
  );
}
