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
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { fetchSavedArguments, deleteSavedArgument } from '../services/firestore';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native-paper';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SavedArgumentsScreen() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    fetchSavedArguments().then(results => {
      setData(results);
      setFilteredData(results);
    });
  }, []);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const applyFilter = () => {
    if (!filter) return setFilteredData(data);
    const f = data.filter(item =>
      (item.topic + item.content).toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredData(f);
  };

  const handleDelete = async (id) => {
    await deleteSavedArgument(id);
    const updated = data.filter(item => item.id !== id);
    setData(updated);
    setFilteredData(updated);
  };

  const handleShare = async (item) => {
    try {
      // build simple HTML for PDF
      const html = `
        <html>
          <body style="font-family:sans-serif;padding:20px;">
            <h1>${item.topic}</h1>
            <pre style="white-space: pre-wrap; font-size:14px;">${item.content}</pre>
          </body>
        </html>
      `;
      // print to PDF
      const { uri } = await Print.printToFileAsync({ html });
      // share sheet
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Your Argument PDF',
      });
    } catch (err) {
      console.error('Share error', err);
      alert('Could not share PDF.');
    }
  }; 

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        mode="outlined"
        label="Search topics or content"
        value={filter}
        onChangeText={setFilter}
        style={styles.input}
      />
      <View style={styles.filterButtons}>
        <TouchableOpacity style={[styles.btn, styles.applyBtn]} onPress={applyFilter}>
          <Text style={styles.btnText}>Apply Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.clearBtn]}
          onPress={() => { setFilter(''); setFilteredData(data); }}
        >
          <Text style={styles.clearText}>Clear Filter</Text>
        </TouchableOpacity>
      </View>

      {filteredData.length === 0 ? (
        <Text style={styles.empty}>No saved arguments yet.</Text>
      ) : (
        filteredData.map(item => (
          <View key={item.id} style={styles.card}>
            <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.header}>
              <Ionicons
                name={expandedItems[item.id] ? 'chevron-down' : 'chevron-forward'}
                size={20}
                color="#1a263f"
              />
              <Text style={styles.topic}>
                {item.topic.slice(0,50).replace(/\n/g,' ')}
                {item.topic.length>50? '…':''}
              </Text>
            </TouchableOpacity>

            {expandedItems[item.id] && (
              <Text style={styles.expandedContent}>
                Topic: {item.topic}{'\n'}
                Debate Type: {item.debateType}{'\n\n'}
                {item.content}
              </Text>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.btn, styles.shareBtn]}
                onPress={() => handleShare(item)}
              >
                <Text style={styles.btnText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.clearBtn]}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.clearText}>Delete</Text>
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
    backgroundColor: '#ffffff',
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
    marginBottom: 20,
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
  topic: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  expandedContent: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#e6ebff',
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  shareBtn: {
    backgroundColor: '#1a263f',
  },
  deleteBtn: {
    backgroundColor: '#FF3B30',
  },
});
