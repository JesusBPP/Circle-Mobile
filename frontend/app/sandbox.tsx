import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';

import { FondoManager, TipoFondo } from '../ui/Fondo';
import { RadialMenu, RadialMenuHome } from '../ui/RadialMenu';
import { DropdownButton } from '../ui/DropdownButton';
import { ButtonNeo, ButtonFlatBlock, ButtonGradientArrow, ButtonCleanUI } from '../ui/Button'; 
import { 
  IconRadial, IconBusinessConfig, IconRocket, IconList, 
  IconButtonLayout, IconMusic, IconPower, IconPlus, IconDownload, 
  IconHeart, IconGear, IconSearch, IconStar, IconChevronRight, IconLogout, IconContrast
} from '../ui/Icons'; 

export default function Sandbox() {
  
  // 🌟 Estado para los fondos
  const [backgroundType, setBackgroundType] = useState<TipoFondo>('default');

  const handleBackToLogin = () => {
    router.replace('/(auth)/login');
  };

  const handleGoToVistaUnUI = () => {
    router.push('/vistaUnUI');
  };

  // 🌟 Ciclador de Fondos
  const cycleBackground = () => {
    switch (backgroundType) {
      case 'default': setBackgroundType('dark'); break;
      case 'dark': setBackgroundType('pattern-dark'); break;
      case 'pattern-dark': setBackgroundType('pattern-light'); break;
      case 'pattern-light':
      default: setBackgroundType('default'); break;
    }
  };

  const getButtonText = () => {
    switch (backgroundType) {
      case 'dark': return 'Cambiar a Patrón Oscuro';
      case 'pattern-dark': return 'Cambiar a Patrón Claro';
      case 'pattern-light': return 'Cambiar a Fondo Default';
      default: return 'Cambiar a Fondo Oscuro';
    }
  };

  // 🌟 Colores dinámicos para que el texto principal sobreviva a los fondos oscuros
  const isDarkBackground = backgroundType === 'dark' || backgroundType === 'pattern-dark';
  const mainTitleColor = isDarkBackground ? '#f8fafc' : '#334155';

  return (
    <FondoManager tipoFondo={backgroundType}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <Text style={[styles.title, { color: mainTitleColor }]}>Sandbox | Biblioteca UI</Text>
        
        {/* ========================================================
            🌟 SECCIÓN NUEVA: Control de Fondos Animados
            ======================================================== */}
        <View style={styles.accordionArea}>
          <DropdownButton 
            title="Fondos Animados Circle" 
            variant="outline" 
            icon={<IconContrast size={22} color="#1e293b" />} 
          >
            <Text style={styles.dummyText}>
              Prueba la ambientación global detrás de todos los componentes:
            </Text>
            
            <View style={{ marginTop: 10 }}>
              <ButtonCleanUI 
                title={getButtonText()} 
                iconLeft={<IconContrast size={18} color="#fff"/>} 
                onPress={cycleBackground} 
                mainColor="rgb(34, 139, 34)" 
              />
            </View>
          </DropdownButton>
        </View>

        {/* ========================================================
            SECCIÓN 1: Menús Radiales 
            ======================================================== */}
        <View style={styles.accordionArea}>
          <DropdownButton title="Menús Radiales Circle" variant="card" icon={<IconRadial size={22} color="#1e293b" />}>
            <Text style={styles.dummyText}>Menús con animación de resorte:</Text>
            <View style={styles.gridArea_Internal}>
              <RadialMenu title="Azul" mainColor="rgb(0, 71, 171)" secondaryColor="rgb(135, 206, 235)" />
              <RadialMenu title="Verde" mainColor="rgb(34, 139, 34)" secondaryColor="rgb(0, 201, 87)" />
              <RadialMenu title="Negro" mainColor="rgb(0, 0, 0)" secondaryColor="rgb(47, 79, 79)" />
              <View style={{ width: '100%', alignItems: 'center', marginTop: 20 }}>
                <Text style={[styles.dummyText, { fontWeight: 'bold', marginBottom: 15 }]}>RadialMenuHome (Interactivo 3D):</Text>
                <RadialMenuHome />
              </View>
            </View>
          </DropdownButton>
        </View>

        {/* ========================================================
            SECCIÓN 2: BIBLIOTECA DE BOTONES UI
            ======================================================== */}
        <View style={styles.accordionArea}>
          <DropdownButton title="Botones Circle UI" variant="outline" icon={<IconButtonLayout size={22} color="#1e293b" />}>
            <Text style={styles.dummyText}>Todos los estilos de botones modelados:</Text>
            <View style={[styles.columnDisplay, { paddingBottom: 15 }]}>
              
              <Text style={styles.subSectionTitle}>Style 1: Neomorphic</Text>
              <View style={styles.rowDisplay_Neo}>
                <ButtonNeo title="MUSIC" icon={<IconMusic size={30} color="#ff003c" />} glowColor="#ff003c" />
                <ButtonNeo icon={<IconPower size={28} color="#00e5ff" />} glowColor="#00e5ff" isIconOnly />
              </View>

              <Text style={styles.subSectionTitle}>Style 2: Flat Blocks</Text>
              <ButtonFlatBlock title="Add to Cart" icon={<IconPlus size={20} color="#fff"/>} mainColor="#ff6b35" blockColor="#4a4a4a" />
              <ButtonFlatBlock title="Newsletter" icon={<IconList size={20} color="#fff"/>} mainColor="#ffca3a" blockColor="#4a4a4a" />
              <ButtonFlatBlock title="Download Now" icon={<IconSearch size={20} color="#fff"/>} mainColor="#8ac926" blockColor="#4a4a4a" />
              <ButtonFlatBlock title="Save to Disk" icon={<IconDownload size={20} color="#fff"/>} mainColor="#ff598f" blockColor="#4a4a4a" />
              <ButtonFlatBlock title="Favorite" icon={<IconHeart size={20} color="#fff"/>} mainColor="#1982c4" blockColor="#4a4a4a" />
              <ButtonFlatBlock title="Setting" icon={<IconGear size={20} color="#fff"/>} mainColor="#ff3366" blockColor="#4a4a4a" />

              <Text style={styles.subSectionTitle}>Style 3: Gradient Arrows</Text>
              <ButtonGradientArrow title="Configuration" icon={<IconGear size={24} color="#9d4edd" />} gradientColors={['#9d4edd', '#e0aaff']} />
              <ButtonGradientArrow title="Favorites" icon={<IconStar size={24} color="#00b4d8" />} gradientColors={['#00b4d8', '#90e0ef']} />

              <Text style={styles.subSectionTitle}>Style 4: Clean UI</Text>
              <View style={{ backgroundColor: '#3f3d56', padding: 12, borderRadius: 15, gap: 5 }}>
                <ButtonCleanUI title="Search" iconLeft={<IconSearch size={18} color="#fff"/>} mainColor="#7b2cbf" />
                <ButtonCleanUI title="VPN" statusText="Not Connected" iconLeft={<IconMusic size={18} color="#fff"/>} mainColor="#7b2cbf" />
              </View>
            </View>
          </DropdownButton>
        </View>

        {/* ========================================================
            SECCIÓN 3: Acordeones Anidados
            ======================================================== */}
        <View style={styles.accordionArea}>
          <DropdownButton title="Componentes Desplegables" variant="card" icon={<IconList size={22} color="#1e293b" />}>
            <Text style={styles.dummyText}>Ejemplo de Acordeones anidados:</Text>
            <View style={{ gap: 10, marginTop: 10 }}>
              <DropdownButton title="Configuración Comercial" variant="outline" icon={<IconBusinessConfig size={20} color="#1e293b" />}>
                <Text style={styles.dummyText}>Inyectar formulario.</Text>
                <TextInput style={styles.dummyInput} placeholder="Nombre de sucursal..." placeholderTextColor="#94a3b8"/>
              </DropdownButton>
              <DropdownButton title="Proyectos Rápidos" variant="outline" icon={<IconRocket size={20} color="#1e293b" />}>
                <View style={{ alignItems: 'center', marginTop: 10 }}>
                  <RadialMenu mainColor="rgb(47, 79, 79)" secondaryColor="rgb(211, 211, 211)" />
                </View>
              </DropdownButton>
              <DropdownButton title="Lista Minimalista" variant="minimal" icon={<IconList size={20} color="#1e293b" />}>
                <Text style={styles.listItem}>• Sub Elemento #1</Text>
                <Text style={styles.listItem}>• Sub Elemento #2</Text>
              </DropdownButton>
            </View>
          </DropdownButton>
        </View>

        {/* ========================================================
            NAVEGACIÓN
            ======================================================== */}
        <View style={styles.buttonsContainer}>
          <ButtonCleanUI title="Regresar a VistaUnUI" iconLeft={<IconChevronRight size={18} color="#fff"/>} mainColor="rgb(0, 71, 171)" onPress={handleGoToVistaUnUI} />
          <ButtonCleanUI title="Cerrar Sesión" iconLeft={<IconLogout size={18} color="#fff"/>} mainColor="rgb(47, 79, 79)" onPress={handleBackToLogin} />
        </View>

      </ScrollView>
    </FondoManager>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, alignItems: 'center', paddingVertical: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, marginTop: 20 },
  accordionArea: { width: '90%', marginBottom: 15 },
  gridArea_Internal: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', marginTop: 15, paddingBottom: 15 },
  dummyText: { color: '#475569', marginBottom: 10 },
  dummyInput: { width: '100%', height: 40, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fff' },
  listItem: { color: '#334155', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  buttonsContainer: { width: '85%', alignItems: 'center', marginTop: 20, gap: 12 },
  columnDisplay: { flexDirection: 'column', gap: 8, marginTop: 10 },
  subSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginTop: 15, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 },
  rowDisplay_Neo: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#1e1e1e', padding: 20, borderRadius: 15 }
});