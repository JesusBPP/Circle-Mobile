import { StyleSheet } from 'react-native';

export const colors = {
  sapphire: 'rgb(15, 82, 186)',
  cobaltBlue: 'rgb(0, 71, 171)',
  obsidian: 'rgb(11, 11, 11)',
  mediumGray: 'rgb(128, 128, 128)',
  amethyst: 'rgb(153, 102, 204)',
  silver: 'rgb(211, 211, 211)', 
  white: '#FFFFFF',             
  cream: 'rgb(245, 245, 220)',  // 🌟 Nuevo color Cream
};

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  background_Default: { backgroundColor: '#f1f5f9' },
  background_Dark: { backgroundColor: colors.obsidian },

  // 🌟 FONDOS BASE PARA LOS PATRONES
  background_PatternDark: {
    backgroundColor: colors.obsidian, 
    overflow: 'hidden',
  },
  background_PatternLight: {
    backgroundColor: colors.white, 
    overflow: 'hidden',
  },

  floatCircle: {
    position: 'absolute',
    borderRadius: 999, 
  },
  floatHex: {
    position: 'absolute',
  },

  neuralNode: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  neuralLine: {
    position: 'absolute',
    height: 1.5, 
  }
});