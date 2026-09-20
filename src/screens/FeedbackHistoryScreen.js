import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from 'react-native';
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { app } from '../services/firebase';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native-paper';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FeedbackHistoryScreen() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [filter, setFilter] = useState('');
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;
    const db = getFirestore(app);
    const q = query(
      collection(db, 'speech_feedbacks'),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFeedbacks(data);
      setFilteredFeedbacks(data);
    });
    return () => unsubscribe();
  }, []);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const applyFilter = () => {
    const f = feedbacks.filter((item) =>
      (item.transcript + item.feedback)
        .toLowerCase()
        .includes(filter.toLowerCase())
    );
    setFilteredFeedbacks(f);
  };

  const clearFilter = () => {
    setFilter('');
    setFilteredFeedbacks(feedbacks);
  };

  const deleteFeedback = async (id) => {
    try {
      await deleteDoc(doc(getFirestore(app), 'speech_feedbacks', id));
      const updated = feedbacks.filter((item) => item.id !== id);
      setFeedbacks(updated);
      setFilteredFeedbacks(updated);
    } catch (e) {
      Alert.alert('Error', 'Could not delete feedback.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        mode="outlined"
        label="Search transcript or feedback"
        value={filter}
        onChangeText={setFilter}
        style={styles.input}
      />

      <View style={styles.filterButtons}>
        <TouchableOpacity
          style={[styles.btn, styles.applyBtn]}
          onPress={applyFilter}
        >
          <Text style={styles.btnText}>Apply Filter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.clearBtn]}
          onPress={clearFilter}
        >
          <Text style={styles.clearText}>Clear Filter</Text>
        </TouchableOpacity>
      </View>

      {filteredFeedbacks.length === 0 ? (
        <Text style={styles.empty}>No feedback found.</Text>
      ) : (
        filteredFeedbacks.map((item) => (
          <View key={item.id} style={styles.card}>
            <TouchableOpacity
              onPress={() => toggleExpand(item.id)}
              style={styles.header}
            >
              <Ionicons
                name={
                  expandedItems[item.id]
                    ? 'chevron-down'
                    : 'chevron-forward'
                }
                size={20}
                color="#1a263f"
              />
              <Text style={styles.date}>
                {item.transcript
                  ?.slice(0, 40)
                  ?.replace(/\n/g, ' ') +
                  (item.transcript?.length > 40 ? '… ' : ' ')}
                {new Date(
                  item.timestamp.seconds * 1000
                ).toLocaleString()}
              </Text>
            </TouchableOpacity>

            {expandedItems[item.id] && (
              <>
                <Text style={styles.label}>Transcript:</Text>
                <Text style={styles.transcript}>{item.transcript}</Text>

                <Text style={styles.label}>Clarity:</Text>
                <Text style={styles.value}>{item.clarity ?? '-'}</Text>

                <Text style={styles.label}>Confidence:</Text>
                <Text style={styles.value}>{item.confidence ?? '-'}</Text>

                {item.feedback && (
                  <>
                    <Text style={styles.label}>AI Feedback:</Text>
                    <Text style={styles.feedback}>{item.feedback}</Text>
                  </>
                )}
              </>
            )}

            <View style={styles.deleteRow}>
              <TouchableOpacity
                style={[styles.btn, styles.clearBtn]}
                onPress={() => deleteFeedback(item.id)}
              >
                <Text style={styles.clearText}>Delete Feedback</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  applyBtn: {
    backgroundColor: '#1a263f',
  },
  clearBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1a263f',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize:16
  },
  clearText: {
    color: '#1a263f',
    fontWeight: '600',
    fontSize:16
  },
  empty: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#f0f4ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  transcript: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#333',
    marginTop: 4,
  },
  feedback: {
    fontSize: 14,
    color: '#444',
    marginTop: 6,
    backgroundColor: '#eef4ff',
    padding: 8,
    borderRadius: 8,
  },
  deleteRow: {
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row'
  },
  deleteBtn: {
    backgroundColor: '#FF3B30',
  },
  delBtn: {
    flex: 1,
    backgroundColor: '#1a263f',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  delBtnText: { color: '#fff', fontWeight: '600' },
});
