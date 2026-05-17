import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import FormularioOferta from './FormularioOferta';
import FormularioPublicacion from './FormularioPublicacion';

interface ModalCrearLealtadProps {
  visible: boolean;
  onClose: () => void;
  idNegocio: number;
  onSuccess?: () => void; // Callback para refrescar la lista del Dashboard
}

export default function ModalCrearLealtad({ visible, onClose, idNegocio, onSuccess }: ModalCrearLealtadProps) {
  const [activeTab, setActiveTab] = useState<'oferta' | 'publicacion'>('oferta');

  const handleSuccessClose = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalContainer}>
          
          {/* BARRA SUPERIOR DE CIERRE */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nueva Actividad</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* SELECTOR DE PESTAÑAS (TABS BANNER MUTABLE) */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'oferta' && styles.tabButtonOfertaActive
              ]}
              activeOpacity={0.8}
              onPress={() => setActiveTab('oferta')}
            >
              <Ionicons 
                name="gift-outline" 
                size={18} 
                color={activeTab === 'oferta' ? '#ffffff' : '#64748b'} 
              />
              <Text style={[styles.tabText, activeTab === 'oferta' && styles.tabTextActive]}>
                Nueva Oferta
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'publicacion' && styles.tabButtonPubActive
              ]}
              activeOpacity={0.8}
              onPress={() => setActiveTab('publicacion')}
            >
              <Ionicons 
                name="megaphone-outline" 
                size={18} 
                color={activeTab === 'publicacion' ? '#ffffff' : '#64748b'} 
              />
              <Text style={[styles.tabText, activeTab === 'publicacion' && styles.tabTextActive]}>
                Publicación
              </Text>
            </TouchableOpacity>
          </View>

          {/* INYECCIÓN DINÁMICA DE FORMULARIOS */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {activeTab === 'oferta' ? (
              <FormularioOferta idNegocio={idNegocio} onSuccess={handleSuccessClose} />
            ) : (
              <FormularioPublicacion idNegocio={idNegocio} onSuccess={handleSuccessClose} />
            )}
          </ScrollView>

        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // Capa oscura traslúcida Enterprise
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '88%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  closeButton: {
    backgroundColor: '#f1f5f9',
    padding: 6,
    borderRadius: 50,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabButtonOfertaActive: {
    backgroundColor: '#2563eb', // Azul para el dominio de ofertas financieras
    borderColor: '#1d4ed8',
  },
  tabButtonPubActive: {
    backgroundColor: '#16a34a', // Verde corporativo para posts/marketing social
    borderColor: '#15803d',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  }
});