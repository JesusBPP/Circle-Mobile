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
// 🌟 Importamos nuestra flecha desde la biblioteca centralizada
import { IconChevronDown } from '../Icons'; 
import { styles } from './styles';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface DropdownButtonProps {
  title: string;
  variant?: 'card' | 'outline' | 'minimal';
  icon?: React.ReactNode; // 🌟 NUEVA PROP: Permite inyectar un ícono al lado del título
  children: React.ReactNode; 
}

export const DropdownButton = ({ 
  title, 
  variant = 'card', 
  icon, // Extraemos el ícono de las props
  children 
}: DropdownButtonProps) => {
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
    Animated.timing(animation, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const arrowRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

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
      <TouchableOpacity 
        style={[styles.headerBase, getHeaderStyle()]} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        {/* Contenedor para el Ícono y el Título */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {icon} 
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
          {/* Usamos el ícono desde nuestra biblioteca */}
          <IconChevronDown size={20} color="#64748b" />
        </Animated.View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.contentArea}>
          {children}
        </View>
      )}
    </View>
  );
};