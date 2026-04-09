import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';

// 🌟 Importamos ambos menús, nuestros íconos, el Dropdown y TODOS los botones
import { RadialMenu, RadialMenuHome } from '../ui/RadialMenu';
import { DropdownButton } from '../ui/DropdownButton';
import { ButtonNeo, ButtonFlatBlock, ButtonGradientArrow, ButtonCleanUI } from '../ui/Button'; 
import { 
  IconRadial, IconBusinessConfig, IconRocket, IconList, 
  IconButtonLayout, IconMusic, IconPower, IconPlus, IconDownload, 
  IconHeart, IconGear, IconSearch, IconStar, IconChevronRight, IconLogout 
} from '../ui/Icons'; 

export default function Sandbox() {
  
  const handleBackToLogin = () => {
    router.replace('/(auth)/login');
  };

  const handleGoToVistaUnUI = () => {
    // Usamos push para navegar y poder regresar con la flecha
    router.push('/vistaUnUI');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Sandbox | Biblioteca UI</Text>
      
      {/* ========================================================
          SECCIÓN 1: Menús Radiales (Tus Menús)
          ======================================================== */}
      <View style={styles.accordionArea}>
        <DropdownButton 
          title="Menús Radiales Circle" 
          variant="card" 
          icon={<IconRadial size={22} color="#1e293b" />} 
        >
          <Text style={styles.dummyText}>
            Tus menús con animación de resorte, formados por aros concéntricos:
          </Text>

          <View style={styles.gridArea_Internal}>
            <RadialMenu title="Azul" mainColor="rgb(0, 71, 171)" secondaryColor="rgb(135, 206, 235)" />
            <RadialMenu title="Verde" mainColor="rgb(34, 139, 34)" secondaryColor="rgb(0, 201, 87)" />
            <RadialMenu title="Negro" mainColor="rgb(0, 0, 0)" secondaryColor="rgb(47, 79, 79)" />
            
            <View style={{ width: '100%', alignItems: 'center', marginTop: 20 }}>
              <Text style={[styles.dummyText, { fontWeight: 'bold', marginBottom: 15 }]}>
                RadialMenuHome (Interactivo 3D):
              </Text>
              <RadialMenuHome />
            </View>
          </View>
        </DropdownButton>
      </View>

      {/* ========================================================
          SECCIÓN 2: BIBLIOTECA DE BOTONES UI
          ======================================================== */}
      <View style={styles.accordionArea}>
        <DropdownButton 
          title="Botones Circle UI" 
          variant="outline" 
          icon={<IconButtonLayout size={22} color="#1e293b" />} 
        >
          <Text style={styles.dummyText}>
            Todos los estilos de botones modelados en nuestra biblioteca:
          </Text>

          <View style={[styles.columnDisplay, { paddingBottom: 15 }]}>
            
            {/* STYLE 1: NEOMORPHIC WITH GLOW */}
            <Text style={styles.subSectionTitle}>Style 1: Neomorphic</Text>
            <View style={styles.rowDisplay_Neo}>
              <ButtonNeo title="MUSIC" icon={<IconMusic size={30} color="#ff003c" />} glowColor="#ff003c" />
              <ButtonNeo icon={<IconPower size={28} color="#00e5ff" />} glowColor="#00e5ff" isIconOnly />
            </View>

            {/* STYLE 2: FLAT WITH ACCENT COLOR BLOCKS */}
            <Text style={styles.subSectionTitle}>Style 2: Flat Blocks</Text>
            <ButtonFlatBlock title="Add to Cart" icon={<IconPlus size={20} color="#fff"/>} mainColor="#ff6b35" blockColor="#4a4a4a" />
            <ButtonFlatBlock title="Newsletter" icon={<IconList size={20} color="#fff"/>} mainColor="#ffca3a" blockColor="#4a4a4a" />
            <ButtonFlatBlock title="Download Now" icon={<IconSearch size={20} color="#fff"/>} mainColor="#8ac926" blockColor="#4a4a4a" />
            
            <ButtonFlatBlock title="Save to Disk" icon={<IconDownload size={20} color="#fff"/>} mainColor="#ff598f" blockColor="#4a4a4a" />
            <ButtonFlatBlock title="Favorite" icon={<IconHeart size={20} color="#fff"/>} mainColor="#1982c4" blockColor="#4a4a4a" />
            <ButtonFlatBlock title="Setting" icon={<IconGear size={20} color="#fff"/>} mainColor="#ff3366" blockColor="#4a4a4a" />

            {/* STYLE 3: GRADIENT WITH ARROW POINTS */}
            <Text style={styles.subSectionTitle}>Style 3: Gradient Arrows</Text>
            <ButtonGradientArrow title="Configuration" icon={<IconGear size={24} color="#9d4edd" />} gradientColors={['#9d4edd', '#e0aaff']} />
            <ButtonGradientArrow title="Favorites" icon={<IconStar size={24} color="#00b4d8" />} gradientColors={['#00b4d8', '#90e0ef']} />

            {/* STYLE 4: CLEAN UI */}
            <Text style={styles.subSectionTitle}>Style 4: Clean UI</Text>
            <View style={{ backgroundColor: '#3f3d56', padding: 12, borderRadius: 15, gap: 5 }}>
              <ButtonCleanUI title="Search" iconLeft={<IconSearch size={18} color="#fff"/>} mainColor="#7b2cbf" />
              <ButtonCleanUI title="VPN" statusText="Not Connected" iconLeft={<IconMusic size={18} color="#fff"/>} mainColor="#7b2cbf" />
            </View>

          </View>
        </DropdownButton>
      </View>

      {/* ========================================================
          🌟 SECCIÓN 3: Acordeones (DropDownButton) ANIDADOS
          ======================================================== */}
      <View style={styles.accordionArea}>
        {/* Acordeón Principal que envuelve a los otros */}
        <DropdownButton 
          title="Componentes Desplegables" 
          variant="card" 
          icon={<IconList size={22} color="#1e293b" />}
        >
          <Text style={styles.dummyText}>
            Ejemplo de Acordeones anidados dentro de un Acordeón principal:
          </Text>
          
          <View style={{ gap: 10, marginTop: 10 }}>
            {/* Acordeón Hijo 1 */}
            <DropdownButton title="Configuración Comercial" variant="outline" icon={<IconBusinessConfig size={20} color="#1e293b" />}>
              <Text style={styles.dummyText}>Aquí puedes inyectar un formulario.</Text>
              <TextInput style={styles.dummyInput} placeholder="Nombre de sucursal..." placeholderTextColor="#94a3b8"/>
            </DropdownButton>

            {/* Acordeón Hijo 2 */}
            <DropdownButton title="Proyectos Rápidos" variant="outline" icon={<IconRocket size={20} color="#1e293b" />}>
              <Text style={styles.dummyText}>Componentes dentro de componentes:</Text>
              <View style={{ alignItems: 'center', marginTop: 10 }}>
                <RadialMenu mainColor="rgb(47, 79, 79)" secondaryColor="rgb(211, 211, 211)" />
              </View>
            </DropdownButton>

            {/* Acordeón Hijo 3 */}
            <DropdownButton title="Lista Minimalista" variant="minimal" icon={<IconList size={20} color="#1e293b" />}>
              <Text style={styles.listItem}>• Sub Elemento #1</Text>
              <Text style={styles.listItem}>• Sub Elemento #2</Text>
            </DropdownButton>
          </View>
          
        </DropdownButton>
      </View>

      {/* ========================================================
          SECCIÓN DE NAVEGACIÓN
          ======================================================== */}
      <View style={styles.buttonsContainer}>
        <ButtonCleanUI 
          title="Regresar a VistaUnUI" 
          iconLeft={<IconChevronRight size={18} color="#fff"/>} 
          mainColor="rgb(0, 71, 171)" 
          // 🌟 ¡Añadimos la función de navegación aquí!
          onPress={handleGoToVistaUnUI} 
        />

        <ButtonCleanUI 
          title="Cerrar Sesión" 
          iconLeft={<IconLogout size={18} color="#fff"/>} 
          mainColor="rgb(47, 79, 79)" 
          // 🌟 ¡Añadimos la función de cierre de sesión aquí!
          onPress={handleBackToLogin} 
        />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 20,
    marginTop: 20,
  },
  accordionArea: {
    width: '90%', 
    marginBottom: 15,
  },
  gridArea_Internal: {
    width: '100%', 
    flexDirection: 'row', 
    flexWrap: 'wrap',     
    justifyContent: 'space-evenly', 
    marginTop: 15, 
    paddingBottom: 15, 
  },
  dummyText: {
    color: '#475569',
    marginBottom: 10,
  },
  dummyInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  listItem: {
    color: '#334155',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  buttonsContainer: {
    width: '85%',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  columnDisplay: {
    flexDirection: 'column',
    gap: 8, 
    marginTop: 10,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 15,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rowDisplay_Neo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 15,
  }
});