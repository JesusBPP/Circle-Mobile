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
        
        <Stack.Screen name="sandbox" options={{ title: 'Patio de Pruebas Circle' }} />

        <Stack.Screen 
          name="vistaUnUI" 
          options={{ headerShown: true, title: 'Detalle de Componente', headerBackTitle: 'Atrás' }} 
        />

        {/* 🌟 Pantalla global del Catálogo de Soluciones */}
        <Stack.Screen 
          name="(screens)/menuSoluciones" 
          options={{ headerShown: true, title: 'Catálogo de Soluciones', headerBackTitle: 'Atrás' }} />

        {/* Grupos de Enrutamiento Automático */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}