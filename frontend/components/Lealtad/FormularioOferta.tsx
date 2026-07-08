import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { BuscadorUsuarios } from '../../ui/BuscadorUsuarios';
import BuscadorCatalogo, { ProductoCatalogo } from './BuscadorCatalogo';
import CardReglaNxN from './CardReglaNxN';
import lealtadService from '../../features/lealtad/lealtadService';

interface FormularioOfertaProps {
  idNegocio: number;
  onSuccess: () => void;
}

interface ProductoRegla {
  producto: ProductoCatalogo;
  cantidad: number;
  porcentajeDescuento: number | null;
  montoDescuento: number | null;
  montoMinimo: number | null;
}

type DropdownActivo = 'basica' | 'productos' | 'config' | null;

export default function FormularioOferta({ idNegocio, onSuccess }: FormularioOfertaProps) {
  const [dropdownActivo, setDropdownActivo] = useState<DropdownActivo>('basica');

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [esPublica, setEsPublica] = useState(true);
  const [usuariosWhitelist, setUsuariosWhitelist] = useState<any[]>([]);

  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000));
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFin, setShowPickerFin] = useState(false);
  const [limiteStock, setLimiteStock] = useState('');
  const [porExistencias, setPorExistencias] = useState(false);

  const [productosRequisito, setProductosRequisito] = useState<ProductoRegla[]>([]);
  const [productosRecompensa, setProductosRecompensa] = useState<ProductoRegla[]>([]);

  const [costoEnPuntos, setCostoEnPuntos] = useState('');
  const [limitePorUsuario, setLimitePorUsuario] = useState('');
  const [premioEnPuntos, setPremioEnPuntos] = useState('');
  const [premioEnSellos, setPremioEnSellos] = useState('');

  const [sucursalesDisponibles, setSucursalesDisponibles] = useState<Array<{id: number, nombre: string, ciudad: string, estado: string}>>([]);
  const [seleccionarTodas, setSeleccionarTodas] = useState(true);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<number | null>(null);

  useEffect(() => {
    const cargar = async () => {
      const sucursales = await lealtadService.obtenerSucursales(idNegocio);
      setSucursalesDisponibles(sucursales);
    };
    cargar();
  }, [idNegocio]);

  const formatDateStr = (date: Date) => date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  const toggleDropdown = (dd: DropdownActivo) => {
    setDropdownActivo(prev => prev === dd ? null : dd);
  };

  const handleAddWhitelist = (usr: any) => {
    setUsuariosWhitelist(prev => {
      if (prev.find(u => u.id === usr.id)) return prev;
      return [...prev, usr];
    });
  };

  const handleRemoveWhitelist = (id: number) => {
    setUsuariosWhitelist(prev => prev.filter(u => u.id !== id));
  };

  const actualizarProductoRegla = (
    setLista: React.Dispatch<React.SetStateAction<ProductoRegla[]>>,
    productoId: number,
    campo: keyof ProductoRegla,
    valor: any
  ) => {
    setLista(prev => prev.map(p =>
      p.producto.id === productoId ? { ...p, [campo]: valor } : p
    ));
  };

  const handleSeleccionRequisito = (productos: ProductoCatalogo[]) => {
    setProductosRequisito(prev => {
      const existentes = prev.filter(pr => productos.find(p => p.id === pr.producto.id));
      const nuevos = productos
        .filter(p => !prev.find(pr => pr.producto.id === p.id))
        .map(p => ({ producto: p, cantidad: 1, porcentajeDescuento: null, montoDescuento: null, montoMinimo: null }));
      return [...existentes, ...nuevos];
    });
  };

  const handleSeleccionRecompensa = (productos: ProductoCatalogo[]) => {
    setProductosRecompensa(prev => {
      const existentes = prev.filter(pr => productos.find(p => p.id === pr.producto.id));
      const nuevos = productos
        .filter(p => !prev.find(pr => pr.producto.id === p.id))
        .map(p => ({ producto: p, cantidad: 1, porcentajeDescuento: null, montoDescuento: null, montoMinimo: null }));
      return [...existentes, ...nuevos];
    });
  };

  const handleGuardar = async () => {
    if (!titulo.trim()) {
      Alert.alert('Falta Información', 'El título de la oferta es obligatorio.');
      return;
    }
    if (!porExistencias && fechaFin < fechaInicio) {
      Alert.alert('Error de Fechas', 'La fecha de fin debe ser posterior a la fecha de inicio.');
      return;
    }
    if (!esPublica && usuariosWhitelist.length === 0) {
      Alert.alert('Whitelist Vacía', 'Si la oferta es VIP, debes seleccionar al menos un cliente.');
      return;
    }

    try {
      const payload: any = {
        titulo,
        descripcion: descripcion || undefined,
        fecha_inicio: porExistencias ? undefined : fechaInicio.toISOString(),
        fecha_fin: porExistencias ? undefined : fechaFin.toISOString(),
        limite_existencias: porExistencias ? parseInt(limiteStock) : undefined,
        limite_por_usuario: limitePorUsuario ? parseInt(limitePorUsuario) : undefined,
        es_publica: esPublica,
        costo_en_puntos: costoEnPuntos ? parseFloat(costoEnPuntos) : undefined,
        premio_en_puntos: premioEnPuntos ? parseFloat(premioEnPuntos) : undefined,
        premio_en_sellos: premioEnSellos ? parseInt(premioEnSellos) : undefined,
        whitelist_ids: esPublica ? [] : usuariosWhitelist.map(u => u.id),
        id_sucursales: sucursalesDisponibles.length >= 2 && !seleccionarTodas ? [sucursalSeleccionada!] : null,
        reglas: [
          ...(productosRequisito.length > 0 ? [{
            tipo_regla: 'requisito',
            servicios: productosRequisito.map(pr => ({
              id_servicio_disponible: pr.producto.id,
              cantidad: pr.cantidad,
              porcentaje_descuento: pr.porcentajeDescuento,
              monto_descuento: pr.montoDescuento,
              monto_minimo: pr.montoMinimo,
            }))
          }] : []),
          ...(productosRecompensa.length > 0 ? [{
            tipo_regla: 'recompensa',
            servicios: productosRecompensa.map(pr => ({
              id_servicio_disponible: pr.producto.id,
              cantidad: pr.cantidad,
              porcentaje_descuento: pr.porcentajeDescuento,
              monto_descuento: pr.montoDescuento,
            }))
          }] : [])
        ]
      };

      await lealtadService.crearOferta(idNegocio, payload);
      Alert.alert('Éxito', 'Oferta promocional guardada correctamente.');
      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error al conectar con el servidor.');
    }
  };

  const renderDropdownHeader = (key: DropdownActivo, title: string, icon: string, color: string) => (
    <TouchableOpacity
      style={[styles.dropdownHeader, { borderBottomColor: dropdownActivo === key ? color : '#e2e8f0' }]}
      onPress={() => toggleDropdown(key)}
      activeOpacity={0.7}
    >
      <View style={styles.dropdownHeaderLeft}>
        <Ionicons name={icon as any} size={18} color={color} />
        <Text style={[styles.dropdownTitle, { color }]}>{title}</Text>
      </View>
      <Ionicons name={dropdownActivo === key ? 'chevron-up' : 'chevron-down'} size={18} color={color} />
    </TouchableOpacity>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>

        {renderDropdownHeader('basica', 'Información básica', 'document-text-outline', '#2563eb')}
        {dropdownActivo === 'basica' && (
          <View style={styles.dropdownContent}>
            <Text style={styles.label}>Título <Text style={styles.required}>*</Text></Text>
            <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Ej: 2x1 en Bebidas" placeholderTextColor="#94a3b8" />

            <Text style={styles.label}>Descripción</Text>
            <TextInput style={[styles.input, styles.textArea]} value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={3} placeholder="Explica las reglas..." placeholderTextColor="#94a3b8" />

            <View style={[styles.switchRow, !esPublica && { marginBottom: 12 }]}>
              <View style={styles.switchTextWrapper}>
                <View style={[styles.visibilityBadge, esPublica ? styles.badgePublica : styles.badgeVIP]}>
                  <Ionicons name={esPublica ? 'globe' : 'star'} size={14} color="#fff" />
                  <Text style={styles.visibilityBadgeText}>{esPublica ? 'Pública' : 'VIP'}</Text>
                </View>
                <Text style={styles.switchSubtitle}>{esPublica ? 'Visible para todos' : 'Exclusiva whitelist'}</Text>
              </View>
              <Switch value={esPublica} onValueChange={setEsPublica} trackColor={{ false: '#d4af37', true: '#16a34a' }} thumbColor={esPublica ? '#15803d' : '#b8860b'} />
            </View>

            {!esPublica && (
              <View style={styles.whitelistContainer}>
                <Text style={styles.label}>Clientes VIP</Text>
                <BuscadorUsuarios negocioId={idNegocio} onSelect={handleAddWhitelist} placeholder="Filtrar clientes..." cargarAfiliadosPorDefecto={true} idsExcluidos={usuariosWhitelist.map(u => u.id)} />
                {usuariosWhitelist.length > 0 && (
                  <View style={styles.chipContainer}>
                    {usuariosWhitelist.map(usr => (
                      <View key={usr.id} style={styles.chip}>
                        <Text style={styles.chipText}>{usr.nombre}</Text>
                        <TouchableOpacity onPress={() => handleRemoveWhitelist(usr.id)}>
                          <Ionicons name="close-circle" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={styles.switchRow}>
              <View style={styles.switchTextWrapper}>
                <View style={[styles.visibilityBadge, porExistencias ? styles.badgeExistencias : styles.badgeFechas]}>
                  <Ionicons name={porExistencias ? 'cube' : 'calendar'} size={14} color="#fff" />
                  <Text style={styles.visibilityBadgeText}>{porExistencias ? 'Por Existencias' : 'Por Fechas'}</Text>
                </View>
                <Text style={styles.switchSubtitle}>
                  {porExistencias ? 'Se agota cuando se acaben las existencias' : 'Válida en un rango de fechas'}
                </Text>
              </View>
              <Switch value={porExistencias} onValueChange={setPorExistencias} trackColor={{ false: '#2563eb', true: '#f59e0b' }} thumbColor={porExistencias ? '#d97706' : '#1d4ed8'} />
            </View>

            {porExistencias ? (
              <View>
                <Text style={styles.label}>Existencias Máx.</Text>
                <TextInput style={styles.input} value={limiteStock} onChangeText={setLimiteStock} keyboardType="numeric" placeholder="Ej: 100" placeholderTextColor="#cbd5e1" />
              </View>
            ) : (
              <View style={styles.row}>
                <View style={styles.flexItem}>
                  <Text style={styles.label}>Válida Desde</Text>
                  <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPickerInicio(true)}>
                    <Ionicons name="calendar-outline" size={16} color="#475569" />
                    <Text style={styles.dateText}>{formatDateStr(fechaInicio)}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.flexItem}>
                  <Text style={styles.label}>Válida Hasta</Text>
                  <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPickerFin(true)}>
                    <Ionicons name="calendar-outline" size={16} color="#475569" />
                    <Text style={styles.dateText}>{formatDateStr(fechaFin)}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {showPickerInicio && (<DateTimePicker value={fechaInicio} mode="date" display="default" onChange={(e, d) => { setShowPickerInicio(Platform.OS === 'ios'); if (d) setFechaInicio(d); }}/>)}
            {showPickerFin && (<DateTimePicker value={fechaFin} mode="date" display="default" onChange={(e, d) => { setShowPickerFin(Platform.OS === 'ios'); if (d) setFechaFin(d); }}/>)}
          </View>
        )}

        {renderDropdownHeader('productos', 'Productos', 'layers-outline', '#8b5cf6')}
        {dropdownActivo === 'productos' && (
          <View style={styles.dropdownContent}>
            <Text style={styles.sectionTitle}>Requisito</Text>
            <BuscadorCatalogo
              idNegocio={idNegocio}
              seleccionados={productosRequisito.map(p => p.producto)}
              onSeleccionChange={handleSeleccionRequisito}
              placeholder="Buscar producto para requisito..."
            />
            {productosRequisito.map(pr => (
              <CardReglaNxN
                key={pr.producto.id}
                producto={pr.producto}
                cantidad={pr.cantidad}
                porcentajeDescuento={pr.porcentajeDescuento}
                montoDescuento={pr.montoDescuento}
                montoMinimo={pr.montoMinimo}
                esRequisito={true}
                onCantidadChange={(v) => actualizarProductoRegla(setProductosRequisito, pr.producto.id, 'cantidad', v)}
                onPorcentajeChange={(v) => actualizarProductoRegla(setProductosRequisito, pr.producto.id, 'porcentajeDescuento', v)}
                onMontoDescuentoChange={(v) => actualizarProductoRegla(setProductosRequisito, pr.producto.id, 'montoDescuento', v)}
                onMontoMinimoChange={(v) => actualizarProductoRegla(setProductosRequisito, pr.producto.id, 'montoMinimo', v)}
                onEliminar={() => setProductosRequisito(prev => prev.filter(p => p.producto.id !== pr.producto.id))}
              />
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Recompensa</Text>
            <BuscadorCatalogo
              idNegocio={idNegocio}
              seleccionados={productosRecompensa.map(p => p.producto)}
              onSeleccionChange={handleSeleccionRecompensa}
              placeholder="Buscar producto para recompensa..."
            />
            {productosRecompensa.map(pr => (
              <CardReglaNxN
                key={pr.producto.id}
                producto={pr.producto}
                cantidad={pr.cantidad}
                porcentajeDescuento={pr.porcentajeDescuento}
                montoDescuento={pr.montoDescuento}
                montoMinimo={pr.montoMinimo}
                esRequisito={false}
                onCantidadChange={(v) => actualizarProductoRegla(setProductosRecompensa, pr.producto.id, 'cantidad', v)}
                onPorcentajeChange={(v) => actualizarProductoRegla(setProductosRecompensa, pr.producto.id, 'porcentajeDescuento', v)}
                onMontoDescuentoChange={(v) => actualizarProductoRegla(setProductosRecompensa, pr.producto.id, 'montoDescuento', v)}
                onMontoMinimoChange={(v) => actualizarProductoRegla(setProductosRecompensa, pr.producto.id, 'montoMinimo', v)}
                onEliminar={() => setProductosRecompensa(prev => prev.filter(p => p.producto.id !== pr.producto.id))}
              />
            ))}
          </View>
        )}

        {renderDropdownHeader('config', 'Configuración opcional', 'settings-outline', '#64748b')}
        {dropdownActivo === 'config' && (
          <View style={styles.dropdownContent}>
            <View style={styles.row}>
              <View style={styles.flexItem}>
                <Text style={styles.label}>Costo (Puntos)</Text>
                <TextInput style={styles.input} value={costoEnPuntos} onChangeText={setCostoEnPuntos} keyboardType="numeric" placeholder="Vacío = Gratis" placeholderTextColor="#cbd5e1" />
              </View>
              <View style={styles.flexItem}>
                <Text style={styles.label}>Límite por Usuario</Text>
                <TextInput style={styles.input} value={limitePorUsuario} onChangeText={setLimitePorUsuario} keyboardType="numeric" placeholder="Ilimitado" placeholderTextColor="#cbd5e1" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.flexItem}>
                <Text style={styles.label}>Premio en Puntos</Text>
                <TextInput style={styles.input} value={premioEnPuntos} onChangeText={setPremioEnPuntos} keyboardType="numeric" placeholder="0" placeholderTextColor="#cbd5e1" />
              </View>
              <View style={styles.flexItem}>
                <Text style={styles.label}>Premio en Sellos</Text>
                <TextInput style={styles.input} value={premioEnSellos} onChangeText={setPremioEnSellos} keyboardType="numeric" placeholder="0" placeholderTextColor="#cbd5e1" />
              </View>
            </View>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={16} color="#64748b" />
              <Text style={styles.infoText}>Se otorgan al canjear la oferta vía QR.</Text>
            </View>

            {sucursalesDisponibles.length >= 2 && (
              <View style={styles.sucursalesContainer}>
                <Text style={styles.label}>Aplicar en</Text>
                <TouchableOpacity
                  style={[styles.sucursalItem, seleccionarTodas && styles.sucursalItemActive]}
                  onPress={() => { setSeleccionarTodas(true); setSucursalSeleccionada(null); }}
                >
                  <Ionicons name="business-outline" size={16} color={seleccionarTodas ? '#fff' : '#0ea5e9'} />
                  <Text style={[styles.sucursalItemNombre, seleccionarTodas && styles.sucursalItemNombreActive]}>
                    Todas ({sucursalesDisponibles.length})
                  </Text>
                  {seleccionarTodas && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
                </TouchableOpacity>
                {sucursalesDisponibles.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.sucursalItem, sucursalSeleccionada === s.id && styles.sucursalItemActive]}
                    onPress={() => { setSeleccionarTodas(false); setSucursalSeleccionada(s.id); }}
                  >
                    <Ionicons name="location-outline" size={16} color={sucursalSeleccionada === s.id ? '#fff' : '#0ea5e9'} />
                    <Text style={[styles.sucursalItemNombre, sucursalSeleccionada === s.id && styles.sucursalItemNombreActive]}>{s.nombre}</Text>
                    {sucursalSeleccionada === s.id && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.submitButton} activeOpacity={0.8} onPress={handleGuardar}>
          <Ionicons name="cloud-upload-outline" size={20} color="#ffffff" />
          <Text style={styles.submitButtonText}>Crear Oferta</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: 10 },
  label: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 6, marginLeft: 4 },
  required: { color: '#ef4444' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#334155', marginBottom: 14 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  flexItem: { flex: 1 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  dateText: { fontSize: 14, color: '#334155', fontWeight: '500' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 14 },
  switchTextWrapper: { flex: 0.85 },
  visibilityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start' },
  badgePublica: { backgroundColor: '#16a34a' },
  badgeVIP: { backgroundColor: '#d4af37' },
  badgeExistencias: { backgroundColor: '#f59e0b' },
  badgeFechas: { backgroundColor: '#2563eb' },
  visibilityBadgeText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  switchSubtitle: { fontSize: 12, color: '#64748b', marginTop: 4 },
  whitelistContainer: { backgroundColor: '#fffbeb', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#fde68a', marginBottom: 14 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#bfdbfe', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20 },
  chipText: { fontSize: 12, color: '#1e293b', fontWeight: '600', marginRight: 6 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 14 },
  infoText: { fontSize: 12, color: '#64748b', flex: 1 },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 14, marginTop: 20, elevation: 2, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 },
  submitButtonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  dropdownHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1 },
  dropdownHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dropdownTitle: { fontSize: 15, fontWeight: '700' },
  dropdownContent: { padding: 14, paddingBottom: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginLeft: 4 },
  sucursalesContainer: { backgroundColor: '#f0f9ff', borderRadius: 12, borderWidth: 1, borderColor: '#bae6fd', padding: 12, marginTop: 4 },
  sucursalItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, gap: 10, marginBottom: 4, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' },
  sucursalItemActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  sucursalItemNombre: { fontSize: 14, fontWeight: '600', color: '#1e293b', flex: 1 },
  sucursalItemNombreActive: { color: '#ffffff' },
});
