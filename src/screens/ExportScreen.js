// src/screens/ExportScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../services/firebase';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';

export default function ExportScreen() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;
    const user = getAuth().currentUser;
    if (!user) return;
    const db = getFirestore(app);
    const q = query(
      collection(db, 'debate_sessions'),
      where('userId', '==', user.uid)
    );
    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // sort latest first
      docs.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
      setSessions(docs);
    });
    return () => unsub();
  }, [isFocused]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.date}>
        {new Date(item.timestamp.seconds * 1000).toLocaleString()}
      </Text>
      <Text style={styles.type}>{item.debateType} Debate</Text>
      <Text style={styles.type}>{item.transcript?.slice(0, 40)?.replace('\n', '') + (item.transcript?.length > 40 ? '...\n' : '')}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => handleExport(item, 'share')}
        >
          <Text style={styles.btnText}>Share PDF</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={[styles.btn, styles.emailBtn]}
          onPress={() => handleExport(item, 'email')}
        >
          <Text style={styles.btnText}>Email PDF</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );

  const handleExport = async (session, mode) => {
    setLoading(true);
    try {
      // 1) Build HTML
      const html = `
        <html>
          <body style="font-family: sans-serif; padding:24px;">
            <h1>Debate Practice Export</h1>
            <p><strong>Date:</strong> ${new Date(
              session?.timestamp.seconds * 1000
            ).toLocaleString()}</p>
            <p><strong>Type:</strong> ${session?.debateType}</p>
            <h2>Transcript</h2>
            <p>${session?.transcript}</p>
            <h2>Cross-Ex / POIs</h2>
            <p>${session?.questions}</p>
            <h2>Rebuttal</h2>
            <p>${session?.rebuttal}</p>
          </body>
        </html>
      `;

      // 2) Print to PDF
      const { uri } = await Print.printToFileAsync({ html });
      if (mode === 'share') {
        // 3a) share via share-sheet
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share your Debate PDF',
        });
      } else {
        // 3b) email via MailComposer
        const isAvailable = await MailComposer.isAvailableAsync();
        if (!isAvailable) {
          alert('Email composer not available on this device.');
        } else {
          await MailComposer.composeAsync({
            subject: 'Your Debate Practice Export',
            body: 'Please find attached the PDF of your debate session.',
            attachments: [uri],
          });
        }
      }
    } catch (e) {
      console.error(e);
      alert('Sorry, could not generate or share PDF.');
    } finally {
      setLoading(false);
    }
  };

  if (sessions.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No past sessions to export.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1a263f" />
        </View>
      )}
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  card: {
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  date: { fontSize: 12, color: '#555' },
  type: { fontSize: 16, fontWeight: '600', marginVertical: 8, color: '#1a263f' },
  buttons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
    borderColor: '#1a263f',
    borderWidth: 1,
  },
  emailBtn: { backgroundColor: '#28a745' },
  btnText: { color: '#1a263f', fontWeight: '600', fontSize:16 }
});
