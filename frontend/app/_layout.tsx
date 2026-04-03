import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* 1. Agregamos initialRouteName="index" para obligar a la app a empezar ahí */}
      <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
        
        {/* 2. Declaramos explícitamente el index */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* 3. COMENTAMOS EL SANDBOX para que Expo olvide esa ruta por ahora */}
        {/* <Stack.Screen name="sandbox" options={{ title: 'Diseño Circle' }} /> */}

        {/* Grupo de Autenticación */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* Grupo de la App principal (Tabs) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}