import React, { useState } from 'react';
import { View, Text, Image, ScrollView, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useColorScheme } from 'nativewind';
import { StatusBar } from 'expo-status-bar';

const { height } = Dimensions.get('window');

export default function OfflineScreen() {
  const { colorScheme } = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const netInfo = useNetInfo();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate checking network for a short time
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const bgColor = isDark ? '#0a0a0a' : '#ffffff';
  const secondaryTextColor = isDark ? '#a1a1aa' : '#52525b';

  return (
    <View style={[{ flex: 1, backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={textColor} />
        }
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Image
            source={require('@/assets/images/bg-removed-offline-image.png')}
            style={{ width: 250, height: 250, resizeMode: 'contain', marginBottom: 30 }}
          />
          <Text style={{ fontSize: 22, fontWeight: '600', color: textColor, textAlign: 'center', marginBottom: 10 }}>
            We're having trouble loading your content
          </Text>
          <Text style={{ fontSize: 16, color: secondaryTextColor, textAlign: 'center' }}>
            Please pull to refresh
          </Text>
        </View>
      </ScrollView>

      <View style={{ backgroundColor: '#ef4444', padding: 15, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'white', fontWeight: '500', fontSize: 14 }}>
          No network connection
        </Text>
      </View>
    </View>
  );
}
