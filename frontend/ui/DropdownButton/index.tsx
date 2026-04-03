import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  LayoutAnimation, 
  Platform, 
  UIManager 
} from 'react-native';
// Usamos los íconos que ya vienen preinstalados en el ecosistema Expo
import { Ionicons } from '@expo/vector-icons'; 
import { styles } from './styles';

// Habilitamos las animaciones de Layout para Android (Requisito nativo)
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Definimos las propiedades (Props)
interface DropdownButtonProps {
  title: string;
  variant?: 'card' | 'outline' | 'minimal';
  children: React.ReactNode; // ESTO ES LA MAGIA: Permite meter cualquier componente adentro
}

export const DropdownButton = ({ 
  title, 
  variant = 'card', // 'card' será la variante por defecto
  children 
}: DropdownButtonProps) => {
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    // 1. Configuramos la animación de expansión del layout
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // 2. Cambiamos el estado (para mostrar/ocultar hijos)
    setIsExpanded(!isExpanded);
    
    // 3. Animamos la rotación de la flechita
    Animated.timing(animation, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Interpolamos el valor 0-1 a grados de rotación (0 a 180)
  const arrowRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Elegimos el estilo del header dependiendo de la variante elegida
  const getHeaderStyle = () => {
    switch (variant) {
      case 'outline': return styles.headerOutline;
      case 'minimal': return styles.headerMinimal;
      case 'card':
      default: return styles.headerCard;
    }
  };

  return (
    <View style={styles.container}>
      {/* EL BOTÓN (HEADER) */}
      <TouchableOpacity 
        style={[styles.headerBase, getHeaderStyle()]} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>{title}</Text>
        
        <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
          {/* Ícono de flecha hacia abajo */}
          <Ionicons name="chevron-down" size={20} color="#64748b" />
        </Animated.View>
      </TouchableOpacity>

      {/* EL CONTENIDO DESPLEGABLE (CHILDREN) */}
      {isExpanded && (
        <View style={styles.contentArea}>
          {children}
        </View>
      )}
    </View>
  );
};