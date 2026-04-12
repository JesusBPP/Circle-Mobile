import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';

import { 
  IconRise, IconBulb, IconContacts, IconContainer, IconControl, 
  IconPieChart, IconProduct, IconShop, IconSmile, IconStar, 
  IconThunderbolt, IconLocation, IconTool, Icon500px, IconAreaGraph 
} from '../Icons';

interface RadialMenuProps {
  mainColor?: string;
  secondaryColor?: string;
  title?: string;
}

// 🌟 INTERFAZ PARA LOS BOTONES DINÁMICOS
export interface RadialMenuItem {
  icon: any; 
  onPress: () => void;
  color?: string;
}

// ==========================================
// --- COMPONENTE 1: RadialMenu (Plano) ---
// ==========================================
export const RadialMenu = ({ 
  mainColor = 'rgb(0, 71, 171)', secondaryColor = 'rgb(135, 206, 235)', title 
}: RadialMenuProps) => { 
  const [isOpen, setIsOpen] = useState(false);
  const animation = useState(new Animated.Value(0))[0];

  const toggleMenu = () => {
    Animated.spring(animation, { toValue: isOpen ? 0 : 1, friction: 5, useNativeDriver: true }).start();
    setIsOpen(!isOpen);
  };

  const opt1 = { transform: [{ scale: animation }, { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -60] }) }, { translateX: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -50] }) }] };
  const opt2 = { transform: [{ scale: animation }, { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -75] }) }] };
  const opt3 = { transform: [{ scale: animation }, { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -60] }) }, { translateX: animation.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }) }] };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.variantTitle}>{title}</Text>}
      <Animated.View style={[styles.secondaryButton, opt1, { backgroundColor: secondaryColor }]}><Text style={styles.buttonText}>1</Text></Animated.View>
      <Animated.View style={[styles.secondaryButton, opt2, { backgroundColor: secondaryColor }]}><Text style={styles.buttonText}>2</Text></Animated.View>
      <Animated.View style={[styles.secondaryButton, opt3, { backgroundColor: secondaryColor }]}><Text style={styles.buttonText}>3</Text></Animated.View>
      <TouchableOpacity style={[styles.mainButton, { backgroundColor: mainColor }]} onPress={toggleMenu} activeOpacity={0.8}>
        <Text style={styles.mainButtonText}>{isOpen ? 'X' : 'O'}</Text>
      </TouchableOpacity>
    </View>
  );
};

// ===============================================================
// 🔄 COMPONENTE 2: RadialMenuHome (Interactivo y Animado)
// ===============================================================
interface RadialMenuHomeProps {
  items?: RadialMenuItem[]; // 🌟 Propiedad para inyectar botones dinámicamente
}

export const RadialMenuHome = ({ items }: RadialMenuHomeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const spinValue = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  
  const iconSequence = [
    IconRise, IconBulb, IconContacts, IconContainer, IconControl, 
    IconPieChart, IconProduct, IconShop, IconSmile, IconStar, 
    IconThunderbolt, IconLocation, IconTool, Icon500px, IconAreaGraph
  ];

  const [shapeIndex, setShapeIndex] = useState(() => Math.floor(Math.random() * iconSequence.length));

  useEffect(() => {
    if (!isOpen) {
      spinValue.setValue(0);
      loopRef.current = Animated.loop(
        Animated.timing(spinValue, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })
      );
      loopRef.current.start();

      const shapeInterval = setInterval(() => {
        setShapeIndex((prevIndex) => (prevIndex + 1) % iconSequence.length);
      }, 1500);

      return () => {
        clearInterval(shapeInterval);
        loopRef.current?.stop();
      };
    } else {
      loopRef.current?.stop();
    }
  }, [isOpen, spinValue]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    Animated.spring(menuAnim, {
      toValue: nextState ? 1 : 0, friction: 5, useNativeDriver: true,
    }).start();
  };

  const spinClockwiseSlow = spinValue.interpolate({ inputRange: [0, 0.8], outputRange: ['0deg', '290deg'] });
  const spinCounterClockwiseFast = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '-360deg'] });
  const spinClockwiseFast = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '720deg'] });

  const renderCenterShape = () => {
    const iconColor = "rgb(184, 134, 11)"; 
    const CurrentIcon = iconSequence[shapeIndex];
    return <CurrentIcon size={26} color={iconColor} />;
  };

  // 🌟 BOTONES POR DEFECTO (Para no romper el Sandbox si no se pasan props)
  const defaultItems: RadialMenuItem[] = [
    { icon: 'settings-outline', onPress: () => console.log('1') },
    { icon: 'person-outline', onPress: () => console.log('2') },
    { icon: 'chatbubble-outline', onPress: () => console.log('3') },
    { icon: 'location-outline', onPress: () => console.log('4') },
    { icon: 'close-outline', onPress: () => console.log('5') },
  ];
  
  const activeItems = items || defaultItems;

  // 🌟 MATEMÁTICA DISTRIBUTIVA (Trigonometría para un arco perfecto)
  const renderDynamicOptions = () => {
    return activeItems.map((item, index) => {
      const R = 95; // Radio del arco
      let angle;

      if (activeItems.length === 1) {
        angle = Math.PI / 2; // Si hay 1 solo botón, va exactamente al medio (90 grados)
      } else {
        const startAngle = Math.PI * (5 / 6); // 150 grados (Izquierda)
        const endAngle = Math.PI * (1 / 6);   // 30 grados (Derecha)
        // Interpolación lineal del ángulo según el número total de botones
        angle = startAngle - (index * ((startAngle - endAngle) / (activeItems.length - 1)));
      }

      // Calculamos X e Y (Y es negativo porque en React Native hacia arriba es negativo)
      const x = R * Math.cos(angle);
      const y = -R * Math.sin(angle);

      const translateX = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, x] });
      const translateY = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, y] });

      return (
        <Animated.View key={index} style={[styles.secondaryMenuNode, { transform: [{ scale: menuAnim }, { translateX }, { translateY }] }]}>
          <TouchableOpacity 
            style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => {
              handleToggle(); // Cerramos el menú
              item.onPress(); // Ejecutamos la acción (ej. navegar)
            }}
          >
            <Ionicons name={item.icon} size={20} color={item.color || "#FFFFFF"} />
          </TouchableOpacity>
        </Animated.View>
      );
    });
  };

  return (
    <View style={styles.rotatingContainer}>
      
      {/* 🌑 SUB-OPCIONES (Generadas dinámicamente) */}
      {renderDynamicOptions()}

      {/* ⭕ CÍRCULO EXTERIOR AZUL */}
      <Animated.View style={[
        styles.circleOutermost, 
        { transform: [{ rotate: spinClockwiseSlow }] },
        isOpen && { borderBottomColor: 'rgb(15, 82, 186)', borderRightColor: 'rgb(15, 82, 186)' }
      ]} />

      {/* ⭕ CÍRCULO MEDIO VERDE */}
      <Animated.View style={[
        styles.circleOuter, 
        { transform: [{ rotate: spinCounterClockwiseFast }] },
        isOpen && { borderTopColor: 'rgb(34, 139, 34)', borderLeftColor: 'rgb(34, 139, 34)' }
      ]} />
      
      {/* ⭕ CÍRCULO INTERIOR NEGRO */}
      <Animated.View style={[
        styles.circleInner, 
        { transform: [{ rotate: spinClockwiseFast }] },
        isOpen && { borderBottomColor: 'rgb(11, 11, 11)', borderLeftColor: 'rgb(11, 11, 11)' }
      ]} />

      {/* 🔘 BOTÓN CENTRAL INTERACTIVO */}
      <TouchableOpacity 
        style={styles.centerTouchable}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        {renderCenterShape()}
      </TouchableOpacity>

    </View>
  );
};