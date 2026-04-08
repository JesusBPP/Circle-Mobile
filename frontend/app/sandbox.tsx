import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';

// 🌟 Importamos ambos menús y nuestros nuevos íconos
import { RadialMenu, RadialMenuHome } from '../ui/RadialMenu';
import { DropdownButton } from '../ui/DropdownButton';
import { IconRadial, IconBusinessConfig, IconRocket, IconList } from '../ui/Icons';

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
      <Text style={styles.title}>Sandbox | Variantes UI</Text>
      
      {/* Área donde agrupamos los Botones Desplegables (Acordeones) */}
      <View style={styles.accordionArea}>
        
        {/* Acordeón de Menús Radiales con ícono personalizado */}
        <DropdownButton 
          title="RadialMenu's (Tus Menús)" 
          variant="card" 
          icon={<IconRadial size={22} color="#1e293b" />} // 🌟 Ícono Inyectado
        >
          <Text style={styles.dummyText}>
            A continuación, verás una cuadrícula (Grid) de tus Menús Radiales incrustada directamente en este espacio:
          </Text>

          <View style={styles.gridArea_Internal}>
            
            {/* Variante: AZUL */}
            <RadialMenu 
              title="Azul"
              mainColor="rgb(0, 71, 171)"     /* --cobalt-blue */
              secondaryColor="rgb(135, 206, 235)" /* --sky-blue */
            />

            {/* Variante: VERDE */}
            <RadialMenu 
              title="Verde"
              mainColor="rgb(34, 139, 34)"    /* --forest-green */
              secondaryColor="rgb(0, 201, 87)"    /* --emerald */
            />

            {/* Variante: NEGRO (Nuevo) */}
            <RadialMenu 
              title="Negro"
              mainColor="rgb(0, 0, 0)"        /* --pure-black */
              secondaryColor="rgb(47, 79, 79)"    /* --slate-gray */
            />

            {/* 🌟 NUESTRO MENÚ DINÁMICO E INTERACTIVO */}
            <View style={{ width: '100%', alignItems: 'center', marginTop: 20 }}>
              <Text style={[styles.dummyText, { fontWeight: 'bold', marginBottom: 15 }]}>
                RadialMenuHome (Interactivo):
              </Text>
              <RadialMenuHome />
            </View>

          </View>
        </DropdownButton>
      </View>

      <Text style={styles.sectionSubtitle}>2. Botones Desplegables (Acordeones)</Text>
      <View style={styles.accordionArea}>
        
        <DropdownButton 
          title="Configuración del Negocio" 
          variant="card"
          icon={<IconBusinessConfig size={20} color="#1e293b" />}
        >
          <Text style={styles.dummyText}>Aquí puedes inyectar un formulario completo.</Text>
          <TextInput 
            style={styles.dummyInput} 
            placeholder="Escribe el nombre de la sucursal..." 
            placeholderTextColor="#94a3b8"
          />
        </DropdownButton>

        <DropdownButton 
          title="Proyectos Rápidos" 
          variant="outline"
          icon={<IconRocket size={20} color="#1e293b" />}
        >
          <Text style={styles.dummyText}>Mira cómo metimos un componente dentro de otro componente:</Text>
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <RadialMenu 
              mainColor="rgb(47, 79, 79)" 
              secondaryColor="rgb(211, 211, 211)" 
            />
          </View>
        </DropdownButton>

        <DropdownButton 
          title="Sub Elementos" 
          variant="minimal"
          icon={<IconList size={20} color="#1e293b" />}
        >
          <Text style={styles.listItem}>• Sub Elemento #1</Text>
          <Text style={styles.listItem}>• Sub Elemento #2</Text>
          <Text style={styles.listItem}>• Sub Elemento #3</Text>
        </DropdownButton>

      </View>

      {/* 🌟 Contenedor de Botones de Navegación */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.navButton} onPress={handleGoToVistaUnUI}>
          <Text style={styles.navButtonText}>Ir a VistaUnUI</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleBackToLogin}>
          <Text style={styles.logoutText}>Volver al Login</Text>
        </TouchableOpacity>
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
  sectionSubtitle: {
    width: '90%',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: '5%',
    textTransform: 'uppercase',
  },
  gridArea: {
    width: '100%',
    flexDirection: 'row', 
    flexWrap: 'wrap',     
    justifyContent: 'space-evenly', 
    marginBottom: 30,
  },
  accordionArea: {
    width: '90%', 
    marginBottom: 30,
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
    width: '90%',
    alignItems: 'center',
    marginTop: 10,
  },
  navButton: {
    backgroundColor: 'rgb(15, 82, 186)', // Azul Cobalt
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#94a3b8',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});