import React, { useState } from 'react';
import { View, ScrollView, TextInput, Button, Text, StyleSheet, Alert, Image, Dimensions } from 'react-native';
import {
  auth
} from '../services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { getFriendlyAuthError } from '../utils/authErrors';

const screenWidth = Dimensions.get('window').width;

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    try {
      if (isLogin) {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        await user.reload();
        if (!user.emailVerified) {
          await signOut(auth);
          Alert.alert(
            'Email Not Verified',
            'Please verify your email before logging in.'
          );
        }
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(user);
        Alert.alert(
          'Verify Email',
          'A verification email has been sent. Please verify your email before logging in.'
        );
        await signOut(auth);
      }
    } catch (err) {
      console.log(err);
      const friendlyMessage = getFriendlyAuthError(err.code);
      setError(friendlyMessage);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return Alert.alert("Enter your email first.");
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Password Reset Email Sent", "Check your inbox.");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const resendVerification = async () => {
    const user = auth.currentUser;
    console(user)
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
      Alert.alert('Sent', 'Verification email sent again.');
    }
  };
  return (
    
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../assets/speechLenslogo.png')}
        style={styles.logo}
      />
      <Text style={styles.appName}>Speech Lens</Text>

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
      <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} style={styles.input} />
      <Button title={isLogin ? "Login" : "Register"} buttonColor="#1a263f" textColor="white" color="#1a263f" onPress={handleAuth} />
      <Text onPress={() => setIsLogin(!isLogin)} style={styles.toggle}>
        {isLogin ? "New user? Register" : "Already have an account? Login"}
      </Text>
      {isLogin && (
        <Text style={styles.forgot} onPress={handlePasswordReset}>
          Forgot Password?
        </Text>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  logo: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 10,
  },
  appName: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 8 },
  toggle: { marginTop: 10, color: '#1a263f', textAlign: 'center' },
  resend: { marginTop: 10, color: '#1a263f', textAlign: 'center' },
  error: { color: 'red', marginTop: 10, textAlign: 'center' },
  forgot: { marginTop: 8, color: '#1a263f', textAlign: 'center' },
});
