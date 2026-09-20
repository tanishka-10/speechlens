// 
import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert , TouchableOpacity} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { generateArguments } from '../services/openai';
import { saveArguments } from '../services/firestore';

export default function MockArgumentScreen() {
  const [topic, setTopic] = useState('');
  const [debateType, setDebateType] = useState('Lincoln-Douglas');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const debateFormatMapping = {
    'Lincoln-Douglas': 'Generate a full Lincoln-Douglas (LD) debate case for both the Affirmative and Negative sides. For each side, include:A clear value and criterion. Two contentions with subpoints and analytical reasoning. Relevant philosophical or empirical evidence. A brief conclusion tying back to the value/criterion. Format the output as: Affirmative Case\n\nValue: ... Criterion: ... Contention 1: ... Rebuttal Strategy: ... Weighing:...  Contention 2: ...  Rebuttal Strategy: ... Weighing: ... Conclusion: ... Negative Case: Value: ...Criterion: ...Contention 1: ...Rebuttal Strategy: ... Weighing:... Contention 2: ...  Rebuttal Strategy: ... Weighing: ...  Conclusion: ...Focus on depth, moral reasoning, and LD-appropriate style for high school debate.',
    'Public Forum': 'Generate a full Public Forum (PF) debate case for both the Pro and Con sides on the following resolution:\n\nFor each side, include:\n\nA clear framework or weighing mechanism\n\nTwo contentions with detailed subpoints\n\nSupporting evidence, examples, and reasoning\n\nA brief conclusion for each side\n\nFormat the output as:\n\n Pro Case\n\nFramework: ...\n\nContention 1: ...\n\nContention 2: ...\n\nConclusion: ...\n\n Con Case\n\nFramework: ...\n\nContention 1: ...\n\nContention 2: ...\n\nConclusion: ...\n\nFocus on clarity, balance, and logical depth appropriate for high school PF debate tournaments',
    'Parliamentary': 'Generate a full Parliamentary debate round with Government and Opposition cases on the following motion:\n\nFor each side, include:\n\nA Prime Minister or Leader of Opposition Constructive speech\n\nAt least two key arguments with support\n\nStrategic framing and rebuttals (where appropriate)\n\nClosing summary and stance\n\nFormat the output as:\n\n Government Side\n\nPM Constructive: ...\n\nArgument 1: ...\nArgument 2: ...\n\nConclusion: ...\n\n Opposition Side\n\nLO Constructive: ...\n\nArgument 1: ...\nArgument 2: ...\n\nConclusion: ...\n\nUse natural language, global or domestic examples, and persuasive rhetorical structure for competitive high school Parliamentary debate.',
  }
  const handleGenerate = async () => {
    setLoading(true);
    const output = await generateArguments(topic, debateType, debateFormatMapping[debateType]);
    setResult(output);
    await saveArguments(topic, output, debateType); // Save with type
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

      <Text style={styles.label}>Select Debate Type:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={debateType}
          onValueChange={(itemValue) => setDebateType(itemValue)}
        >
          <Picker.Item label="Lincoln-Douglas" value="Lincoln-Douglas" />
          <Picker.Item label="Public Forum" value="Public Forum" />
          <Picker.Item label="Parliamentary" value="Parliamentary" />
        </Picker>
      </View>
      {!loading &&  <TouchableOpacity
                      style={[styles.btn, styles.shareBtn]}
                      onPress={handleGenerate}
                    >
                      <Text style={styles.btnText}>Generate Arguments</Text>
          </TouchableOpacity>
      }
      {loading && <Text style={styles.loading}>Generating...</Text>}
      {result && <Text style={styles.result}>{result}</Text>}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 30 },
  input: { borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 8 },
  label: { marginVertical: 8, fontWeight: 'bold' },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    marginBottom: 16,
    overflow: 'hidden',
  },
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
