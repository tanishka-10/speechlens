import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { auth } from '../services/firebase';
import { sendEmailVerification } from 'firebase/auth';

export default function VerifyEmailScreen({ navigation }) {
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user && !user.emailVerified && !emailSent) {
      sendEmailVerification(user)
        .then(() => setEmailSent(true))
        .catch((err) => Alert.alert("Error", err.message));
    }
  }, [emailSent]);

  const handleRefresh = async () => {
    await auth.currentUser.reload();
    if (auth.currentUser.emailVerified) {
      navigation.replace('Dashboard'); // Switch to dashboard if verified
    } else {
      Alert.alert('Not Verified', 'Please verify your email first.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.message}>
        We've sent a verification link to your email. Please check your inbox and click the link to verify.
      </Text>
      {emailSent && <Text style={styles.info}>Verification email sent!</Text>}
      <Button title="I've Verified My Email" onPress={handleRefresh} buttonColor="#1a263f" textColor="white" color="#1a263f"/>
      <Button title="Resend Email" onPress={() => {
        sendEmailVerification(auth.currentUser)
          .then(() => Alert.alert('Email Sent', 'Verification email resent.'))
          .catch((err) => Alert.alert("Error", err.message));
      }} buttonColor="#1a263f" textColor="white" color="#1a263f"/>
      <Button title="Logout" onPress={() => auth.signOut()} buttonColor="#1a263f" textColor="white" color="#1a263f" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#1a263f' },
  message: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  info: { fontSize: 14, color: 'green', textAlign: 'center', marginBottom: 20 },
});
