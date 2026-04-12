import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';

// 🌟 Importamos el componente de Admin para probarlo
import HomeAdmin from '../components/Home/homeAdmin';

import { ButtonCleanUI } from '../ui/Button'; 
import { IconSandbox, IconLogout } from '../ui/Icons';

export default function VistaUnUI() {
  
  const handleLogout = () => router.replace('/(auth)/login');
  const handleGoToSandbox = () => router.push('/sandbox');

  return (
    <View style={styles.wrapper}>
      
      {/* 🌟 RENDERIZAMOS TEMPORALMENTE EL DASHBOARD DE ADMIN */}
      <HomeAdmin />

      {/* ========================================================
          BOTONES FLOTANTES DE NAVEGACIÓN (Para el entorno de pruebas)
          ======================================================== */}
      <View style={styles.floatingNav}>
        <ButtonCleanUI 
          title="Ir a Sandbox (Biblioteca UI)" 
          iconLeft={<IconSandbox size={18} color="#fff"/>} 
          onPress={handleGoToSandbox}
          mainColor="rgb(15, 82, 186)" 
        />

        <ButtonCleanUI 
          title="Cerrar Sesión" 
          iconLeft={<IconLogout size={18} color="#fff"/>} 
          onPress={handleLogout}
          mainColor="rgb(47, 79, 79)" 
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  floatingNav: {
    position: 'absolute',
    bottom: 30, 
    width: '100%',
    alignItems: 'center',
    gap: 12, 
    paddingHorizontal: '10%',
  }
});