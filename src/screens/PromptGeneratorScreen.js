import { generateTopics } from '../services/openai';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

export default function PromptGeneratorScreen() {
  const [topic, setTopic] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateTopics(topic);
    setResponse(result);
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter a debate category"
        value={topic}
        onChangeText={setTopic}
      />
       {!loading && <TouchableOpacity
                            style={[styles.btn, styles.shareBtn]}
                            onPress={handleGenerate}
                          >
                            <Text style={styles.btnText}>Generate Topics</Text>
                </TouchableOpacity>
      }
      {loading ? <Text>Generating...</Text> : null}
      <Text style={styles.result}>{response}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  item: { fontSize: 16, marginVertical: 6 },
  container: { padding: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 8 },
  loading: { marginTop: 10 },
  result: { marginTop: 20, fontSize: 16 },
  shareBtn: {
    backgroundColor: '#1a263f',
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize:16
  }
});
