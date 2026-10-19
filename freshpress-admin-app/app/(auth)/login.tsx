import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  
  const setToken = useAuthStore(state => state.setToken);
  const setUser = useAuthStore(state => state.setUser);

  const handleSendOtp = async () => {
    if (!phone) return Alert.alert('Error', 'Please enter a valid phone number');
    
    setLoading(true);
    try {
      await api.post('/v1/auth/send-otp', { phone: `+91${phone}` });
      setStep('OTP');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return Alert.alert('Error', 'Please enter OTP');
    
    setLoading(true);
    try {
      const response = await api.post('/v1/auth/verify-otp', { phone: `+91${phone}`, otp });
      
      const { token, user } = response.data.data;
      
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return Alert.alert('Unauthorized', 'You do not have administrative permissions.');
      }

      await setToken(token);
      setUser(user);
      
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Portal</Text>
        <Text style={styles.subtitle}>Secure access for platform management</Text>
      </View>

      <View style={styles.form}>
        {step === 'PHONE' ? (
          <>
            <Text style={styles.label}>Admin Mobile Number</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="9999999999"
                maxLength={10}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Authentication Code</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Enter Authentication Code</Text>
            <TextInput
              style={[styles.input, { paddingLeft: 16 }]}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              placeholder="123456"
              maxLength={6}
            />
            <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setStep('PHONE')} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: '#0f172a' }}>Change Phone Number</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a', // Dark slate for admin
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 24,
    height: 56,
  },
  prefix: {
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#334155',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    paddingHorizontal: 16,
    color: '#0f172a',
  },
  button: {
    backgroundColor: '#0f172a',
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
