import { Tabs, router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { SunIcon, MoonStarIcon } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchPurchasedCourses, fetchAllCourses } from '@/store/coursesSlice';
import { useEffect } from 'react';
import {
  IconBook,
  IconBookFilled,
  IconPlayCardStar,
  IconPlayCardStarFilled,
  IconSearch,
  IconSearchFilled,
  IconStar,
  IconStarFilled,
  IconUser,
  IconUserFilled,
} from '@tabler/icons-react-native';

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
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchAllCourses());
    if (isAuthenticated) {
      dispatch(fetchPurchasedCourses());
    }
  }, [isAuthenticated, dispatch]);

  const requireAuth = (e: any) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push('/(auth)/login');
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: NAV_THEME[colorScheme ?? 'light'].colors.primary,
        // headerRight: () => <ThemeToggle />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Featured',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Icon as={focused ? IconStarFilled : IconStar} className="size-6" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Icon as={focused ? IconSearchFilled : IconSearch} className="size-6" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="idcard"
        options={{
          title: 'ID Card',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Icon
              as={focused ? IconPlayCardStarFilled : IconPlayCardStar}
              className="size-6"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-courses"
        listeners={{ tabPress: requireAuth }}
        options={{
          title: 'My Courses',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Icon as={focused ? IconBookFilled : IconBook} className="size-6" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        listeners={{ tabPress: requireAuth }}
        options={{
          title: 'Account',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Icon as={focused ? IconUserFilled : IconUser} className="size-6" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
