import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LoginAnimation } from '../animations/loginAnimation';

export default function Sandbox() {
  return (
    <View style={styles.container}>
      <LoginAnimation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Fondo negro
  },
});