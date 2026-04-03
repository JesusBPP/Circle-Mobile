import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';

// Importamos nuestro "Bloque de Lego" genérico
import { RadialMenu } from '../ui/RadialMenu';
import { DropdownButton } from '../ui/DropdownButton';

export default function Sandbox() {
  
  const handleBackToLogin = () => {
    router.replace('/(auth)/login');
  };

  return (
    // Usamos ScrollView para que si los componentes no caben en la pantalla, podamos bajar
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Sandbox | Variantes UI</Text>
      
      {/* Área donde agrupamos los Botones Desplegables (Acordeones) */}
      <View style={styles.accordionArea}>
        
        {/* ====================================================================
            ⚠️ AQUÍ ESTÁ EL CAMBIO PRINCIPAL (De acuerdo a tu imagen):
            Inyectamos la cuadrícula de RadialMenus DENTRO de este Acordeón.
            ==================================================================== */}
        <DropdownButton 
          title="💼 RadialMenu's (Tus Menús)" 
          variant="card" // Variante con sombras y fondo blanco
        >
          {/* Inyectamos un subtítulo explicativo dentro del acordeón 
          */}
          <Text style={styles.dummyText}>
            A continuación, verás una cuadrícula (Grid) de tus Menús Radiales incrustada directamente en este espacio:
          </Text>

          {/* ⚠️ GRID DE MENÚS RADIALES INCRUSTADO:
              Tomamos la cuadrícula que estaba afuera en el sandbox anterior
              y la pegamos aquí dentro. styles.gridArea_Internal es clave para que se vea bien.
          */}
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

            {/* Variante: CAFÉ */}
            <RadialMenu 
              title="Café"
              mainColor="rgb(92, 53, 25)"     /* --chocolate */
              secondaryColor="rgb(145, 89, 25)"   /* --Cafeligth */
            />

            {/* Variante: MORADO */}
            <RadialMenu 
              title="Morado"
              mainColor="rgb(75, 0, 130)"     /* --indigo */
              secondaryColor="rgb(153, 102, 204)" /* --amethyst */
            />

            {/* Variante: ROSA */}
            <RadialMenu 
              title="Rosa"
              mainColor="rgb(255, 105, 180)"  /* --bubblegum */
              secondaryColor="rgb(255, 182, 193)" /* --pastel-pink */
            />

            {/* 💎 NUEVO: VARIANTE GLOSSY PINK AÑADIDA ABAJO DE LOS DEMÁS 💎 */}
            <RadialMenu 
              title="Glossy Pink (Imagen)" 
              isGlossyPink={true} 
            />

          </View>
        </DropdownButton>
      </View>

      {/* =========================================
          SECCIÓN 2: BOTONES DESPLEGABLES (ACORDEONES)
          ========================================= */}
      <Text style={styles.sectionSubtitle}>2. Botones Desplegables (Acordeones)</Text>
      <View style={styles.accordionArea}>
        
        {/* Variante 1: Card (Contiene texto e inputs) */}
        <DropdownButton title="💼 Configuración del Negocio" variant="card">
          <Text style={styles.dummyText}>Aquí puedes inyectar un formulario completo.</Text>
          <TextInput 
            style={styles.dummyInput} 
            placeholder="Escribe el nombre de la sucursal..." 
            placeholderTextColor="#94a3b8"
          />
        </DropdownButton>

        {/* Variante 2: Outline (Contiene un componente RadialMenu entero adentro) */}
        <DropdownButton title="🚀 Proyectos Rápidos" variant="outline">
          <Text style={styles.dummyText}>Mira cómo metimos un componente dentro de otro componente:</Text>
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <RadialMenu 
              mainColor="rgb(47, 79, 79)" /* Charcoal */
              secondaryColor="rgb(211, 211, 211)" /* Silver */
            />
          </View>
        </DropdownButton>

        {/* Variante 3: Minimal (Contiene una lista simple) */}
        <DropdownButton title="📋 Sub Elementos" variant="minimal">
          <Text style={styles.listItem}>• Sub Elemento #1</Text>
          <Text style={styles.listItem}>• Sub Elemento #2</Text>
          <Text style={styles.listItem}>• Sub Elemento #3</Text>
        </DropdownButton>

      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleBackToLogin}>
        <Text style={styles.logoutText}>Volver al Login</Text>
      </TouchableOpacity>
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
    flexDirection: 'row', // Coloca los elementos uno al lado del otro
    flexWrap: 'wrap',     // Si no caben en una fila, los pasa a la de abajo
    justifyContent: 'space-evenly', // Distribuye el espacio uniformemente
    marginBottom: 30,
  },
  accordionArea: {
    width: '90%', // Ocupa la mayor parte de la pantalla, perfecto para tablets
    marginBottom: 30,
  },
  // ⚠️ NUEVO ESTILO: Cuadrícula interna para los RadialMenus DENTRO del acordeón
  gridArea_Internal: {
    width: '100%', // Ocupa el 100% del ancho DISPONIBLE DENTRO DEL ACORDEÓN
    flexDirection: 'row', // Coloca los elementos uno al lado del otro
    flexWrap: 'wrap',     // Si no caben en una fila, los pasa a la de abajo (Importante)
    justifyContent: 'space-evenly', // Distribuye el espacio uniformemente entre los menús
    marginTop: 15, // Espacio arriba después del dummyText
    paddingBottom: 15, // Pequeño espacio para que no corte el brillo del Glossy Pink
    // Le quitamos el margin lateral grande que tenía la gridArea original para no chocar con los bordes del acordeón
  },
  // --- Estilos de relleno para mostrar adentro de los acordeones ---
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
  logoutButton: {
    backgroundColor: '#94a3b8',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});