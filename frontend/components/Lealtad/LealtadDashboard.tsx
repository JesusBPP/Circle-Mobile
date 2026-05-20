import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { FondoManager } from '../../ui/Fondo'; 
import { ButtonNeo } from '../../ui/Button'; 
import FiltrosLealtad from './FiltrosLealtad';
import PublicacionCard from './PublicacionCard';
import OfertaCard from './OfertaCard';
import ModalCrearLealtad from './ModalCrearLealtad';

import WorkspaceOferta from './WorkspaceOferta';
import WorkspacePublicacion from './WorkspacePublicacion';
// 🌟 NUEVO: Importamos el Workspace de Calificación
import WorkspaceCalificacion from './WorkspaceCalificacion';

type ViewMode = 'lista' | 'workspaceOferta' | 'workspacePublicacion';

export default function LealtadDashboard() {
  const [filtroActivo, setFiltroActivo] = useState('Ofertas Activas');
  const [modalVisible, setModalVisible] = useState(false);
  
  const [vistaActiva, setVistaActiva] = useState<ViewMode>('lista');
  const [itemSeleccionado, setItemSeleccionado] = useState<any>(null);

  const feedItems = [
    { id: 'o-1', type: 'oferta', titulo: 'Promoción VIP Secreta', descripcion: 'Descuento especial del 50%.', estado: 'Activa', es_publica: false, costo_en_puntos: 150, limite_existencias: 20, fecha: '17 May 2026' },
    { id: 'p-1', type: 'publicacion', titulo: '¡Cerramos el 25 de Diciembre!', descripcion: 'Aviso a clientes.', habilitar_comentarios: false, id_oferta: null, fecha: '16 May 2026' },
    { id: 'o-2', type: 'oferta', titulo: '2x1 en Corte de Cabello', descripcion: 'Ven con un amigo.', estado: 'Inactiva', es_publica: true, costo_en_puntos: null, limite_existencias: null, fecha: '10 May 2026' }
  ];

  const getFilteredItems = () => {
    if (filtroActivo === 'Ofertas Activas') return feedItems.filter(i => i.type === 'oferta' && i.estado === 'Activa');
    if (filtroActivo === 'Publicaciones') return feedItems.filter(i => i.type === 'publicacion');
    if (filtroActivo === 'Ofertas') return feedItems.filter(i => i.type === 'oferta');
    return feedItems; // Para 'Todas'
  };

  const abrirWorkspace = (item: any) => {
    setItemSeleccionado(item);
    setVistaActiva(item.type === 'oferta' ? 'workspaceOferta' : 'workspacePublicacion');
  };

  const handleBack = () => {
    if (vistaActiva !== 'lista') {
      setVistaActiva('lista');
      setItemSeleccionado(null);
    } else {
      router.back();
    }
  };

  // Renderizador Dinámico SPA
  const renderContenidoPrincipal = () => {
    if (vistaActiva === 'workspaceOferta' && itemSeleccionado) {
      return <WorkspaceOferta ofertaMock={itemSeleccionado} />;
    }
    
    if (vistaActiva === 'workspacePublicacion' && itemSeleccionado) {
      return <WorkspacePublicacion publicacionMock={itemSeleccionado} />;
    }

    // 🌟 NUEVO: Renderizado del Workspace de Calificación manteniendo los filtros arriba
    if (filtroActivo === 'Calificación') {
      return (
        <>
          <FiltrosLealtad filtroActivo={filtroActivo} setFiltroActivo={setFiltroActivo} />
          <WorkspaceCalificacion />
        </>
      );
    }

    // Renderizado por defecto de la lista
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
              <Text style={styles.emptyText}>No hay elementos para mostrar.</Text>
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
          idNegocio={1} 
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
  fabContainer: { position: 'absolute', bottom: 30, right: 20, zIndex: 10 }
});