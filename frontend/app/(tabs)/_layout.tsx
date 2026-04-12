import React from 'react';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        // 🌟 Esta línea apaga la "Bottom Bar" nativa en todas tus pantallas
        tabBarStyle: { display: 'none' } 
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="config" />
    </Tabs>
  );
}