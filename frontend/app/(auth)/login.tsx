import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  Dimensions,
  Alert
} from 'react-native';
import { router } from 'expo-router'; // <-- Importamos el router para cambiar de pantalla

import { LoginAnimation } from '../../animations/loginAnimation';
import { loginUser } from '../../features/auth/authService'; // <-- Importamos nuestro servicio

const { height } = Dimensions.get('window');

// --- COMPONENTES GENÉRICOS ---
const GenericInput = ({ placeholder, value, onChangeText, secureTextEntry = false }: any) => (
  <View style={styles.inputContainer}>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      autoCapitalize="none"
    />
  </View>
);

const GenericButton = ({ title, onPress, isLoading = false }: any) => (
  <TouchableOpacity 
    style={[styles.button, isLoading && styles.buttonDisabled]} 
    onPress={onPress} 
    disabled={isLoading}
    activeOpacity={0.8}
  >
    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{title}</Text>}
  </TouchableOpacity>
);

// ==========================================
// --- PANTALLA DE LOGIN ---
// ==========================================

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginAttempt = async () => {
    Keyboard.dismiss();
    if (!email || !password) { 
        Alert.alert("Campos vacíos", "Por favor llena todos los campos"); 
        return; 
    }
    
    setIsLoading(true);
    
    try {
      // 1. Llamamos a FastAPI a través de nuestro servicio
      const userData = await loginUser(email, password);
      
      // 2. Si todo sale bien, damos la bienvenida y cambiamos de pantalla
      console.log("Datos recibidos del backend:", userData);
      
      // router.replace borra el historial para que el usuario no pueda volver al login dándole al botón de "Atrás"
      router.replace('/(tabs)/home'); 

    } catch (error: any) {
      // 3. Si falla (contraseña incorrecta), mostramos el error que mandó FastAPI
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
            <View style={styles.topSection}>
              <LoginAnimation />
            </View>
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
              <GenericButton title="Iniciar Sesión" onPress={handleLoginAttempt} isLoading={isLoading} />
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
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingHorizontal: 25, paddingTop: 25, paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    width: '100%', elevation: 25, shadowColor: '#000', shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2, shadowRadius: 15,
  },
  headerForm: { alignItems: 'center', marginBottom: 20 },
  brandTitle: { fontSize: 28, fontWeight: 'bold', color: '#1e3a8a', letterSpacing: 1 },
  brandSubtitle: { fontSize: 12, color: '#64748b', textAlign: 'center' },
  formFields: { width: '100%', gap: 12 },
  inputContainer: {
    width: '100%', height: 48, backgroundColor: '#f1f5f9', borderRadius: 12,
    paddingHorizontal: 15, justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0',
  },
  input: { fontSize: 16, color: '#1e293b' },
  button: {
    width: '100%', height: 48, backgroundColor: '#1d4ed8', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 5, elevation: 3,
  },
  buttonDisabled: { backgroundColor: '#93c5fd' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});