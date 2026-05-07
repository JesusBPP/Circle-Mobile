import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CalendarioProps {
  fechaSeleccionada?: Date;
  onDateSelect?: (date: Date) => void;
  citasBackend?: any[]; 
}

export const Calendario = ({ fechaSeleccionada = new Date(), onDateSelect, citasBackend = [] }: CalendarioProps) => {
  const [vista, setVista] = useState<'mes' | 'semana'>('mes');
  const [fechaActual, setFechaActual] = useState(fechaSeleccionada);

  const diasSemana = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  // 🌟 NAVEGACIÓN INTELIGENTE: Si está en Semana suma 7 días, si está en Mes suma 1 mes
  const cambiarTiempo = (incremento: number) => {
    if (vista === 'semana') {
      const nueva = new Date(fechaSeleccionada);
      nueva.setDate(nueva.getDate() + (incremento * 7));
      if (onDateSelect) onDateSelect(nueva);
      // Mantenemos sincronizado el encabezado del mes
      setFechaActual(new Date(nueva.getFullYear(), nueva.getMonth(), 1));
    } else {
      const nueva = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + incremento, 1);
      setFechaActual(nueva);
    }
  };

  const generarDias = () => {
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const dias = [];

    // ==========================================
    // 🌟 RENDERIZADO DE VISTA "SEMANA" (7 Días)
    // ==========================================
    if (vista === 'semana') {
      const domingo = new Date(fechaSeleccionada);
      domingo.setDate(fechaSeleccionada.getDate() - fechaSeleccionada.getDay());

      for (let i = 0; i < 7; i++) {
        const current = new Date(domingo);
        current.setDate(domingo.getDate() + i);
        
        const esHoy = current.getDate() === new Date().getDate() && current.getMonth() === new Date().getMonth() && current.getFullYear() === new Date().getFullYear();
        const esSeleccionado = current.getDate() === fechaSeleccionada.getDate() && current.getMonth() === fechaSeleccionada.getMonth() && current.getFullYear() === fechaSeleccionada.getFullYear();

        // Buscamos citas para los Puntos de colores
        const citasDelDia = citasBackend.filter(c => {
          const f = c.fechaReal;
          return f.getDate() === current.getDate() && f.getMonth() === current.getMonth() && f.getFullYear() === current.getFullYear();
        });

        // 🌟 LÓGICA DE ESTADOS Y COLORES
        // Excluimos las Finalizadas y Canceladas de los colores base (azul y verde)
        const tieneCita = citasDelDia.some(c => c.tipo === 'cita' && c.estado !== 'Cancelada' && c.estado !== 'Finalizada');
        const tieneEvento = citasDelDia.some(c => c.tipo === 'evento' && c.estado !== 'Cancelada' && c.estado !== 'Finalizada');
        const tieneFinalizada = citasDelDia.some(c => c.estado === 'Finalizada');
        const tieneCancelada = citasDelDia.some(c => c.estado === 'Cancelada');

        dias.push(
          <TouchableOpacity 
            key={`sem-${i}`} 
            style={[styles.dayCell, esSeleccionado && styles.selectedCell, esHoy && !esSeleccionado && styles.todayCell]}
            onPress={() => onDateSelect && onDateSelect(current)}
          >
            <Text style={[styles.dayText, (esHoy || esSeleccionado) && styles.todayText]}>{current.getDate()}</Text>
            
            <View style={styles.indicatorContainer}>
              {tieneCita && <View style={[styles.dot, { backgroundColor: 'rgb(15, 82, 186)' }]} />}
              {tieneEvento && <View style={[styles.dot, { backgroundColor: 'rgb(34, 139, 34)' }]} />}
              {/* 🌟 PUNTO DORADO METÁLICO PARA FINALIZADAS */}
              {tieneFinalizada && <View style={[styles.dot, { backgroundColor: 'rgb(212, 175, 55)' }]} />}
              {/* PUNTO ROJO MATE PARA CANCELADAS */}
              {tieneCancelada && <View style={[styles.dot, { backgroundColor: 'rgb(200, 70, 70)' }]} />}
            </View>
          </TouchableOpacity>
        );
      }
    } 
    // ==========================================
    // 🌟 RENDERIZADO DE VISTA "MES" (Cuadrícula completa)
    // ==========================================
    else {
      const primerDiaMes = new Date(año, mes, 1).getDay();
      const diasEnMes = new Date(año, mes + 1, 0).getDate();
      
      // Espacios vacíos al inicio del mes
      for (let i = 0; i < primerDiaMes; i++) {
        dias.push(<View key={`empty-${i}`} style={styles.dayCell} />);
      }
      
      for (let dia = 1; dia <= diasEnMes; dia++) {
        const current = new Date(año, mes, dia);
        const esHoy = dia === new Date().getDate() && mes === new Date().getMonth() && año === new Date().getFullYear();
        const esSeleccionado = dia === fechaSeleccionada.getDate() && mes === fechaSeleccionada.getMonth() && año === fechaSeleccionada.getFullYear();

        const citasDelDia = citasBackend.filter(c => {
          const f = c.fechaReal;
          return f.getDate() === dia && f.getMonth() === mes && f.getFullYear() === año;
        });

        // 🌟 LÓGICA DE ESTADOS Y COLORES
        const tieneCita = citasDelDia.some(c => c.tipo === 'cita' && c.estado !== 'Cancelada' && c.estado !== 'Finalizada');
        const tieneEvento = citasDelDia.some(c => c.tipo === 'evento' && c.estado !== 'Cancelada' && c.estado !== 'Finalizada');
        const tieneFinalizada = citasDelDia.some(c => c.estado === 'Finalizada');
        const tieneCancelada = citasDelDia.some(c => c.estado === 'Cancelada');

        dias.push(
          <TouchableOpacity 
            key={`mes-${dia}`} 
            style={[styles.dayCell, esSeleccionado && styles.selectedCell, esHoy && !esSeleccionado && styles.todayCell]}
            onPress={() => onDateSelect && onDateSelect(current)}
          >
            <Text style={[styles.dayText, (esHoy || esSeleccionado) && styles.todayText]}>{dia}</Text>
            
            <View style={styles.indicatorContainer}>
              {tieneCita && <View style={[styles.dot, { backgroundColor: 'rgb(15, 82, 186)' }]} />}
              {tieneEvento && <View style={[styles.dot, { backgroundColor: 'rgb(34, 139, 34)' }]} />}
              {/* 🌟 PUNTO DORADO METÁLICO PARA FINALIZADAS */}
              {tieneFinalizada && <View style={[styles.dot, { backgroundColor: 'rgb(212, 175, 55)' }]} />}
              {/* PUNTO ROJO MATE PARA CANCELADAS */}
              {tieneCancelada && <View style={[styles.dot, { backgroundColor: 'rgb(200, 70, 70)' }]} />}
            </View>
          </TouchableOpacity>
        );
      }
    }
    return dias;
  };

  const nombreMes = fechaActual.toLocaleString('es-ES', { month: 'long' });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => cambiarTiempo(-1)}>
            <Ionicons name="chevron-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{nombreMes.toUpperCase()} {fechaActual.getFullYear()}</Text>
          <TouchableOpacity onPress={() => cambiarTiempo(1)}>
            <Ionicons name="chevron-forward" size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, vista === 'semana' && styles.toggleBtnActive]}
            onPress={() => {
              setVista('semana');
              // Al pasar a semana, aseguramos que la fechaActual muestre el mes del día seleccionado
              setFechaActual(new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), 1));
            }}
          >
            <Text style={[styles.toggleText, vista === 'semana' && styles.toggleTextActive]}>SEM</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, vista === 'mes' && styles.toggleBtnActive]}
            onPress={() => setVista('mes')}
          >
            <Text style={[styles.toggleText, vista === 'mes' && styles.toggleTextActive]}>MES</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weekDaysRow}>
        {diasSemana.map((dia, idx) => (
          <Text key={idx} style={styles.weekDayText}>{dia}</Text>
        ))}
      </View>

      <View style={styles.gridContainer}>
        {generarDias()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  monthSelector: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  monthText: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', width: 120, textAlign: 'center' },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 10, padding: 3 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: '#ffffff', elevation: 1, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
  toggleText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  toggleTextActive: { color: 'rgb(15, 82, 186)' },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  weekDayText: { width: 35, textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: '#94a3b8' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  selectedCell: { backgroundColor: 'rgba(15, 82, 186, 0.15)', borderRadius: 12 },
  todayCell: { borderWidth: 1, borderColor: 'rgba(15, 82, 186, 0.5)', borderRadius: 12 },
  dayText: { fontSize: 15, color: '#1e293b', fontWeight: '500' },
  todayText: { color: 'rgb(15, 82, 186)', fontWeight: 'bold' },
  indicatorContainer: { flexDirection: 'row', marginTop: 4, gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 2.5 }
});