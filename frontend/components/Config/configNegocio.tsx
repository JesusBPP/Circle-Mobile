import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { FondoManager } from '../../ui/Fondo'; 
import { useAuthStore, Herramienta } from '../../store/useAuthStore'; 
import { ButtonNeo, ButtonCardSolucion } from '../../ui/Button';
import { IconPower } from '../../ui/Icons';
import { DropdownButton } from '../../ui/DropdownButton'; 

import { solucionesService } from '../../features/soluciones/solucionesService';

export default function ConfigNegocio() {
  const { negocioId, negocioName, logout, herramientasActivas, removeHerramienta } = useAuthStore();

  const handleLogout = () => {
    logout(); 
    router.replace('/(auth)/login'); 
  };

  const handleDesinstalar = (herramienta: Herramienta) => {
    
    // 🕵️ SENSOR DEL FRONTEND: ¿Qué tiene esta herramienta en la RAM?
    console.log("🕵️ FRONTEND INTENTANDO BORRAR:", JSON.stringify(herramienta));

    if (!herramienta.id) {
      Alert.alert(
        "Error de Sincronización", 
        "No se pudo identificar esta herramienta. Por favor, cierra sesión y vuelve a entrar para sincronizar tus datos."
      );
      return;
    }

    Alert.alert(
      "Desinstalar Solución",
      `¿Estás seguro que deseas eliminar ${herramienta.nombre} de tu negocio?\n\nNo te preocupes, los datos históricos de tus clientes se mantendrán a salvo.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Desinstalar", 
          style: "destructive",
          onPress: async () => {
            if (!negocioId) return;
            
            try {
              await solucionesService.desinstalarSolucion(negocioId, herramienta.id);
              removeHerramienta(herramienta.id);
              Alert.alert("Éxito", `${herramienta.nombre} se removió correctamente.`);
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );
  };

  const obtenerColores = (nombre: string): readonly [string, string, ...string[]] => {
    if (nombre.toLowerCase() === 'agenda') return ['#1e3a8a', '#3b82f6', '#00d4ff'];
    if (nombre.toLowerCase() === 'lealtad') return ['#4c1d95', '#8b5cf6', '#d946ef'];
    return ['#334155', '#475569', '#94a3b8']; 
  };

  return (
    <FondoManager tipoFondo="pattern-light">
      <View style={styles.container}>
        
        <View style={styles.content}>
          <Text style={styles.title}>Ajustes de {negocioName}</Text>
          <Text style={styles.subtitle}>Aquí puedes administrar tu negocio y suscripciones.</Text>
          
          <View style={styles.dropdownWrapper}>
            <DropdownButton 
              title={`Mis Herramientas (${herramientasActivas.length})`}
              variant="card"
              icon={<Ionicons name="apps" size={22} color="#3b82f6" />}
            >
              {herramientasActivas.length === 0 ? (
                <Text style={styles.emptyText}>Aún no has instalado ninguna solución.</Text>
              ) : (
                <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                  {herramientasActivas.map((tool, index) => (
                    <ButtonCardSolucion 
                      // 🛡️ DOBLE PROTECCIÓN: Si por alguna razón tool.id falla, usamos el index para que React no truene
                      key={tool.id ? tool.id.toString() : `fallback-${index}`}
                      title={tool.nombre}
                      description="Toca para gestionar o desinstalar."
                      iconName={tool.icono}
                      watermarkIconName={`${tool.icono}-outline`}
                      gradientColors={obtenerColores(tool.nombre)}
                      isCompact={true}
                      onPress={() => handleDesinstalar(tool)}
                    />
                  ))}
                </ScrollView>
              )}
            </DropdownButton>
          </View>

        </View>

        <View style={styles.logoutContainer}>
          <ButtonNeo 
            title="CERRAR SESIÓN" 
            icon={<IconPower size={28} color="#ff003c" />} 
            glowColor="#ff003c" 
            isRectangular={true} 
            onPress={handleLogout}
          />
        </View>

      </View>
    </FondoManager>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingVertical: 50, paddingHorizontal: 20 },
  content: { flex: 1, alignItems: 'center', marginTop: 20, width: '100%' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#1e293b' },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 30, paddingHorizontal: 10, color: '#64748b' },
  dropdownWrapper: { width: '100%', marginTop: 10 },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', paddingVertical: 10 },
  logoutContainer: { width: '100%', alignItems: 'center', marginBottom: 20 }
});