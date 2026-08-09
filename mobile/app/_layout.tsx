import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/colors';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
  const checkAuthSession = useAuthStore((state) => state.checkAuthSession);

  useEffect(() => {
    checkAuthSession();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(customer)" />
        <Stack.Screen name="(shop)" />
      </Stack>
    </>
  );
}
