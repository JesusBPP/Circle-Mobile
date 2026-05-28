import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { FondoManager } from '../../ui/Fondo'; 
import { ButtonNeo } from '../../ui/Button'; 
import FiltrosLealtad from './FiltrosLealtad';
import PublicacionCard from './PublicacionCard';
import OfertaCard from './OfertaCard';
import ModalCrearLealtad from './ModalCrearLealtad';

import WorkspaceOferta from './WorkspaceOferta';
import WorkspacePublicacion from './WorkspacePublicacion';
import WorkspaceCalificacion from './WorkspaceCalificacion';

// 🌟 INTEGRACIÓN DE RED Y CAPA DE DATOS ENTERPRISE
import { useAuthStore } from '../../store/useAuthStore';
import lealtadService from '../../features/lealtad/lealtadService';

type ViewMode = 'lista' | 'workspaceOferta' | 'workspacePublicacion';

export default function LealtadDashboard() {
  const { negocioId } = useAuthStore(); 
  
  const [filtroActivo, setFiltroActivo] = useState('Ofertas Activas');
  const [modalVisible, setModalVisible] = useState(false);
  const [vistaActiva, setVistaActiva] = useState<ViewMode>('lista');
  const [itemSeleccionado, setItemSeleccionado] = useState<any>(null);

  // Estados dinámicos de servidor
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 🌟 OBTENER CONFIGURACIÓN REAL DE FASTAPI
  const fetchDashboardData = async () => {
    if (!negocioId) return;
    try {
      setIsLoading(true);
      const data = await lealtadService.obtenerDashboard(negocioId);
      setFeedItems(data.feed_items || []);
    } catch (error) {
      console.error("Error detectado en la sincronización del Motor de Lealtad:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [negocioId])
  );

  const getFilteredItems = () => {
    if (filtroActivo === 'Ofertas Activas') {
      return feedItems.filter(i => i.type === 'oferta' && i.estado?.toLowerCase() === 'activa');
    }
    if (filtroActivo === 'Publicaciones') {
      return feedItems.filter(i => i.type === 'publicacion');
    }
    if (filtroActivo === 'Ofertas') {
      return feedItems.filter(i => i.type === 'oferta');
    }
    return feedItems; 
  };

  const abrirWorkspace = (item: any) => {
    setItemSeleccionado(item);
    setVistaActiva(item.type === 'oferta' ? 'workspaceOferta' : 'workspacePublicacion');
  };

  const handleNavegarDesdeComentario = (tipo: 'workspaceOferta' | 'workspacePublicacion', idReferencia: string) => {
    const itemEncontrado = feedItems.find(i => i.id === idReferencia);
    if (itemEncontrado) {
      setItemSeleccionado(itemEncontrado);
      setVistaActiva(tipo);
    }
  };

  const handleBack = () => {
    if (vistaActiva !== 'lista') {
      setVistaActiva('lista');
      setItemSeleccionado(null);
      fetchDashboardData(); 
    } else {
      router.back();
    }
  };

  const renderContenidoPrincipal = () => {
    if (isLoading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loaderText}>Sincronizando feed transaccional...</Text>
        </View>
      );
    }

    // 🌟 CORRECCIÓN ARQUITECTÓNICA: Mapeo estricto de las props de los Workspaces
    if (vistaActiva === 'workspaceOferta' && itemSeleccionado) {
      return <WorkspaceOferta ofertaData={itemSeleccionado} />;
    }
    
    if (vistaActiva === 'workspacePublicacion' && itemSeleccionado) {
      return <WorkspacePublicacion publicacionData={itemSeleccionado} />;
    }

    if (filtroActivo === 'Calificación') {
      return (
        <>
          <FiltrosLealtad filtroActivo={filtroActivo} setFiltroActivo={setFiltroActivo} />
          <WorkspaceCalificacion onNavegarAWorkspace={handleNavegarDesdeComentario} />
        </>
      );
    }

    return (
      <>
        <FiltrosLealtad filtroActivo={filtroActivo} setFiltroActivo={setFiltroActivo} />
        <FlatList
          data={getFilteredItems()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => item.type === 'oferta' 
            ? <OfertaCard data={item} onPress={() => abrirWorkspace(item)} />
            : <PublicacionCard data={item} onPress={() => abrirWorkspace(item)} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No hay elementos en esta categoría.</Text>
            </View>
          }
        />
        <View style={styles.fabContainer}>
          <ButtonNeo 
            icon={<Ionicons name="add" size={28} color="#ffffff" />}
            isIconOnly={true} glowColor="#3b82f6" backgroundColor="#2563eb" underGlow={true}
            onPress={() => setModalVisible(true)}
          />
        </View>
      </>
    );
  };

  return (
    <FondoManager tipoFondo="pattern-light">
      <View style={styles.container}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>
              {vistaActiva === 'lista' ? 'Motor de Lealtad' : 'Workspace'}
            </Text>
            {vistaActiva !== 'lista' && (
              <Text style={[styles.headerSubtitle, { color: vistaActiva === 'workspaceOferta' ? '#2563eb' : '#16a34a' }]}>
                {vistaActiva === 'workspaceOferta' ? 'OFERTA' : 'PUBLICACIÓN'}
              </Text>
            )}
          </View>
          <View style={styles.placeholder}/>
        </View>

        {renderContenidoPrincipal()}

        <ModalCrearLealtad 
          visible={modalVisible} 
          onClose={() => setModalVisible(false)} 
          idNegocio={negocioId || 1} 
          onSuccess={fetchDashboardData} 
        />

      </View>
    </FondoManager>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: 'rgba(255, 255, 255, 0.95)', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: '#f1f5f9' },
  headerTitles: { alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  headerSubtitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  placeholder: { width: 40 },
  listContent: { padding: 20, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 50 },
  emptyText: { marginTop: 10, fontSize: 15, color: '#94a3b8', fontWeight: '500' },
  fabContainer: { position: 'absolute', bottom: 30, right: 20, zIndex: 10 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 12, fontSize: 14, color: '#64748b', fontWeight: '500' }
});