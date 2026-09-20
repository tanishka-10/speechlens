import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Speech Lens</Text>
      <Button title="Generate Arguments" onPress={() => navigation.navigate('Arguments')} />
      <Button title="My Saved Arguments" onPress={() => navigation.navigate('Saved')} />
      <Button title="Logout" onPress={async () => {
        await signOut(auth);
        navigation.replace('Auth');
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, marginBottom: 20 }
});
