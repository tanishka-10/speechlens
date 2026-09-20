import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ScrollView } from 'react-native';
import { generateArguments } from '../services/openai';
import { saveArguments } from '../services/firestore';

export default function ArgumentScreen() {
  const [topic, setTopic] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateArguments(topic);
    setResponse(result);
    await saveArguments(topic, result);
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter a debate topic"
        value={topic}
        onChangeText={setTopic}
      />
      <Button title="Generate Arguments" onPress={handleGenerate} buttonColor="#1a263f" textColor="white" color="#1a263f"/>
      {loading ? <Text>Generating...</Text> : null}
      <Text style={styles.result}>{response}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 50 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  result: { marginTop: 20 }
});
