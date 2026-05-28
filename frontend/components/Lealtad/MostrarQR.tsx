import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import lealtadService from '../../features/lealtad/lealtadService';

interface MostrarQRProps {
  idOferta: number;
  onClose?: () => void;
}

export default function MostrarQR({ idOferta, onClose }: MostrarQRProps) {
  const [tokenQr, setTokenQr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3 minutos estándar por defecto

  const obtenerTokenPromocion = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await lealtadService.generarTokenQR(idOferta);
      setTokenQr(data.token_qr);
      setTimeLeft(data.expira_en_segundos);
    } catch (err: any) {
      setError(err.message || 'Error al generar el token QR de seguridad.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerTokenPromocion();
  }, [idOferta]);

  // Contador regresivo de seguridad auto-renovable
  useEffect(() => {
    if (timeLeft <= 0) {
      obtenerTokenPromocion(); // Auto-renovación criptográfica limpia al expirar el tiempo de vida
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Firmando token de seguridad por servidor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Canjear Beneficio</Text>
      <Text style={styles.subtitulo}>Muestra este código QR en la caja del establecimiento para aplicar tu descuento de forma automática.</Text>
      
      <View style={styles.qrWrapper}>
        {tokenQr ? (
          <QRCode
            value={tokenQr}
            size={Dimensions.get('window').width * 0.55}
            backgroundColor="#ffffff"
            color="#1e293b"
          />
        ) : null}
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>El código se actualizará por seguridad en:</Text>
        <Text style={[styles.timerValue, timeLeft < 30 && styles.timerDanger]}>
          {formatTime(timeLeft)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#ffffff', padding: 24, borderRadius: 20, alignItems: 'center', width: '100%' },
  centerContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 8, textAlign: 'center' },
  subtitulo: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 18, marginBottom: 24, paddingHorizontal: 10 },
  qrWrapper: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, marginBottom: 20 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748b', fontWeight: '500' },
  errorText: { fontSize: 14, color: '#ef4444', textAlign: 'center', fontWeight: '500' },
  timerContainer: { alignItems: 'center' },
  timerLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  timerValue: { fontSize: 16, fontWeight: '600', color: '#2563eb' },
  timerDanger: { color: '#ef4444' }
});