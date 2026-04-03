import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';

// --- CONFIGURACIÓN DE IMÁGENES (Usando los nuevos JPGs) ---
const images = [
  require('../assets/images/LogIn_Cafe.png'),
  require('../assets/images/LogIn_Barber.png'),
  require('../assets/images/LogIn_Abogado.png'),
  require('../assets/images/LogIn_Doctor.png'),
];

export const LoginAnimation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (images.length < 2) return;

    const slideshowInterval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setNextIndex((prev) => (prev + 1) % images.length);
        fadeAnim.setValue(1); 
      });
    }, 5000);

    return () => clearInterval(slideshowInterval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Capa inferior (Siguiente) */}
      <Image
        source={images[nextIndex]}
        style={styles.image}
        resizeMode="cover" // Cubre todo sin deformarse
      />

      {/* Capa superior (Actual con Fade) */}
      <Animated.Image
        source={images[currentIndex]}
        style={[styles.image, { opacity: fadeAnim }]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Importante: Ocupar todo el espacio asignado por el Layout de Capas
    flex: 1, 
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  image: {
    position: 'absolute', 
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});