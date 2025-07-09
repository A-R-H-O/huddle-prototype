import React, { useEffect } from 'react';
import Navigator from './src/navigation';
import { createTamagui, TamaguiProvider } from 'tamagui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defaultConfig } from '@tamagui/config/v4';
import { useAuthStore, AuthState } from './src/store/authStore';
import {  auth } from './src/core/services/firebase';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const queryClient = new QueryClient();
const config = createTamagui(defaultConfig);

async function registerForPushNotificationsAsync() {
  if (!Constants.isDevice) {
    alert('Must use physical device for Push Notifications');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push token:', token);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

const App = () => {
  const setUser = useAuthStore((state: AuthState) => state.setUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('User:', user);
      setUser(user);
    });
    return unsubscribe;
  }, [setUser]);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <TamaguiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Navigator />
      </QueryClientProvider>
    </TamaguiProvider>
  );
};

export default App;
