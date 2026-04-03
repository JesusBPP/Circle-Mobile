import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Íconos de Expo
import { styles } from './styles'; // 1. Importamos nuestros estilos estáticos

// 2. Definimos las Props (Propiedades) que este componente puede recibir.
interface RadialMenuProps {
  mainColor?: string;
  secondaryColor?: string;
  title?: string;
  isGlossyPink?: boolean; // NUEVA PROP: Activa el estilo brillante
}

export const RadialMenu = ({ 
  mainColor = 'rgb(0, 71, 171)', // Azul Cobalt (Valor por defecto)
  secondaryColor = 'rgb(135, 206, 235)', // Azul Sky (Valor por defecto)
  title,
  isGlossyPink = false // Por defecto es false para que los demás se vean planos
}: RadialMenuProps) => { 
  
  // 3. Estado local: Controla si el menú está abierto o cerrado
  const [isOpen, setIsOpen] = useState(false);
  const animation = useState(new Animated.Value(0))[0];

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  // 4. Lógica de animación para los 5 botones (Arco de la imagen)
  const option1Style = {
    transform: [
      { scale: animation },
      { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }) },
      { translateX: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -90] }) }
    ]
  };

  const option2Style = {
    transform: [
      { scale: animation },
      { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -110] }) },
      { translateX: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -45] }) }
    ]
  };

  const option3Style = {
    transform: [
      { scale: animation },
      { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -130] }) },
    ]
  };

  const option4Style = {
    transform: [
      { scale: animation },
      { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -110] }) },
      { translateX: animation.interpolate({ inputRange: [0, 1], outputRange: [0, 45] }) }
    ]
  };

  const option5Style = {
    transform: [
      { scale: animation },
      { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }) },
      { translateX: animation.interpolate({ inputRange: [0, 1], outputRange: [0, 90] }) }
    ]
  };

  // Función para renderizar los botones secundarios dependiendo del estilo
  const renderSecondaryButton = (style: any, text: string, iconName: any) => {
    if (isGlossyPink) {
      return (
        <Animated.View style={[styles.secondaryButton, styles.secondaryButtonGlossy_Outer, style]}>
          <View style={styles.secondaryButtonGlossy_DarkRing}>
            <Ionicons name={iconName} size={20} color="#FFFFFF" />
            <View style={styles.secondaryButtonGlossy_Glare} />
          </View>
        </Animated.View>
      );
    } else {
      return (
        <Animated.View style={[styles.secondaryButton, style, { backgroundColor: secondaryColor }]}>
          <Text style={styles.buttonText}>{text}</Text>
        </Animated.View>
      );
    }
  };

  return (
    <View style={[styles.container, isGlossyPink && styles.containerGlossy]}>
      {/* Mostramos el título si es que nos pasaron uno en las props */}
      {title && <Text style={styles.variantTitle}>{title}</Text>}

      {/* Opciones secundarias */}
      {renderSecondaryButton(option1Style, "1", "settings-outline")}
      {renderSecondaryButton(option2Style, "2", "person-outline")}
      {renderSecondaryButton(option3Style, "3", "chatbubble-ellipses-outline")}
      {/* Las opciones 4 y 5 solo se mostrarán visiblemente si es el menú Glossy o si ajustamos el plano más adelante */}
      {isGlossyPink && renderSecondaryButton(option4Style, "4", "location-outline")}
      {isGlossyPink && renderSecondaryButton(option5Style, "5", "notifications-outline")}

      {/* Botón Central */}
      {isGlossyPink ? (
        <View style={styles.mainButtonGlossy_Outer}>
          <TouchableOpacity 
            style={styles.mainButtonGlossy_Ring} 
            onPress={toggleMenu} 
            activeOpacity={0.8}
          >
            <Text style={styles.mainButtonTextGlossy}>{isOpen ? '✕' : '⚪'}</Text>
            <View style={styles.mainButtonGlossy_Glare} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.mainButton, { backgroundColor: mainColor }]} 
          onPress={toggleMenu} 
          activeOpacity={0.8}
        >
          <Text style={styles.mainButtonText}>{isOpen ? 'X' : 'O'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};