import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db, auth } from '../services/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function MyArgumentsScreen() {
  const [argumentsList, setArgumentsList] = useState([]);

  useEffect(() => {
    const fetchArguments = async () => {
      const q = query(collection(db, 'arguments'), where('userId', '==', auth.currentUser.uid), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArgumentsList(data);
    };
    fetchArguments();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Saved Arguments</Text>
      <FlatList data={argumentsList} keyExtractor={(item) => item.id} renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.topic}>{item.topic}</Text>
          <Text>{item.content}</Text>
        </View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  item: { marginBottom: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
  topic: { fontWeight: 'bold' }
});