import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }) {
  const tiles = [
    {
      title: 'AI Speech Coach',
      subtitle: 'Receive feedback on your speech',
      icon: <Ionicons name="mic" size={36} color="#1a263f" />,
      screen: 'SpeechCoach',
    },
    {
      title: 'Debate Practice Mode',
      subtitle: 'Practice debating against an AI opponent',
      icon: <MaterialCommunityIcons name="account-voice" size={36} color="#1a263f" />,
      screen: 'PracticeMode',
    },
    /*{
      title: 'AI Argument Generator',
      subtitle: 'Generate arguments for any topic',
      icon: <FontAwesome5 name="lightbulb" size={30} color="#1a263f" />,
      screen: 'Arguments',
    },*/
    {
      title: 'Debate Prompt Generator',
      subtitle: 'Get prompts for debate practice',
      icon: <Ionicons name="document-text" size={32} color="#1a263f" />,
      screen: 'PromptGenerator',
    },
    {
      title: 'Argument Generator',
      subtitle: 'Generate pro & con arguments',
      icon: <Ionicons name="bulb" size={32} color="#1a263f" />, 
      screen: 'MockArguments',
    },
    {
      title: 'Speech Feedback',
      subtitle: 'Speech Feedback Clarity & Confidence',
      icon: <Ionicons name="analytics-outline" size={32} color="#1a263f" />,
      screen: 'FeedbackHistory',
    },
    {
      title: 'Saved Arguments',
      subtitle: 'View your previously generated arguments',
      icon: <Ionicons name="bookmark" size={32} color="#1a263f" />,
      screen: 'Saved',
    },
    {
      title: 'Share & Export',
      subtitle: 'Email or PDF your transcripts & feedback',
      screen: 'Export',
      icon: <MaterialCommunityIcons name="share-variant" size={36} color="#1a263f" />,
    },
    {
      title: 'Analytics',
      subtitle: 'Feeback Analytics',
      screen: 'Analytics',
      icon: <Ionicons name="bar-chart" size={32} color="#1a263f" />,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Speech Lens</Text>
      <View style={styles.grid}>
        {tiles.map((tile, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate(tile.screen)}
          >
            {tile.icon}
            <Text style={styles.cardTitle}>{tile.title}</Text>
            <Text style={styles.cardSubtitle}>{tile.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 50, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: '#f0f4ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  iconWrapper: { marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6, textAlign: 'center' },
  cardSubtitle: { fontSize: 12, color: '#555', textAlign: 'center' },
});
