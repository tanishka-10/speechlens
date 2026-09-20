import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Button
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { getAPIKeys } from '../services/config';
import { analyzeDebate, generateRebuttalWizard } from '../services/openai';
import { auth } from '../services/firebase';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { app } from '../services/firebase';

export default function DebatePracticeScreen() {
  const [debateType, setDebateType] = useState('');
  const [transcript, setTranscript] = useState('');
  const [questions, setQuestions] = useState('');
  const [rebuttal, setRebuttal] = useState('');
  const [loading, setLoading] = useState(false);
  const [wizard, setWizard] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardLoading, setWizardLoading] = useState(false);

  const recordingRef = useRef(null);
  const [recordingTimeout, setRecordingTimeout] = useState(null);

  useEffect(() => {
    if (transcript) {
      handleWizard();
    }
  }, [transcript]);

  const handleWizard = async () => {
    setWizardLoading(true);
    const { rebuttal: newRebuttal, wizard: steps } = await generateRebuttalWizard(transcript, debateType);
    setRebuttal(newRebuttal);
    setWizard(steps);
    setShowWizard(true);
    setWizardLoading(false);
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;

      // Automatically stop after 6 seconds
      const timeout = setTimeout(() => {
        stopRecording();
      }, 480000);
      setRecordingTimeout(timeout);
    } catch (e) {
      console.error("Error starting recording:", e);
    }
  };

  const stopRecording = async () => {
    if (recordingTimeout) {
      clearTimeout(recordingTimeout);
      setRecordingTimeout(null);
    }

    setLoading(true);
    try {
      const recording = recordingRef.current;
      if (!recording) throw new Error('No recording found');

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const fileInfo = await FileSystem.getInfoAsync(uri);

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileInfo.uri.split('/').pop() || 'speech.m4a',
        type: 'audio/m4a',
      });
      formData.append('model', 'whisper-1');

      const { OPENAI_API_KEY } = await getAPIKeys();

      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      });

      const transcribed = response.data.text;
      setTranscript(transcribed);

      const aiOutput = await analyzeDebate(transcribed, debateType);
      setQuestions(aiOutput.questions);
      setRebuttal(aiOutput.rebuttal);

      const db = getFirestore(app);
      await addDoc(collection(db, 'debate_sessions'), {
        userId: auth.currentUser.uid,
        debateType,
        transcript: transcribed,
        questions: aiOutput.questions,
        rebuttal: aiOutput.rebuttal,
        timestamp: new Date()
      });

    } catch (err) {
      console.error("Recording error:", err);
    } finally {
      recordingRef.current = null;
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Debate Practice Mode</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={debateType} onValueChange={setDebateType}>
          <Picker.Item label="Select a type..." value="" />
          <Picker.Item label="Lincoln-Douglas" value="LD" />
          <Picker.Item label="Public Forum" value="PF" />
          <Picker.Item label="Parliamentary" value="Parli" />
        </Picker>
      </View>

      {debateType && !recordingRef.current && !loading && (
        <TouchableOpacity style={styles.btn} onPress={startRecording}>
          <Text style={styles.btnText}>Start Recording</Text>
        </TouchableOpacity>
      )}

      {recordingRef.current && !loading && (
        <TouchableOpacity style={styles.btn} onPress={stopRecording}>
          <Text style={styles.btnText}>Stop & Analyze</Text>
        </TouchableOpacity>
      )}

      {loading && <ActivityIndicator size="large" color="#1a263f" style={{ marginTop: 20 }} />}

      {transcript && (
        <View>
          <Text style={styles.section}>Transcript:</Text>
          <Text style={styles.text}>{transcript}</Text>

          <Text style={styles.section}>
            {debateType === 'Parli'
              ? 'Points of Information (POIs)'
              : 'Cross-Examination Questions'}
          </Text>
          <Text style={styles.text}>{questions}</Text>

          <Text style={styles.section}>Rebuttal Argument</Text>
          <Text style={styles.text}>{rebuttal}</Text>
        </View>
      )}

      {wizard.length > 0 && (
        <View style={styles.wizardSection}>
          <Button
            title={showWizard ? 'Hide Rebuttal Wizard' : 'Show Rebuttal Wizard'}
            onPress={() => setShowWizard(!showWizard)}
            disabled={wizardLoading}
          />
          {wizardLoading && <Text style={styles.loading}>Loading wizard…</Text>}
          {showWizard && wizard.map((step) => (
            <View key={step.step} style={styles.stepCard}>
              <Text style={styles.stepTitle}>{`Step ${step.step}: ${step.title}`}</Text>
              <Text style={styles.stepWhy}>Why: {step.why}</Text>
              <Text style={styles.stepExample}>Example: {step.example}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  pickerWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 20 },
  btn: { backgroundColor: '#1a263f', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  section: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 5 },
  text: { fontSize: 14, lineHeight: 20, color: '#333' },
  wizardSection: { marginTop: 20 },
  loading: { textAlign: 'center', marginVertical: 10 },
  stepCard: { backgroundColor: '#eef4ff', padding: 12, borderRadius: 8, marginTop: 12 },
  stepTitle: { fontWeight: '600', marginBottom: 6, color: '#1a263f' },
  stepWhy: { fontStyle: 'italic', marginBottom: 6 },
  stepExample: { color: '#333' },
});
