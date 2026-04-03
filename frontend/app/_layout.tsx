import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
        
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* 1. DESCOMENTAMOS EL SANDBOX para que vuelva a estar disponible en la navegación */}
        <Stack.Screen name="sandbox" options={{ title: 'Patio de Pruebas Circle' }} />

        {/* Grupo de Autenticación */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* Grupo de la App principal (Tabs) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}