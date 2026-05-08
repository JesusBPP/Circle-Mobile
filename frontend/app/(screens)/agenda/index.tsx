import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';
// 🌟 IMPORTAMOS useFocusEffect PARA RECARGAR DATOS AL VOLVER A LA PANTALLA
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { FondoManager } from '../../../ui/Fondo'; 
import { Calendario } from '../../../components/Agenda/Calendario';
import { EventoCard } from '../../../components/Agenda/EventoCard';
import { CrearCita } from '../../../components/Agenda/CrearCita'; 

import { useAuthStore } from '../../../store/useAuthStore';
import { agendaService } from '../../../features/agenda/agendaService';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AgendaIndex() {
  const { negocioId } = useAuthStore();
  const [tabActiva, setTabActiva] = useState<'agenda' | 'calendario'>('agenda');
  
  const [filtroTiempo, setFiltroTiempo] = useState<'Hoy' | 'Semana' | 'Mes'>('Hoy');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());

  const [citasRaw, setCitasRaw] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 🌟 CAMBIO CLAVE: Cambiamos useEffect por useFocusEffect.
  // Esto hace que cada vez que regreses a esta pantalla, haga el Fetch de nuevo y actualice los colores/horas.
  useFocusEffect(
    useCallback(() => {
      const fetchCitas = async () => {
        if (negocioId) {
          try {
            const data = await agendaService.obtenerCitas(negocioId);
            setCitasRaw(data);
          } catch (error) {
            console.error("Error al cargar la agenda:", error);
          } finally {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setIsLoading(false);
          }
        }
      };
      fetchCitas();
    }, [negocioId])
  );

  const handleGuardarCita = async (nuevaCita: any) => {
    if (!negocioId) return;

    try {
      const citaConSucursal = { ...nuevaCita, id_sucursal: 1 };
      const citaGuardada = await agendaService.crearCita(negocioId, citaConSucursal);
      
      setCitasRaw(prev => [...prev, citaGuardada]);
      setIsModalVisible(false);
      Alert.alert("Éxito", "Actividad agendada correctamente.");

    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message);
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
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const mapCitaToCard = (cita: any) => {
    return {
      id: cita.id,
      tipo: cita.tipo, 
      titulo: cita.titulo || "Actividad Agendada",
      descripcion: cita.descripcion || 'Sin descripción',
      horaInicio: formatHora(cita.fecha_hora_inicio),
      horaFin: formatHora(cita.fecha_hora_fin),
      cliente: cita.cliente, 
      estado: cita.estado,
      fechaReal: new Date(cita.fecha_hora_inicio), 
      fechaCard: formatFechaParaCard(cita.fecha_hora_inicio)
    };
  };

  const citasMapeadas = citasRaw.map(mapCitaToCard);
  
  const citasFiltradasAgenda = citasMapeadas.filter((cita) => {
    const hoy = new Date();
    const f = cita.fechaReal;

    if (filtroTiempo === 'Hoy') {
      return f.getDate() === hoy.getDate() && f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
    }
    if (filtroTiempo === 'Semana') {
      const en7Dias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
      return f >= hoy && f <= en7Dias;
    }
    if (filtroTiempo === 'Mes') {
      return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
    }
    return true;
  }).sort((a, b) => a.fechaReal.getTime() - b.fechaReal.getTime());

  const citasFiltradasCalendario = citasMapeadas.filter((cita) => {
    const f = cita.fechaReal;
    return f.getDate() === fechaSeleccionada.getDate() && 
           f.getMonth() === fechaSeleccionada.getMonth() && 
           f.getFullYear() === fechaSeleccionada.getFullYear();
  }).sort((a, b) => a.fechaReal.getTime() - b.fechaReal.getTime());

  const hoyStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <FondoManager tipoFondo="pattern-light">
      <View style={styles.container}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity style={[styles.tabButton, tabActiva === 'agenda' && styles.tabActive]} onPress={() => setTabActiva('agenda')}>
              <Text style={[styles.tabText, tabActiva === 'agenda' && styles.tabTextActive]}>Agenda</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.tabButton, tabActiva === 'calendario' && styles.tabActive]} onPress={() => setTabActiva('calendario')}>
              <Text style={[styles.tabText, tabActiva === 'calendario' && styles.tabTextActive]}>Calendario</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {isLoading ? (
             <ActivityIndicator size="large" color="#0f52ba" style={{ marginTop: 50 }} />
          ) : tabActiva === 'calendario' ? (
            <View style={styles.calendarioWrapper}>
              
              <Calendario 
                citasBackend={citasMapeadas} 
                fechaSeleccionada={fechaSeleccionada}
                onDateSelect={(date) => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setFechaSeleccionada(date);
                }}
              />
              
              <Text style={styles.sectionTitle}>
                Eventos del {fechaSeleccionada.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              </Text>
              
              {citasFiltradasCalendario.length > 0 ? (
                citasFiltradasCalendario.map(cita => (
                  <EventoCard 
                    key={cita.id} 
                    {...cita} 
                    fechaSimple={cita.fechaCard} 
                    onPress={() => router.push(`/(screens)/agenda/EspacioAgenda?id_cita=${cita.id}` as any)}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>Día despejado. No hay actividades.</Text>
              )}

            </View>
          ) : (
            <View style={styles.agendaWrapper}>
              
              <View style={styles.filterHeaderRow}>
                <View>
                  <Text style={styles.dateTitle}>Eventos</Text>
                  <Text style={styles.dateSubtitle}>{hoyStr}</Text>
                </View>
                
                <View style={{ zIndex: 10 }}>
                  <TouchableOpacity 
                    style={styles.dropdownToggle} 
                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <Text style={styles.dropdownToggleText}>{filtroTiempo}</Text>
                    <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="#3b82f6" />
                  </TouchableOpacity>
                  
                  {isDropdownOpen && (
                    <View style={styles.dropdownMenu}>
                      {['Hoy', 'Semana', 'Mes'].map((opcion: any) => (
                        <TouchableOpacity 
                          key={opcion} 
                          style={styles.dropdownItem} 
                          onPress={() => {
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            setFiltroTiempo(opcion); 
                            setIsDropdownOpen(false); 
                          }}
                        >
                          <Text style={[styles.dropdownItemText, filtroTiempo === opcion && styles.dropdownItemTextActive]}>
                            {opcion}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
              
              {citasFiltradasAgenda.length > 0 ? (
                citasFiltradasAgenda.map(cita => (
                  <EventoCard 
                    key={cita.id} 
                    {...cita} 
                    fechaSimple={cita.fechaCard} 
                    onPress={() => router.push(`/(screens)/agenda/EspacioAgenda?id_cita=${cita.id}` as any)}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No tienes actividades {filtroTiempo === 'Hoy' ? 'hoy' : `en esta ${filtroTiempo.toLowerCase()}`}.</Text>
              )}
            </View>
          )}
          
          <View style={{ height: 40 }}/>
        </ScrollView>

        <CrearCita 
          visible={isModalVisible} 
          negocioId={negocioId}
          onClose={() => setIsModalVisible(false)} 
          onSave={handleGuardarCita} 
        />

      </View>
    </FondoManager>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15, backgroundColor: 'rgba(255, 255, 255, 0.8)' },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: '#f1f5f9' },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 12, padding: 4 },
  tabButton: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 10 },
  tabActive: { backgroundColor: '#ffffff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#1e293b' },
  addButton: { backgroundColor: 'rgb(15, 82, 186)', padding: 8, borderRadius: 12 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  calendarioWrapper: { flex: 1 },
  agendaWrapper: { flex: 1 },
  filterHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, zIndex: 10 },
  dateTitle: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
  dateSubtitle: { fontSize: 14, color: '#64748b', fontWeight: '500', marginTop: 2, textTransform: 'capitalize' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginTop: 10, marginBottom: 15 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94a3b8', fontStyle: 'italic' },
  dropdownToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 5 },
  dropdownToggleText: { fontSize: 14, fontWeight: '700', color: '#3b82f6' },
  dropdownMenu: { position: 'absolute', top: 40, right: 0, backgroundColor: '#ffffff', borderRadius: 10, width: 120, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, paddingVertical: 5, zIndex: 10 },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 15 },
  dropdownItemText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  dropdownItemTextActive: { color: '#3b82f6', fontWeight: '700' }
});