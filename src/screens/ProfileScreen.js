import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function ProfileScreen({ navigation }) {
  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace('Auth');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Button title="Logout" onPress={handleLogout} buttonColor="#1a263f" textColor="white" color="#1a263f"/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
});
