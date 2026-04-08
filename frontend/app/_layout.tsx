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
        
        {/* Pantalla de Laboratorio (Sandbox) */}
        <Stack.Screen name="sandbox" options={{ title: 'Patio de Pruebas Circle' }} />

        {/* 🌟 NUEVA PANTALLA: Vista de un componente individual */}
        <Stack.Screen 
          name="vistaUnUI" 
          options={{ 
            headerShown: true, // Mostramos la barra superior para poder regresar fácilmente
            title: 'Detalle de Componente', // El título que aparecerá arriba
            headerBackTitle: 'Atrás' // Texto de la flecha de regreso en iOS
          }} 
        />

        {/* Grupo de Autenticación */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* Grupo de la App principal (Tabs) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}