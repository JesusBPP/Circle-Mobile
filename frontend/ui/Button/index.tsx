import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 
import { styles } from './styles';
import { IconChevronRight } from '../Icons';

// ==========================================
// ESTILO 1: NEOMORPHIC WITH GLOW
// ==========================================
interface ButtonNeoProps {
  title?: string;
  icon?: React.ReactNode;
  glowColor?: string;
  isIconOnly?: boolean;
  backgroundColor?: string; 
  isRectangular?: boolean;  
  textColor?: string;       
  underGlow?: boolean;
  // 🌟 AÑADIDO: Soporte para clics
  onPress?: () => void; 
}

export const ButtonNeo = ({ 
  title, 
  icon, 
  glowColor = '#ff003c', 
  isIconOnly = false,
  backgroundColor = '#222428', 
  isRectangular = false,
  textColor,
  underGlow = false,
  onPress // 🌟 Extraemos la prop
}: ButtonNeoProps) => {
  const finalTextColor = textColor || glowColor; 

  return (
    <TouchableOpacity 
      style={[
        styles.neoContainer, 
        isIconOnly && styles.neoIconOnly,
        isRectangular && styles.neoRectangular,
        { shadowColor: glowColor, backgroundColor: backgroundColor },
        underGlow && {
          shadowOffset: { width: 0, height: 0 }, 
          shadowOpacity: 0.8, 
          shadowRadius: 15,   
          elevation: 20       
        }
      ]} 
      activeOpacity={0.7}
      onPress={onPress} // 🌟 Se la pasamos al componente táctil
    >
      {icon}
      {title && (
        <Text style={[
          styles.neoText, 
          { 
            color: finalTextColor, 
            textShadowColor: glowColor, 
            textShadowRadius: 8, 
            marginTop: icon && !isRectangular ? 8 : 0, 
            marginLeft: icon && isRectangular ? 10 : 0 
          }
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// ==========================================
// ESTILO 2: FLAT WITH ACCENT COLOR BLOCKS
// ==========================================
interface ButtonFlatBlockProps {
  title: string;
  icon: React.ReactNode;
  mainColor: string;
  blockColor: string;
  // 🌟 AÑADIDO: Soporte para clics
  onPress?: () => void;
}
export const ButtonFlatBlock = ({ title, icon, mainColor, blockColor, onPress }: ButtonFlatBlockProps) => {
  return (
    <TouchableOpacity 
      style={styles.flatBlockWrapper} 
      activeOpacity={0.8}
      onPress={onPress} // 🌟
    >
      <View style={[styles.flatTextBlock, { backgroundColor: mainColor }]}>
        <Text style={styles.flatText}>{title.toUpperCase()}</Text>
      </View>
      <View style={[styles.flatIconBlock, { backgroundColor: blockColor }]}>
        {icon}
      </View>
    </TouchableOpacity>
  );
};

// ==========================================
// ESTILO 3: GRADIENT WITH ARROW POINTS
// ==========================================
interface ButtonGradientProps {
  title: string;
  icon: React.ReactNode;
  gradientColors: [string, string];
  iconColor?: string;
  // 🌟 AÑADIDO: Soporte para clics
  onPress?: () => void;
}
export const ButtonGradientArrow = ({ title, icon, gradientColors, onPress }: ButtonGradientProps) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <LinearGradient 
        colors={gradientColors} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 0 }} 
        style={styles.gradWrapper}
      >
        <View style={styles.gradIconCircle}>
          {icon}
        </View>
        <Text style={styles.gradText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ==========================================
// ESTILO 4: CLEAN PURPLE UI ELEMENTS
// ==========================================
interface ButtonCleanProps {
  title: string;
  iconLeft?: React.ReactNode;
  statusText?: string;
  mainColor?: string;
  // 🌟 AÑADIDO: Soporte para clics
  onPress?: () => void;
}
export const ButtonCleanUI = ({ title, iconLeft, statusText, mainColor = '#7b2cbf', onPress }: ButtonCleanProps) => {
  return (
    <TouchableOpacity 
      style={[styles.cleanWrapper, { backgroundColor: mainColor, shadowColor: mainColor }]} 
      activeOpacity={0.8}
      onPress={onPress} // 🌟
    >
      <View style={styles.cleanLeftSection}>
        {iconLeft}
        <Text style={styles.cleanText}>{title}</Text>
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {statusText && <Text style={styles.cleanStatusText}>{statusText}</Text>}
        <IconChevronRight size={18} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
};