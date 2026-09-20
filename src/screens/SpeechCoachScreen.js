import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import axios from 'axios';
import { getAPIKeys } from '../services/config';
import { analyzeSpeech, extractScores, canUseAI } from '../services/openai';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app, auth } from '../services/firebase';

export default function SpeechCoachScreen() {
  const recordingRef = useRef(null);
  const [recordingTimeout, setRecordingTimeout] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(false);

  const startRecording = async () => {
    const allowed = await canUseAI();
    if (!allowed) {
      alert('Limit reached: You can only use AI 1000 times per week.');
      return;
    }
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
  
      // ✅ Auto-stop after 6 seconds using dynamic closure-safe call
      const timeout = setTimeout(() => {
        if (recordingRef.current) {
          stopRecording(); // only call if current recording is still active
        }
      }, 480000);
      setRecordingTimeout(timeout);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };
  

  const stopRecording = async () => {
    if (recordingTimeout) {
      clearTimeout(recordingTimeout);
      setRecordingTimeout(null);
    }

    try {
      setLoading(true);
      const recording = recordingRef.current;
      if (!recording) throw new Error('No recording found');

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;

      const fileInfo = await FileSystem.getInfoAsync(uri);
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: fileInfo.uri.split('/').pop() || 'recording.m4a',
        type: 'audio/m4a',
      });
      formData.append('model', 'whisper-1');

      const { OPENAI_API_KEY } = await getAPIKeys();
      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const text = response.data.text;
      const feedback = await analyzeSpeech(text);
      const scores = extractScores(feedback);

      setTranscript(text);
      setFeedback(feedback);
      setScores(scores || {});
      setLoading(false);

      const db = getFirestore(app);
      await addDoc(collection(db, 'speech_feedbacks'), {
        userId: auth.currentUser.uid,
        transcript: text,
        feedback: feedback,
        clarity: scores?.clarity ?? null,
        confidence: scores?.confidence ?? null,
        structure: scores?.structure ?? null,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Error during transcription or feedback:', err);
      setLoading(false);
    }
  };

  const parseImprovements = (feedback) => {
    const matches = feedback.match(/(?<=\d\.\s).+?(?=\n|$)/g);
    return matches || [];
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.description}>
        Practice your speech. Get instant feedback on clarity, confidence, and structure. Rated out of 10, with suggestions to improve.
      </Text>

      {recordingRef.current && !loading ? (
        <TouchableOpacity
          style={[styles.btn, styles.shareBtn]}
          onPress={stopRecording}
        >
          <Text style={styles.btnText}>Stop Recording</Text>
        </TouchableOpacity>
      ) : !loading ? (
        <TouchableOpacity
          style={[styles.btn, styles.shareBtn]}
          onPress={startRecording}
        >
          <Text style={styles.btnText}>Start Recording</Text>
        </TouchableOpacity>
      ) : null}

      {loading && <ActivityIndicator size="large" color="#1a263f" style={{ marginTop: 20 }} />}

      {transcript ? (
        <View style={styles.resultBox}>
          <Text style={styles.sectionTitle}>📄 Transcript</Text>
          <Text style={styles.textBlock}>{transcript}</Text>

          <Text style={styles.sectionTitle}>📊 Scores</Text>
          <Text style={styles.score}>Clarity: {scores.clarity ?? '-'} / 10</Text>
          <Text style={styles.score}>Confidence: {scores.confidence ?? '-'} / 10</Text>

          <Text style={styles.sectionTitle}>Feedback Summary</Text>
          <Text style={styles.textBlock}>{feedback.split('Suggestions:')[0].trim()}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 30
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a263f',
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
    color: '#333',
  },
  score: {
    fontSize: 16,
    color: '#333',
    marginTop: 6,
  },
  textBlock: {
    fontSize: 14,
    marginTop: 10,
    color: '#333',
    lineHeight: 20,
  },
  resultBox: {
    backgroundColor: '#f0f4ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  bulletPoint: {
    fontSize: 14,
    marginTop: 6,
    paddingLeft: 6,
    color: '#333',
  },
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
    fontSize: 16
  }
});
