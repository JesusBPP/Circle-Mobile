import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';

// 🌟 Importamos los nuevos íconos
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
export const RadialMenuHome = () => {
  // Estados para la interacción del menú
  const [isOpen, setIsOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  // Estados para la animación de los aros y los íconos
  const spinValue = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  
  const iconSequence = [
    IconRise, IconBulb, IconContacts, IconContainer, IconControl, 
    IconPieChart, IconProduct, IconShop, IconSmile, IconStar, 
    IconThunderbolt, IconLocation, IconTool, Icon500px, IconAreaGraph
  ];

  const [shapeIndex, setShapeIndex] = useState(() => Math.floor(Math.random() * iconSequence.length));

  // 1. Controlamos la rotación y el temporizador de íconos según si está abierto o cerrado
  useEffect(() => {
    if (!isOpen) {
      // 🛠️ FIX: Reiniciamos el valor a 0 antes de comenzar.
      // Así garantizamos que siempre recorra toda la distancia en los 3000ms originales
      // solucionando el problema de que se volviera cada vez más lento.
      spinValue.setValue(0);

      // 🟢 Si está cerrado: Inicia rotación y temporizador
      loopRef.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 3000, 
          easing: Easing.linear, 
          useNativeDriver: true, 
        })
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
      // 🛑 Si está abierto: Detenemos la animación de giro
      loopRef.current?.stop();
    }
  }, [isOpen, spinValue]);

  // 2. Acción al presionar el botón central
  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    // Animación de despliegue de las opciones negras
    Animated.spring(menuAnim, {
      toValue: nextState ? 1 : 0,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  // --- CÁLCULOS DE ROTACIÓN (Respetando tus ajustes) ---
  const spinClockwiseSlow = spinValue.interpolate({ inputRange: [0, 0.8], outputRange: ['0deg', '290deg'] });
  const spinCounterClockwiseFast = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '-360deg'] });
  const spinClockwiseFast = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '720deg'] });

  // --- CÁLCULOS DE DESPLIEGUE (Sub-opciones negras formando un arco superior) ---
  const opt1 = { transform: [{ scale: menuAnim }, { translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) }, { translateX: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -95] }) }] };
  const opt2 = { transform: [{ scale: menuAnim }, { translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -75] }) }, { translateX: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -60] }) }] };
  const opt3 = { transform: [{ scale: menuAnim }, { translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -95] }) }] };
  const opt4 = { transform: [{ scale: menuAnim }, { translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -75] }) }, { translateX: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }) }] };
  const opt5 = { transform: [{ scale: menuAnim }, { translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) }, { translateX: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 95] }) }] };

  // --- RENDERIZADO DEL ÍCONO CENTRAL ---
  const renderCenterShape = () => {
    const iconColor = "rgb(184, 134, 11)"; // Tu color configurado
    const CurrentIcon = iconSequence[shapeIndex];
    return <CurrentIcon size={26} color={iconColor} />;
  };

  // --- RENDERIZADO DE LAS OPCIONES SECUNDARIAS ---
  const renderSecondaryOption = (style: any, iconName: any) => (
    <Animated.View style={[styles.secondaryMenuNode, style]}>
      <Ionicons name={iconName} size={20} color="#FFFFFF" />
    </Animated.View>
  );

  return (
    <View style={styles.rotatingContainer}>
      
      {/* 🌑 SUB-OPCIONES (Aparecen al hacer clic) */}
      {renderSecondaryOption(opt1, "settings-outline")}
      {renderSecondaryOption(opt2, "person-outline")}
      {renderSecondaryOption(opt3, "chatbubble-outline")}
      {renderSecondaryOption(opt4, "location-outline")}
      {renderSecondaryOption(opt5, "close-outline")}

      {/* ⭕ CÍRCULO EXTERIOR AZUL */}
      {/* Si isOpen es true, rellenamos las partes transparentes con su color para completarlo */}
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