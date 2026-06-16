import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BuscadorCatalogo, { ProductoCatalogo } from './BuscadorCatalogo';
import CardProductoEstrella from './CardProductoEstrella';
import lealtadService from '../../features/lealtad/lealtadService';

interface ProductoEstrellaLocal {
  producto: ProductoCatalogo;
  multiplicador: number;
}

interface ConfiguracionWalletProps {
  idNegocio: number;
}

export default function ConfiguracionWallet({ idNegocio }: ConfiguracionWalletProps) {
  const [tasaPuntosPorPeso, setTasaPuntosPorPeso] = useState('');
  const [puntosPorVisita, setPuntosPorVisita] = useState('');
  const [mesesVigencia, setMesesVigencia] = useState('');
  const [productosEstrella, setProductosEstrella] = useState<ProductoEstrellaLocal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const config = await lealtadService.obtenerConfiguracionLealtad(idNegocio);
        setTasaPuntosPorPeso(config.tasa_puntos_por_peso?.toString() || '0');
        setPuntosPorVisita(config.puntos_por_visita?.toString() || '0');
        setMesesVigencia(config.meses_vigencia_puntos?.toString() || '12');
        if (config.productos_estrella && config.productos_estrella.length > 0) {
          const productos: ProductoEstrellaLocal[] = config.productos_estrella.map((pe: any) => ({
            producto: {
              id: pe.id_servicio_producto,
              nombre: pe.nombre_servicio || 'Producto',
              costo: 0,
              tipo_producto: pe.tipo_servicio || 'producto',
              url_imagen: pe.url_imagen,
            },
            multiplicador: pe.multiplicador_producto,
          }));
          setProductosEstrella(productos);
        }
      } catch (error) {
        console.error('Error cargando configuración:', error);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [idNegocio]);

  const handleSeleccionProducto = (productos: ProductoCatalogo[]) => {
    const existentes = productosEstrella.filter(pe => productos.find(p => p.id === pe.producto.id));
    const nuevos = productos
      .filter(p => !productosEstrella.find(pe => pe.producto.id === p.id))
      .map(p => ({ producto: p, multiplicador: 1.0 }));
    setProductosEstrella([...existentes, ...nuevos]);
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      const payload = {
        tasa_puntos_por_peso: parseFloat(tasaPuntosPorPeso) || 0,
        puntos_por_visita: parseInt(puntosPorVisita) || 0,
        meses_vigencia_puntos: parseInt(mesesVigencia) || 12,
        productos_estrella: productosEstrella.map(pe => ({
          id_servicio_producto: pe.producto.id,
          multiplicador_producto: pe.multiplicador,
        })),
      };
      await lealtadService.actualizarConfiguracionLealtad(idNegocio, payload);
      Alert.alert('Éxito', 'Configuración de wallet guardada correctamente.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar la configuración.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loaderText}>Cargando configuración...</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>

        <View style={styles.headerCard}>
          <Ionicons name="wallet-outline" size={24} color="#8b5cf6" />
          <Text style={styles.headerTitle}>Configuración Wallet</Text>
        </View>

        <Text style={styles.label}>1$ = [?] puntos</Text>
        <TextInput
          style={styles.input}
          value={tasaPuntosPorPeso}
          onChangeText={setTasaPuntosPorPeso}
          keyboardType="decimal-pad"
          placeholder="Ej: 1.0"
          placeholderTextColor="#cbd5e1"
        />
        <Text style={styles.hint}>Tasa de acumulación por cada peso gastado</Text>

        <Text style={styles.label}>1 visita = [?] sellos</Text>
        <TextInput
          style={styles.input}
          value={puntosPorVisita}
          onChangeText={setPuntosPorVisita}
          keyboardType="numeric"
          placeholder="Ej: 1"
          placeholderTextColor="#cbd5e1"
        />
        <Text style={styles.hint}>Sellos otorgados por cada transacción completada</Text>

        <Text style={styles.label}>Meses de vigencia</Text>
        <TextInput
          style={styles.input}
          value={mesesVigencia}
          onChangeText={setMesesVigencia}
          keyboardType="numeric"
          placeholder="Ej: 12"
          placeholderTextColor="#cbd5e1"
        />
        <Text style={styles.hint}>0 = sin caducidad. Los puntos/sellos caducan por inactividad.</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Productos Estrella</Text>
        <Text style={styles.sectionHint}>Productos con multiplicador de puntos especial</Text>

        <BuscadorCatalogo
          idNegocio={idNegocio}
          seleccionados={productosEstrella.map(pe => pe.producto)}
          onSeleccionChange={handleSeleccionProducto}
          placeholder="Buscar producto estrella..."
        />

        {productosEstrella.map(pe => (
          <CardProductoEstrella
            key={pe.producto.id}
            producto={pe.producto}
            multiplicador={pe.multiplicador}
            onMultiplicadorChange={(val) => {
              setProductosEstrella(productosEstrella.map(p =>
                p.producto.id === pe.producto.id ? { ...p, multiplicador: val } : p
              ));
            }}
            onEliminar={() => {
              setProductosEstrella(productosEstrella.filter(p => p.producto.id !== pe.producto.id));
            }}
          />
        ))}

        {productosEstrella.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="star-outline" size={24} color="#cbd5e1" />
            <Text style={styles.emptyText}>Sin productos estrella configurados</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, guardando && { opacity: 0.6 }]}
          activeOpacity={0.8}
          onPress={handleGuardar}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>Guardar Configuración</Text>
            </>
          )}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loaderText: { marginTop: 12, fontSize: 14, color: '#64748b' },
  headerCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#faf5ff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e9d5ff', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#6b21a8' },
  label: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 6, marginLeft: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#334155', marginBottom: 4 },
  hint: { fontSize: 11, color: '#94a3b8', marginBottom: 16, marginLeft: 4 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#6b21a8', marginBottom: 4 },
  sectionHint: { fontSize: 12, color: '#94a3b8', marginBottom: 12 },
  emptyBox: { alignItems: 'center', padding: 24, gap: 8, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  emptyText: { fontSize: 13, color: '#94a3b8' },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#8b5cf6', borderRadius: 14, paddingVertical: 14, marginTop: 24, elevation: 2, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 },
  saveButtonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
});
