import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, Platform, 
  TouchableWithoutFeedback, Keyboard, Dimensions, Alert
} from 'react-native';
import { router } from 'expo-router'; 

import { LoginAnimation } from '../../animations/loginAnimation';
import { loginUser } from '../../features/auth/authService'; 
import { IconLogin } from '../../ui/Icons'; 
import { useAuthStore } from '../../store/useAuthStore';

const { height } = Dimensions.get('window');

const GenericInput = ({ placeholder, value, onChangeText, secureTextEntry = false }: any) => (
  <View style={styles.inputContainer}>
    <TextInput
      style={styles.input} placeholder={placeholder} placeholderTextColor="#94a3b8"
      value={value} onChangeText={onChangeText} secureTextEntry={secureTextEntry} autoCapitalize="none"
    />
  </View>
);

const LoginNeoButton = ({ title, onPress, isLoading = false }: any) => (
  <TouchableOpacity 
    style={[styles.neoButton, isLoading && styles.buttonDisabled]} 
    onPress={onPress} disabled={isLoading} activeOpacity={0.7}
  >
    {isLoading ? (
      <ActivityIndicator color="rgb(0, 71, 171)" /> 
    ) : (
      <>
        <IconLogin size={24} color="rgb(0, 71, 171)" />
        <Text style={styles.neoButtonText}>{title}</Text>
      </>
    )}
  </TouchableOpacity>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 Extraemos setDashboardData también
  const { setToken, setDashboardData } = useAuthStore();

  const handleLoginAttempt = async () => {
    Keyboard.dismiss();
    if (!email || !password) { 
        Alert.alert("Campos vacíos", "Por favor llena todos los campos"); return; 
    }
    
    setIsLoading(true);
    
    try {
      const userData = await loginUser(email, password);
      
      if (userData.access_token) {
        setToken(userData.access_token);
        // 🌟 CLAVE PARA EVITAR EL ERROR 422: 
        // Le pasamos el nombre de inmediato para que `home.tsx` sepa si es Admin o no.
        setDashboardData(userData.nombre, 'Cargando...', 'Cargando...');
      }
      
      // 🌟 Cambiamos la ruta hacia el Home real
      router.replace('/(tabs)/home'); 

    } catch (error: any) {
      Alert.alert("Error de Acceso", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          
          <View style={StyleSheet.absoluteFillObject}>
            <View style={styles.topSection}><LoginAnimation /></View>
            <View style={styles.bottomBlackFiller} />
          </View>

          <View style={styles.formLayer}>
            <View style={styles.headerForm}>
              <Text style={styles.brandTitle}>Circle</Text>
              <Text style={styles.brandSubtitle}>Conectando tu ecosistema comercial</Text>
            </View>

            <View style={styles.formFields}>
              <GenericInput placeholder="Correo electrónico" value={email} onChangeText={setEmail} />
              <GenericInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry={true} />
              <LoginNeoButton title="INICIAR SESIÓN" onPress={handleLoginAttempt} isLoading={isLoading} />
            </View>
          </View>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  innerContainer: { flex: 1, justifyContent: 'flex-end' },
  topSection: { height: height * 0.75, width: '100%', overflow: 'hidden' },
  bottomBlackFiller: { flex: 1, backgroundColor: '#000' },
  formLayer: {
    backgroundColor: 'rgb(255, 255, 240)', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingHorizontal: 25, paddingTop: 25, paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    width: '100%', elevation: 25, shadowColor: '#000', shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2, shadowRadius: 15,
  },
  headerForm: { alignItems: 'center', marginBottom: 20 },
  brandTitle: { fontSize: 28, fontWeight: 'bold', color: '#1e3a8a', letterSpacing: 1 },
  brandSubtitle: { fontSize: 12, color: '#64748b', textAlign: 'center' },
  formFields: { width: '100%', gap: 12 },
  inputContainer: {
    width: '100%', height: 48, backgroundColor: 'rgb(255, 255, 240)', borderRadius: 12,
    paddingHorizontal: 15, justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0',
  },
  input: { fontSize: 16, color: '#1e293b' },
  neoButton: {
    width: '100%', backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'center', 
    alignItems: 'center', paddingVertical: 14, borderRadius: 12, marginTop: 10,
    shadowColor: 'rgb(0, 71, 171)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8,
    shadowRadius: 15, elevation: 15,
  },
  buttonDisabled: { opacity: 0.6 },
  neoButtonText: { 
    color: 'rgb(0, 71, 171)', fontSize: 16, fontWeight: 'bold', letterSpacing: 1,
    marginLeft: 10, textShadowColor: 'rgba(0, 71, 171, 0.4)', textShadowRadius: 6,
  },
});