import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, Alert, Platform, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { BuscadorUsuarios } from '../../ui/BuscadorUsuarios';
import lealtadService from '../../features/lealtad/lealtadService';

interface ServicioDisponible {
  id: number;
  nombre: string;
  costo: number;
  tipo_producto: string;
}

interface FormularioOfertaProps {
  idNegocio: number;
  onSuccess: () => void;
}

/**
 * Bloque de Lego del motor NxN: un requisito o recompensa para armar una oferta.
 * - Requisito: lo que el cliente debe cumplir (ej: comprar 2 servicios, gasto mínimo)
 * - Recompensa: lo que el cliente obtiene (ej: 20% descuento, $100 de descuento)
 */
interface OfertaRegla {
  id_temporal: number;
  tipo_regla: 'requisito' | 'recompensa';
  id_servicio_disponible: number | null;
  cantidad: number | null;
  porcentaje_descuento: number | null;
  monto_descuento: number | null;
  monto_minimo: number | null;
}

export default function FormularioOferta({ idNegocio, onSuccess }: FormularioOfertaProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [costoEnPuntos, setCostoEnPuntos] = useState('');
  const [limiteStock, setLimiteStock] = useState('');
  const [limitePorUsuario, setLimitePorUsuario] = useState('');
  
  const [esPublica, setEsPublica] = useState(true);
  
  const [usuariosWhitelist, setUsuariosWhitelist] = useState<any[]>([]);

  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000));
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFin, setShowPickerFin] = useState(false);

  /** Estado del constructor de reglas NxN — siempre 1 requisito + 1 recompensa por defecto */
  const [reglas, setReglas] = useState<OfertaRegla[]>([
    {
      id_temporal: 1,
      tipo_regla: 'requisito',
      id_servicio_disponible: null,
      cantidad: null,
      porcentaje_descuento: null,
      monto_descuento: null,
      monto_minimo: null,
    },
    {
      id_temporal: 2,
      tipo_regla: 'recompensa',
      id_servicio_disponible: null,
      cantidad: null,
      porcentaje_descuento: null,
      monto_descuento: null,
      monto_minimo: null,
    },
  ]);
  const [mostrarReglas, setMostrarReglas] = useState(true);
  const nextIdTemporalRef = useRef(3);

  /** Servicios disponibles para el selector de reglas */
  const [serviciosDisponibles, setServiciosDisponibles] = useState<ServicioDisponible[]>([]);

  /** Estado para vista previa de la oferta */
  const [mostrarPreview, setMostrarPreview] = useState(false);

  /** Estado para selector de sucursales: si null/[], se crea en todas; si tiene IDs, solo en esas */
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState<Array<{id: number, nombre: string, ciudad: string, estado: string}>>([]);
  const [seleccionarTodas, setSeleccionarTodas] = useState(true);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<number | null>(null);

  useEffect(() => {
    const cargarServicios = async () => {
      const servicios = await lealtadService.obtenerServiciosDisponibles(idNegocio);
      setServiciosDisponibles(servicios);
    };
    cargarServicios();
  }, [idNegocio]);

  useEffect(() => {
    const cargarSucursales = async () => {
      const sucursales = await lealtadService.obtenerSucursales(idNegocio);
      setSucursalesDisponibles(sucursales);
    };
    cargarSucursales();
  }, [idNegocio]);

  const formatDateStr = (date: Date) => date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  const handleAddWhitelist = (usr: any) => {
    if (!usuariosWhitelist.find(u => u.id === usr.id)) {
      setUsuariosWhitelist([...usuariosWhitelist, usr]);
    }
  };

  const handleRemoveWhitelist = (id: number) => {
    setUsuariosWhitelist(usuariosWhitelist.filter(u => u.id !== id));
  };

  /** Elimina una regla del constructor por su ID temporal (siempre deben quedar 2: 1 requisito + 1 recompensa) */
  const eliminarRegla = (idTemporal: number) => {
    const regla = reglas.find(r => r.id_temporal === idTemporal);
    if (!regla) return;

    const otrasReglas = reglas.filter(r => r.id_temporal !== idTemporal);
    if (otrasReglas.length === 0) {
      Alert.alert('No se puede eliminar', 'Debe existir al menos 1 requisito y 1 recompensa por oferta.');
      return;
    }

    const tipoRestante = otrasReglas[0]?.tipo_regla;
    if (tipoRestante === regla.tipo_regla) {
      Alert.alert(
        'No se puede eliminar',
        'Ya existe otra regla del mismo tipo. Para tener solo 1 regla, primero cambia el tipo de la otra regla.'
      );
      return;
    }

    Alert.alert(
      'Eliminar Regla',
      '¿Estás seguro de que deseas eliminar esta regla?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => setReglas(otrasReglas)
        }
      ]
    );
  };

  /** Actualiza un campo específico de una regla */
  const actualizarRegla = (idTemporal: number, campo: keyof OfertaRegla, valor: any) => {
    // Validación de rangos para campos numéricos
    if (campo === 'porcentaje_descuento' && valor !== null) {
      if (valor < 0) valor = 0;
      if (valor > 100) valor = 100;
    }
    if (campo === 'cantidad' && valor !== null && valor < 1) {
      valor = 1;
    }
    if ((campo === 'monto_descuento' || campo === 'monto_minimo') && valor !== null && valor < 0) {
      valor = 0;
    }

    setReglas(reglas.map(r => {
      if (r.id_temporal === idTemporal) {
        return { ...r, [campo]: valor };
      }
      return r;
    }));
  };

  /** Intenta cambiar el tipo de una regla. No permite si ya existe otra regla del mismo tipo. */
  const intentarCambiarTipo = (idTemporal: number, nuevoTipo: 'requisito' | 'recompensa') => {
    const reglaActual = reglas.find(r => r.id_temporal === idTemporal);
    if (!reglaActual || reglaActual.tipo_regla === nuevoTipo) return;

    const conflicto = reglas.some(r => r.id_temporal !== idTemporal && r.tipo_regla === nuevoTipo);
    if (conflicto) {
      Alert.alert('Límite', `Ya existe otra regla de tipo "${nuevoTipo}". Solo se permite 1 por oferta.`);
      return;
    }

    actualizarRegla(idTemporal, 'tipo_regla', nuevoTipo);
  };

  /** Muestra un Alert con los productos y servicios disponibles para seleccionar en una regla */
  const mostrarSelectorServicios = (idTemporal: number) => {
    const opciones = [
      { text: 'Sin producto/servicio específico', onPress: () => actualizarRegla(idTemporal, 'id_servicio_disponible', null) },
      ...serviciosDisponibles.map(s => ({
        text: `${s.tipo_producto === 'servicio' ? '🔧' : '📦'} ${s.nombre} ($${s.costo})`,
        onPress: () => actualizarRegla(idTemporal, 'id_servicio_disponible', s.id),
      })),
      { text: 'Cancelar', style: 'cancel' as const },
    ];
    Alert.alert('Seleccionar Producto/Servicio', 'Elige un producto o servicio para esta regla:', opciones);
  };

  /** Obtiene el nombre del producto/servicio seleccionado para mostrar en el selector */
  const getNombreServicio = (idServicio: number | null): string => {
    if (!idServicio) return 'Sin producto/servicio específico';
    const servicio = serviciosDisponibles.find(s => s.id === idServicio);
    if (!servicio) return 'Producto/Servicio no encontrado';
    const icono = servicio.tipo_producto === 'servicio' ? '🔧' : '📦';
    return `${icono} ${servicio.nombre}`;
  };

  // 🌟 INTEGRACIÓN CON BACKEND (FastAPI) — Motor NxN incluido
  const handleGuardar = async () => {
    if (!titulo.trim()) {
      Alert.alert('Falta Información', 'El título de la oferta es obligatorio. Ej: "2x1 en Cortes de Cabello"');
      return;
    }
    if (fechaFin < fechaInicio) {
      Alert.alert('Error de Fechas', 'La fecha de fin debe ser posterior a la fecha de inicio. Revisa las fechas seleccionadas.');
      return;
    }
    if (!esPublica && usuariosWhitelist.length === 0) {
      Alert.alert('Whitelist Vacía', 'Si la oferta es VIP, debes seleccionar al menos un cliente.');
      return;
    }

    if (reglas.length > 0) {
      const tieneRecompensa = reglas.some(r => r.tipo_regla === 'recompensa');
      if (!tieneRecompensa) {
        Alert.alert('Reglas Incompletas', 'Debes definir al menos una recompensa. Ej: "20% de descuento" o "$100 de descuento"');
        return;
      }
    }

    try {
      const payload: any = {
        titulo,
        descripcion,
        es_publica: esPublica,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        costo_en_puntos: costoEnPuntos ? parseFloat(costoEnPuntos) : null,
        limite_existencias: limiteStock ? parseInt(limiteStock) : null,
        limite_por_usuario: limitePorUsuario ? parseInt(limitePorUsuario) : null,
        whitelist_ids: esPublica ? [] : usuariosWhitelist.map(u => u.id),
        reglas: reglas.map(r => ({
          tipo_regla: r.tipo_regla,
          id_servicio_disponible: r.id_servicio_disponible,
          cantidad: r.cantidad,
          porcentaje_descuento: r.porcentaje_descuento,
          monto_descuento: r.monto_descuento,
          monto_minimo: r.monto_minimo,
        })),
      };

      if (sucursalesDisponibles.length >= 2 && !seleccionarTodas) {
        if (!sucursalSeleccionada) {
          Alert.alert('Error', 'Debes seleccionar una sucursal específica.');
          return;
        }
        payload.id_sucursales = [sucursalSeleccionada];
      } else if (sucursalesDisponibles.length >= 2 && seleccionarTodas) {
        payload.id_sucursales = null; // Todas las sucursales
      } else {
        payload.id_sucursales = null; // 1 sola sucursal
      }
      
      await lealtadService.crearOferta(idNegocio, payload);
      
      Alert.alert('Éxito', 'Oferta promocional guardada correctamente.');
      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error al conectar con el servidor.');
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        
        <Text style={styles.label}>Título de la Oferta <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Ej: 2x1 en Bebidas" placeholderTextColor="#94a3b8" />

        <Text style={styles.label}>Descripción / Términos</Text>
        <TextInput style={[styles.input, styles.textArea]} value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={3} placeholder="Explica las reglas..." placeholderTextColor="#94a3b8" />

        <View style={styles.row}>
          <View style={styles.flexItem}>
            <Text style={styles.label}>Válida Desde <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPickerInicio(true)}>
              <Ionicons name="calendar-outline" size={16} color="#475569" />
              <Text style={styles.dateText}>{formatDateStr(fechaInicio)}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.flexItem}>
            <Text style={styles.label}>Válida Hasta <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPickerFin(true)}>
              <Ionicons name="calendar-outline" size={16} color="#475569" />
              <Text style={styles.dateText}>{formatDateStr(fechaFin)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showPickerInicio && (<DateTimePicker value={fechaInicio} mode="date" display="default" onChange={(e, d) => { setShowPickerInicio(Platform.OS === 'ios'); if (d) setFechaInicio(d); }}/>)}
        {showPickerFin && (<DateTimePicker value={fechaFin} mode="date" display="default" onChange={(e, d) => { setShowPickerFin(Platform.OS === 'ios'); if (d) setFechaFin(d); }}/>)}

        <View style={styles.row}>
          <View style={styles.flexItem}>
            <Text style={styles.label}>Costo (Puntos)</Text>
            <TextInput style={styles.input} value={costoEnPuntos} onChangeText={setCostoEnPuntos} keyboardType="numeric" placeholder="Null = Gratis" placeholderTextColor="#cbd5e1" />
          </View>
          <View style={styles.flexItem}>
            <Text style={styles.label}>Existencias Máx.</Text>
            <TextInput style={styles.input} value={limiteStock} onChangeText={setLimiteStock} keyboardType="numeric" placeholder="Ilimitadas" placeholderTextColor="#cbd5e1" />
          </View>
        </View>

        <Text style={styles.label}>Límite de Canjes por Usuario <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={limitePorUsuario} onChangeText={setLimitePorUsuario} keyboardType="numeric" placeholder="Ej: 1 (Para uso único)" placeholderTextColor="#94a3b8" />

        {/* SELECTOR DE SUCURSALES — solo si hay 2+ sucursales */}
        {sucursalesDisponibles.length >= 2 && (
          <View style={styles.sucursalesContainer}>
            <Text style={styles.label}>Aplicar en <Text style={styles.required}>*</Text></Text>
            <View style={styles.sucursalesList}>
              {/* Opción: Todas las sucursales */}
              <TouchableOpacity
                style={[
                  styles.sucursalItem,
                  seleccionarTodas && styles.sucursalItemActive
                ]}
                onPress={() => {
                  setSeleccionarTodas(true);
                  setSucursalSeleccionada(null);
                }}
              >
                <Ionicons 
                  name="business-outline" 
                  size={16} 
                  color={seleccionarTodas ? "#ffffff" : "#0ea5e9"} 
                />
                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.sucursalItemNombre,
                    seleccionarTodas && styles.sucursalItemNombreActive
                  ]}>
                    Todas las sucursales ({sucursalesDisponibles.length})
                  </Text>
                  <Text style={[
                    styles.sucursalItemUbicacion,
                    seleccionarTodas && styles.sucursalItemUbicacionActive
                  ]}>
                    Se creará una oferta en cada sucursal
                  </Text>
                </View>
                {seleccionarTodas && (
                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                )}
              </TouchableOpacity>

              {/* Opciones: Sucursales específicas */}
              {sucursalesDisponibles.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.sucursalItem,
                    sucursalSeleccionada === s.id && styles.sucursalItemActive
                  ]}
                  onPress={() => {
                    setSeleccionarTodas(false);
                    setSucursalSeleccionada(s.id);
                  }}
                >
                  <Ionicons 
                    name="location-outline" 
                    size={16} 
                    color={sucursalSeleccionada === s.id ? "#ffffff" : "#0ea5e9"} 
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.sucursalItemNombre,
                      sucursalSeleccionada === s.id && styles.sucursalItemNombreActive
                    ]}>
                      {s.nombre}
                    </Text>
                    <Text style={[
                      styles.sucursalItemUbicacion,
                      sucursalSeleccionada === s.id && styles.sucursalItemUbicacionActive
                    ]}>
                      {s.ciudad}, {s.estado}
                    </Text>
                  </View>
                  {sucursalSeleccionada === s.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* SWITCH DE VISIBILIDAD */}
        <View style={[styles.switchRow, !esPublica && { marginBottom: 15 }]}>
          <View style={styles.switchTextWrapper}>
            <View style={[styles.visibilityBadge, esPublica ? styles.badgePublica : styles.badgeVIP]}>
              <Ionicons name={esPublica ? "globe" : "star"} size={14} color="#fff" />
              <Text style={styles.visibilityBadgeText}>{esPublica ? 'Oferta Pública' : 'Oferta VIP'}</Text>
            </View>
            <Text style={styles.switchSubtitle}>{esPublica ? 'Visible para todos los clientes' : 'Exclusiva VIP (Whitelist)'}</Text>
          </View>
          <Switch value={esPublica} onValueChange={setEsPublica} trackColor={{ false: '#d4af37', true: '#16a34a' }} thumbColor={esPublica ? '#15803d' : '#b8860b'} />
        </View>

        {/* RENDERIZADO CONDICIONAL DE LA WHITELIST */}
        {!esPublica && (
          <View style={styles.whitelistContainer}>
            <Text style={styles.label}>Seleccionar Clientes VIP *</Text>
            <BuscadorUsuarios 
              negocioId={idNegocio} 
              onSelect={handleAddWhitelist} 
              placeholder="Filtrar clientes afiliados..."
              cargarAfiliadosPorDefecto={true}
              idsExcluidos={usuariosWhitelist.map(u => u.id)}
            />
            
            {/* BANDEJA DE CHIPS (Usuarios Seleccionados) */}
            {usuariosWhitelist.length > 0 && (
              <View style={styles.chipContainer}>
                {usuariosWhitelist.map(usr => (
                  <View key={usr.id} style={styles.chip}>
                    <Text style={styles.chipText}>{usr.nombre}</Text>
                    <TouchableOpacity onPress={() => handleRemoveWhitelist(usr.id)} style={styles.chipClose}>
                      <Ionicons name="close-circle" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ========================================== */}
        {/* MOTOR DE REGLAS NxN (Constructor dinámico) */}
        {/* ========================================== */}
        <View style={styles.reglasSection}>
          <TouchableOpacity 
            style={styles.reglasHeader} 
            activeOpacity={0.7} 
            onPress={() => setMostrarReglas(!mostrarReglas)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="layers" size={20} color="#8b5cf6" />
              <View>
                <Text style={styles.reglasTitle}>Reglas de la Oferta (Motor NxN)</Text>
                <Text style={styles.reglasSubtitle}>Arma tu oferta combinando requisitos y recompensas</Text>
              </View>
            </View>
            <Ionicons name={mostrarReglas ? "chevron-up" : "chevron-down"} size={20} color="#8b5cf6" />
          </TouchableOpacity>

          {mostrarReglas && (
            <View style={styles.reglasContent}>
              {/* Lista de reglas existentes */}
              {reglas.map((regla) => (
                <View key={regla.id_temporal} style={styles.reglaCard}>
                  <View style={styles.reglaCardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons 
                        name={regla.tipo_regla === 'requisito' ? 'checkmark-circle' : 'gift'} 
                        size={16} 
                        color={regla.tipo_regla === 'requisito' ? '#f59e0b' : '#10b981'} 
                      />
                      <Text style={[styles.reglaTipoBadge, { color: regla.tipo_regla === 'requisito' ? '#f59e0b' : '#10b981' }]}>
                        {regla.tipo_regla.toUpperCase()}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => eliminarRegla(regla.id_temporal)} style={styles.reglaDeleteBtn}>
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>

                  {/* Selector de tipo de regla */}
                  <View style={styles.reglaTipoSelector}>
                    <TouchableOpacity 
                      style={[styles.reglaTipoBtn, regla.tipo_regla === 'requisito' && styles.reglaTipoBtnRequisito]} 
                      onPress={() => intentarCambiarTipo(regla.id_temporal, 'requisito')}
                    >
                      <Ionicons name="checkmark-circle" size={14} color={regla.tipo_regla === 'requisito' ? '#fff' : '#f59e0b'} />
                      <Text style={[styles.reglaTipoBtnText, regla.tipo_regla === 'requisito' && styles.reglaTipoBtnTextActive]}>Requisito</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.reglaTipoBtn, regla.tipo_regla === 'recompensa' && styles.reglaTipoBtnRecompensa]} 
                      onPress={() => intentarCambiarTipo(regla.id_temporal, 'recompensa')}
                    >
                      <Ionicons name="gift" size={14} color={regla.tipo_regla === 'recompensa' ? '#fff' : '#10b981'} />
                      <Text style={[styles.reglaTipoBtnText, regla.tipo_regla === 'recompensa' && styles.reglaTipoBtnTextActive]}>Recompensa</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Campos según tipo de regla */}
                  {regla.tipo_regla === 'requisito' && (
                    <>
                      <Text style={styles.reglaFieldLabel}>Producto/Servicio (opcional)</Text>
                      <TouchableOpacity 
                        style={styles.selectorContainer} 
                        activeOpacity={0.7}
                        onPress={() => mostrarSelectorServicios(regla.id_temporal)}
                      >
                        <Text style={styles.selectorText}>{getNombreServicio(regla.id_servicio_disponible)}</Text>
                        <Ionicons name="chevron-down" size={18} color="#64748b" />
                      </TouchableOpacity>
                      <Text style={styles.reglaFieldLabel}>Cantidad requerida (opcional)</Text>
                      <TextInput 
                        style={styles.input} 
                        value={regla.cantidad?.toString() || ''} 
                        onChangeText={(val) => actualizarRegla(regla.id_temporal, 'cantidad', val ? parseInt(val) : null)}
                        keyboardType="numeric" 
                        placeholder="Ej: 2" 
                        placeholderTextColor="#cbd5e1" 
                      />
                      <Text style={styles.reglaFieldLabel}>Monto mínimo requerido $ (opcional)</Text>
                      <TextInput 
                        style={styles.input} 
                        value={regla.monto_minimo?.toString() || ''} 
                        onChangeText={(val) => actualizarRegla(regla.id_temporal, 'monto_minimo', val ? parseFloat(val) : null)}
                        keyboardType="numeric" 
                        placeholder="Ej: 500" 
                        placeholderTextColor="#cbd5e1" 
                      />
                    </>
                  )}

                  {regla.tipo_regla === 'recompensa' && (
                    <>
                      <Text style={styles.reglaFieldLabel}>Producto/Servicio (opcional)</Text>
                      <TouchableOpacity 
                        style={styles.selectorContainer} 
                        activeOpacity={0.7}
                        onPress={() => mostrarSelectorServicios(regla.id_temporal)}
                      >
                        <Text style={styles.selectorText}>{getNombreServicio(regla.id_servicio_disponible)}</Text>
                        <Ionicons name="chevron-down" size={18} color="#64748b" />
                      </TouchableOpacity>
                      <Text style={styles.reglaFieldLabel}>Porcentaje de descuento % (0-100)</Text>
                      <TextInput 
                        style={styles.input} 
                        value={regla.porcentaje_descuento?.toString() || ''} 
                        onChangeText={(val) => actualizarRegla(regla.id_temporal, 'porcentaje_descuento', val ? parseFloat(val) : null)}
                        keyboardType="numeric" 
                        placeholder="Ej: 20" 
                        placeholderTextColor="#cbd5e1" 
                      />
                      <Text style={styles.reglaFieldLabel}>Monto de descuento fijo $ (opcional)</Text>
                      <TextInput 
                        style={styles.input} 
                        value={regla.monto_descuento?.toString() || ''} 
                        onChangeText={(val) => actualizarRegla(regla.id_temporal, 'monto_descuento', val ? parseFloat(val) : null)}
                        keyboardType="numeric" 
                        placeholder="Ej: 100" 
                        placeholderTextColor="#cbd5e1" 
                      />
                    </>
                  )}
                </View>
              ))}

              {/* Resumen de reglas (ya no hay botón Agregar, las 2 reglas son fijas) */}
              {reglas.length > 0 && (
                <View style={styles.reglasResumen}>
                  <Ionicons name="information-circle" size={14} color="#64748b" />
                  <Text style={styles.reglasResumenText}>
                    {reglas.filter(r => r.tipo_regla === 'requisito').length} requisito(s), {reglas.filter(r => r.tipo_regla === 'recompensa').length} recompensa(s)
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.previewButton} activeOpacity={0.8} onPress={() => setMostrarPreview(true)}>
            <Ionicons name="eye-outline" size={20} color="#2563eb" />
            <Text style={styles.previewButtonText}>Vista Previa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} activeOpacity={0.8} onPress={handleGuardar}>
            <Ionicons name="cloud-upload-outline" size={20} color="#ffffff" />
            <Text style={styles.submitButtonText}>Crear Oferta</Text>
          </TouchableOpacity>
        </View>

      </View>

      <Modal visible={mostrarPreview} animationType="slide" transparent={true} onRequestClose={() => setMostrarPreview(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vista Previa de la Oferta</Text>
              <TouchableOpacity onPress={() => setMostrarPreview(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <View style={[styles.previewBadge, { backgroundColor: '#fef3c7' }]}>
                    <Ionicons name="star" size={14} color="#d97706" />
                    <Text style={[styles.previewBadgeText, { color: '#d97706' }]}>OFERTA ACTIVA</Text>
                  </View>
                  <Text style={styles.previewType}>{esPublica ? 'Pública' : 'VIP (Whitelist)'}</Text>
                </View>

                <Text style={styles.previewTitle}>{titulo || 'Sin título'}</Text>
                <Text style={styles.previewDescription}>{descripcion || 'Sin descripción'}</Text>

                <View style={styles.previewFooter}>
                  <View style={styles.previewStatBox}>
                    <Ionicons name="gift-outline" size={16} color="#64748b" />
                    <Text style={styles.previewStatText}>
                      {costoEnPuntos ? `${costoEnPuntos} Pts` : 'Gratis'}
                    </Text>
                  </View>
                  <View style={styles.previewStatBox}>
                    <Ionicons name="cube-outline" size={16} color="#64748b" />
                    <Text style={styles.previewStatText}>
                      {limiteStock ? `${limiteStock} disp.` : 'Ilimitado'}
                    </Text>
                  </View>
                </View>

                <View style={styles.previewDates}>
                  <Ionicons name="calendar-outline" size={14} color="#64748b" />
                  <Text style={styles.previewDatesText}>
                    {formatDateStr(fechaInicio)} → {formatDateStr(fechaFin)}
                  </Text>
                </View>

                {reglas.length > 0 && (
                  <View style={styles.previewReglas}>
                    <Text style={styles.previewReglasTitle}>Reglas Definidas ({reglas.length})</Text>
                    {reglas.map((regla, index) => {
                      const servicioRegla = regla.id_servicio_disponible 
                        ? serviciosDisponibles.find(s => s.id === regla.id_servicio_disponible) 
                        : null;
                      return (
                        <View key={regla.id_temporal} style={styles.previewReglaItem}>
                          <Ionicons 
                            name={regla.tipo_regla === 'requisito' ? 'checkmark-circle' : 'gift'} 
                            size={14} 
                            color={regla.tipo_regla === 'requisito' ? '#f59e0b' : '#10b981'} 
                          />
                          <Text style={[styles.previewReglaTipo, { color: regla.tipo_regla === 'requisito' ? '#f59e0b' : '#10b981' }]}>
                            {regla.tipo_regla.toUpperCase()}
                          </Text>
                          {servicioRegla && (
                            <Text style={styles.previewReglaDetalle}>
                              {servicioRegla.tipo_producto === 'servicio' ? '🔧' : '📦'} {servicioRegla.nombre}
                            </Text>
                          )}
                          {regla.cantidad && <Text style={styles.previewReglaDetalle}>Cantidad: {regla.cantidad}</Text>}
                          {regla.porcentaje_descuento && <Text style={styles.previewReglaDetalle}>Descuento: {regla.porcentaje_descuento}%</Text>}
                          {regla.monto_descuento && <Text style={styles.previewReglaDetalle}>Monto descuento: ${regla.monto_descuento}</Text>}
                          {regla.monto_minimo && <Text style={styles.previewReglaDetalle}>Monto mínimo: ${regla.monto_minimo}</Text>}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setMostrarPreview(false)}>
              <Text style={styles.modalCloseButtonText}>Cerrar Vista Previa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: 10 },
  label: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 6, marginLeft: 4 },
  required: { color: '#ef4444' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#334155', marginBottom: 18 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 16, marginBottom: 18 },
  flexItem: { flex: 1 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  dateText: { fontSize: 14, color: '#334155', fontWeight: '500' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24, marginTop: 5 },
  switchTextWrapper: { flex: 0.85 },
  switchLabel: { fontSize: 14, fontWeight: '700', color: '#334155' },
  visibilityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start' },
  badgePublica: { backgroundColor: '#16a34a' },
  badgeVIP: { backgroundColor: '#d4af37' },
  visibilityBadgeText: { fontSize: 12, fontWeight: '700', color: '#ffffff', letterSpacing: 0.3 },
  switchSubtitle: { fontSize: 12, color: '#64748b', marginTop: 6 },
  whitelistContainer: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#bfdbfe', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, elevation: 1, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 2 },
  chipText: { fontSize: 12, color: '#1e293b', fontWeight: '600', marginRight: 6 },
  chipClose: { marginLeft: 2 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  previewButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#2563eb', borderRadius: 14, paddingVertical: 14 },
  previewButtonText: { color: '#2563eb', fontSize: 15, fontWeight: 'bold' },
  submitButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 14, elevation: 2, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 },
  submitButtonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  /* Estilos del Motor de Reglas NxN */
  reglasSection: { backgroundColor: '#faf5ff', borderRadius: 16, borderWidth: 1, borderColor: '#e9d5ff', marginBottom: 24, overflow: 'hidden' },
  reglasHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  reglasTitle: { fontSize: 14, fontWeight: '700', color: '#6b21a8' },
  reglasSubtitle: { fontSize: 11, color: '#9333ea', marginTop: 2 },
  reglasContent: { padding: 16, paddingTop: 0 },
  reglaCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e9d5ff' },
  reglaCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  reglaTipoBadge: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  reglaDeleteBtn: { padding: 4 },
  reglaTipoSelector: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  reglaTipoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  reglaTipoBtnRequisito: { backgroundColor: '#fef3c7', borderColor: '#f59e0b' },
  reglaTipoBtnRecompensa: { backgroundColor: '#d1fae5', borderColor: '#10b981' },
  reglaTipoBtnText: { fontSize: 12, fontWeight: '600' },
  reglaTipoBtnTextActive: { color: '#ffffff' },
  reglaFieldLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4, marginLeft: 4 },
  selectorContainer: { marginBottom: 18 },
  selectorButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  selectorText: { fontSize: 14, color: '#334155' },
  reglasResumen: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#f1f5f9', borderRadius: 8 },
  /* Estilos del selector de sucursales */
  sucursalesContainer: { backgroundColor: '#f0f9ff', borderRadius: 16, borderWidth: 1, borderColor: '#bae6fd', padding: 15, marginBottom: 24 },
  sucursalSelectorBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  sucursalSelectorText: { fontSize: 14, color: '#334155', fontWeight: '600' },
  sucursalSelectorSubtitle: { fontSize: 11, color: '#64748b', marginTop: 2 },
  sucursalesList: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  sucursalItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 10 },
  sucursalItemActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  sucursalItemNombre: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  sucursalItemNombreActive: { color: '#ffffff' },
  sucursalItemUbicacion: { fontSize: 12, color: '#64748b', marginTop: 1 },
  sucursalItemUbicacionActive: { color: '#dbeafe' },
  reglasResumenText: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'flex-end', padding: 0 },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  modalCloseBtn: { padding: 5 },
  previewCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  previewBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  previewBadgeText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  previewType: { fontSize: 12, fontWeight: '600', color: '#0ea5e9' },
  previewTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  previewDescription: { fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 15 },
  previewFooter: { flexDirection: 'row', gap: 15, marginBottom: 12 },
  previewStatBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  previewStatText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  previewDates: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 12 },
  previewDatesText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  previewReglas: { marginTop: 5 },
  previewReglasTitle: { fontSize: 13, fontWeight: '700', color: '#6b21a8', marginBottom: 8 },
  previewReglaItem: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewReglaTipo: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  previewReglaDetalle: { fontSize: 12, color: '#475569', marginLeft: 22, marginTop: 1 },
  modalCloseButton: { backgroundColor: '#f1f5f9', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 15 },
  modalCloseButtonText: { fontSize: 15, fontWeight: '700', color: '#64748b' },
});
