import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { ButtonNeo } from '../../ui/Button';

interface BannerTempProps {
  isVisible: boolean;
  solucionNombre: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const BannerTemp = ({ isVisible, solucionNombre, onComplete, onCancel }: BannerTempProps) => {
  const [counter, setCounter] = useState(3);

  // 🌟 EFECTO 1: Controla exclusivamente la matemática del reloj
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    
    if (isVisible) {
      setCounter(3); // Reiniciamos siempre en 3
      timer = setInterval(() => {
        setCounter((prev) => {
          if (prev > 1) return prev - 1;
          clearInterval(timer);
          return 1; // Detenemos la matemática y lo dejamos visualmente en 1
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isVisible]);

  // 🌟 EFECTO 2: Escucha el reloj y dispara la acción de forma segura (fuera del render)
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isVisible && counter === 1) {
      // Esperamos que transcurra el último segundo del "1" y luego completamos
      timeout = setTimeout(() => {
        onComplete();
      }, 1000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [counter, isVisible, onComplete]);

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          
          <Text style={styles.title}>Instalando {solucionNombre}</Text>
          <Text style={styles.subtitle}>Se agregará a tus herramientas personales en:</Text>
          
          <Text style={styles.counterText}>{counter}</Text>
          
          <View style={styles.buttonContainer}>
            <ButtonNeo 
              title="Cancelar" 
              glowColor="#ef4444" 
              backgroundColor="#1e1e1e"
              isRectangular={true}
              onPress={onCancel} 
            />
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  box: {
    backgroundColor: '#ffffff',
    width: '100%',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  counterText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#3b82f6', 
    marginBottom: 25,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  }
});