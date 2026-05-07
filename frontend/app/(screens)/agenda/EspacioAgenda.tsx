import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { FondoManager } from '../../../ui/Fondo';
import { WorkSpace } from '../../../components/Agenda/WorkSpace';

import { agendaService } from '../../../features/agenda/agendaService';

export default function EspacioAgenda() {
  const { id_cita } = useLocalSearchParams();
  
  const [citaBaseDatos, setCitaBaseDatos] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetallesCita = async () => {
      if (id_cita) {
        try {
          const data = await agendaService.obtenerCitaPorId(Number(id_cita));
          setCitaBaseDatos(data);
        } catch (error) {
          console.error(error);
          Alert.alert("Error", "No se pudieron cargar los detalles de la actividad.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchDetallesCita();
  }, [id_cita]);

  const handleGuardarEdicion = async (nuevosDatos: any) => {
    try {
      // Si recibimos un error 400 (Empalme de horario), caerá al Catch e imprimirá el Alert
      const actualizada = await agendaService.actualizarCita(Number(id_cita), nuevosDatos);
      setCitaBaseDatos(actualizada);
      Alert.alert("Éxito", "Cambios guardados correctamente.");
    } catch (error: any) {
      Alert.alert("Cuidado", error.message);
    }
  };

  const formatHora = (isoString: string) => {
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  };

  const formatFechaParaCard = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
  };

  let citaTransformada = null;
  let colorPrincipal = '#cbd5e1';

  if (citaBaseDatos) {
    
    citaTransformada = {
      id: citaBaseDatos.id,
      tipo: citaBaseDatos.tipo, // Directo del Backend
      titulo: citaBaseDatos.titulo || 'Actividad',
      descripcion: citaBaseDatos.descripcion || '',
      horaInicio: formatHora(citaBaseDatos.fecha_hora_inicio),
      horaFin: formatHora(citaBaseDatos.fecha_hora_fin),
      fechaSimple: formatFechaParaCard(citaBaseDatos.fecha_hora_inicio),
      fecha_hora_inicio_raw: citaBaseDatos.fecha_hora_inicio, 
      cliente: citaBaseDatos.cliente,
      estado: citaBaseDatos.estado,
      notas_internas: citaBaseDatos.notas_internas || ''
    };

    // 🌟 SOLUCIÓN PUNTO 1: Barra Color Rojo Mate para Canceladas
    const esFinalizada = citaTransformada.estado === 'Finalizada';
    const esCancelada = citaTransformada.estado === 'Cancelada';

    if (esCancelada) {
      colorPrincipal = 'rgb(200, 70, 70)'; // Rojo Mate
    } else if (esFinalizada) {
      colorPrincipal = 'rgb(212, 175, 55)'; // Dorado
    } else {
      colorPrincipal = citaBaseDatos.tipo === 'cita' ? 'rgb(15, 82, 186)' : 'rgb(34, 139, 34)';
    }
  }

  return (
    <FondoManager tipoFondo="pattern-light">
      <View style={styles.container}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Workspace</Text>
            {citaTransformada && <Text style={[styles.headerSubtitle, { color: colorPrincipal }]}>{citaTransformada.fechaSimple}</Text>}
          </View>
          
          <TouchableOpacity style={styles.optionsButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* 🌟 LA BARRA AHORA RESPETA EL ROJO MATE */}
        <View style={[styles.topColorBand, { backgroundColor: colorPrincipal }]} />

        {isLoading ? (
           <ActivityIndicator size="large" color="#0f52ba" style={{ marginTop: 50 }} />
        ) : (
           citaTransformada && (
             <WorkSpace 
                citaMock={citaTransformada} 
                onGuardarEdicion={handleGuardarEdicion} 
             />
           )
        )}

      </View>
    </FondoManager>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15, backgroundColor: '#ffffff', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, zIndex: 10 },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: '#f1f5f9' },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  headerSubtitle: { fontSize: 11, fontWeight: '800', marginTop: 2 },
  optionsButton: { padding: 8, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  topColorBand: { width: '100%', height: 4 }
});