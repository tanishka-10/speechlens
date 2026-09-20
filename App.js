import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import {
  View, ActivityIndicator
} from 'react-native';
import { auth } from './src/services/firebase';


import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ArgumentScreen from './src/screens/ArgumentScreen';
import SavedArgumentsScreen from './src/screens/SavedArgumentsScreen';
import PromptGeneratorScreen from './src/screens/PromptGeneratorScreen';
import MockArgumentScreen from './src/screens/MockArgumentScreen';
import SpeechCoachScreen from './src/screens/SpeechCoachScreen';
import PracticeModeScreen from './src/screens/PracticeModeScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SplashScreen from './src/screens/SplashScreen';
import VerifyEmailScreen from './src/screens/VerifyEmailScreen';
import ExportScreen from './src/screens/ExportScreen';
import BottomTabs from './src/components/BottomTabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SwipeTabs from './src/components/SwipeTabs';
import FeedbackHistoryScreen from './src/screens/FeedbackHistoryScreen';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const useSwipeTabs = false;
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  if (checkingAuth) return <SplashScreen />;
  if (user && !user.emailVerified) {
    const user = auth.currentUser;

    sendEmailVerification(user)
      .then(() => setEmailSent(true))
      .catch((err) => Alert.alert("Error", err.message));

    return <AuthScreen />;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer detachInactiveScreens={false}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            unmountOnBlur: false,        
             freezeOnBlur: false,
            ...TransitionPresets.FadeFromBottomAndroid,
          }}
        >
          {!user ? (
            <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
          ) : (
            <>

              <Stack.Screen name="Main" component={useSwipeTabs ? SwipeTabs : BottomTabs} />
              <Stack.Screen name="Arguments" component={ArgumentScreen} options={{ headerShown: true, title: 'Arguments' }} />
              <Stack.Screen name="Saved" component={SavedArgumentsScreen} options={{ headerShown: true, title: 'Saved Arguments' }} />
              <Stack.Screen name="PromptGenerator" component={PromptGeneratorScreen} options={{ headerShown: true, title: 'Prompt Generator' }} />
              <Stack.Screen name="MockArguments" component={MockArgumentScreen} options={{ headerShown: true, title: 'Mock Arguments Screen' }} />
              <Stack.Screen name="SpeechCoach" component={SpeechCoachScreen} options={{ headerShown: true, title: 'AI Speech Coach' }} />
              <Stack.Screen name="PracticeMode" component={PracticeModeScreen} options={{ headerShown: true, title: 'Practice Mode' }} />
              <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ headerShown: true, title: 'Analytics' }} />
              <Stack.Screen name="FeedbackHistory" component={FeedbackHistoryScreen} options={{ headerShown: true, title: 'Speech Feedback' }} />
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="Export" component={ExportScreen}  options={{ headerShown: true, title: 'Share & Export' }}
/>

            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
