import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EventoCardProps {
  id: number;
  tipo: 'cita' | 'evento';
  titulo: string;
  descripcion: string;
  horaInicio: string;
  horaFin: string;
  cliente?: string;
  // 🌟 NUEVO: Recibe la fecha formateada (ej: "5 may")
  fechaSimple: string; 
  estado: 'Programada' | 'Finalizada' | 'Cancelada' | 'Pendiente';
  onPress?: () => void;
}

export const EventoCard = ({ id, tipo, titulo, descripcion, horaInicio, horaFin, cliente, fechaSimple, estado, onPress }: EventoCardProps) => {
  const esCita = tipo === 'cita';
  const esFinalizada = estado === 'Finalizada';
  const esCancelada = estado === 'Cancelada';

  // 🌟 LÓGICA DE COLORES ACTUALIZADA:
  // Zafiro (Cita), Forest Green (Evento), Dorado Metálico (Finalizada), Rojo Mate (Cancelada)
  let colorPrincipal = esCita ? 'rgb(15, 82, 186)' : 'rgb(34, 139, 34)';
  if (esFinalizada) colorPrincipal = 'rgb(212, 175, 55)';
  // 🌟 Nuevo Rojo Mate suave para Canceladas
  if (esCancelada) colorPrincipal = 'rgb(200, 70, 70)'; 

  // Colores de fondo suaves (Glassmorphism ligero)
  const colorFondo = esFinalizada 
    ? 'rgba(212, 175, 55, 0.08)' 
    : (esCancelada ? 'rgba(200, 70, 70, 0.08)' : (esCita ? 'rgba(15, 82, 186, 0.08)' : 'rgba(34, 139, 34, 0.08)'));
  
  const icono = esCita ? 'person' : 'calendar';

  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.cardContainer} onPress={onPress}>
      {/* Línea lateral de color */}
      <View style={[styles.colorBar, { backgroundColor: colorPrincipal }]} />
      
      <View style={styles.content}>
        {/* ==========================================
            🌟 LADO IZQUIERDO: FECHA Y HORARIO
            ========================================== */}
        <View style={styles.timeContainer}>
          {/* Nuevo Texto de Fecha Simple (ej: 5 may) */}
          <Text style={[styles.dateTextSmall, { color: colorPrincipal }]}>{fechaSimple}</Text>
          <View style={styles.timeWrapper}>
            <Text style={styles.timeText}>{horaInicio}</Text>
            <Text style={styles.timeTextSmall}>{horaFin}</Text>
          </View>
        </View>

        {/* Separador vertical */}
        <View style={styles.divider} />

        {/* ==========================================
            🌟 LADO DERECHO: DETALLES
            ========================================== */}
        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            {/* Badge de Tipo */}
            <View style={[styles.badge, { backgroundColor: colorFondo }]}>
              <Ionicons name={icono as any} size={12} color={colorPrincipal} />
              <Text style={[styles.badgeText, { color: colorPrincipal }]}>
                {esCita ? 'Cita' : 'Evento'}
              </Text>
            </View>

            {/* Badge de Estado Dinámico */}
            <View style={[styles.badgeEstado, { borderColor: colorPrincipal }]}>
               <Text style={[styles.badgeEstadoText, { color: colorPrincipal }]}>
                 {estado}
               </Text>
            </View>
          </View>
          
          <Text style={styles.title} numberOfLines={1}>{titulo}</Text>
          
          {cliente && (
            <Text style={styles.clientText}>
              <Ionicons name="person-circle-outline" size={14} color="#64748b" /> {cliente}
            </Text>
          )}
          
          <Text style={styles.description} numberOfLines={1}>{descripcion}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  colorBar: {
    width: 6,
    height: '100%',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: 15,
  },
  timeContainer: {
    width: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTextSmall: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'lowercase',
    marginBottom: 6,
  },
  timeWrapper: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  timeTextSmall: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 15,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 8,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  badgeEstado: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  badgeEstadoText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  clientText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#94a3b8',
  }
});