import React, { useEffect, useState } from 'react';
import { Text, Dimensions, ScrollView, StyleSheet } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { getFirestore, collection, query, where, getCountFromServer, getDocs } from 'firebase/firestore';
import { app, auth } from '../services/firebase';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [counts, setCounts] = useState({ arguments: 0, speeches: 0 });

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;
          const db = getFirestore(app);

          const feedbackQuery = query(
            collection(db, 'speech_feedbacks'),
            where('userId', '==', user.uid)
          );
          const feedbackSnap = await getDocs(feedbackQuery);
          const data = feedbackSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => a.timestamp.seconds - b.timestamp.seconds)
            .slice(-15);
          setFeedbacks(data);

          const argumentsQuery = query(
            collection(db, 'arguments'),
            where('userId', '==', user.uid)
          );
          const speechesQuery = query(
            collection(db, 'speech_feedbacks'),
            where('userId', '==', user.uid)
          );

          const [argSnap, speechSnap] = await Promise.all([
            getCountFromServer(argumentsQuery),
            getCountFromServer(speechesQuery)
          ]);

          setCounts({
            arguments: argSnap.data().count,
            speeches: speechSnap.data().count
          });
        } catch (error) {
          console.log(error);
        }
      };

      fetchData();
    }, [])
  );

  const labels = feedbacks.map((fb, i) =>
    i % 2 === 0
      ? new Date(fb.timestamp.seconds * 1000).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
      : ''
  );

  const clarityData = {
    labels,
    datasets: [{
      data: feedbacks.map(fb => fb.clarity ?? 0),
      color: () => '#1a263f'
    }]
  };

  const confidenceData = {
    labels,
    datasets: [{
      data: feedbacks.map(fb => fb.confidence ?? 0),
      color: () => '#FFA500'
    }]
  };

  const summaryBarData = {
    labels: ['Arguments', 'Speeches'],
    datasets: [{
      data: [counts.arguments, counts.speeches]
    }]
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#f0f4ff',
    backgroundGradientTo: '#e0e6f7',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: () => '#444',
    propsForDots: {
      r: '4',
      strokeWidth: '1',
      stroke: '#1a263f',
    },
    propsForBackgroundLines: {
      stroke: '#ccc',
      strokeDasharray: '4',
    },
    style: {
      borderRadius: 16,
    },
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Analytics 📊</Text>

      <Text style={styles.chartTitle}>Summary</Text>
      <BarChart
        data={summaryBarData}
        width={screenWidth - 30}
        height={220}
        yAxisLabel=""
        chartConfig={chartConfig}
        style={styles.chart}
        fromZero
      />

      {feedbacks.length > 0 ? (
        <>
          <Text style={styles.chartTitle}>Clarity Over Time</Text>
          <LineChart
            data={clarityData}
            width={screenWidth - 30}
            height={240}
            yAxisSuffix="%"
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            verticalLabelRotation={45}
            fromZero
          />

          <Text style={styles.chartTitle}>Confidence Over Time</Text>
          <LineChart
            data={confidenceData}
            width={screenWidth - 30}
            height={240}
            yAxisSuffix="%"
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
              propsForDots: {
                r: '4',
                strokeWidth: '1',
                stroke: '#FFA500',
              }
            }}
            bezier
            style={styles.chart}
            verticalLabelRotation={45}
            fromZero
          />
        </>
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No feedback data yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#1a263f' },
  chart: { borderRadius: 12, marginBottom: 30 },
  chartTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 }
});
