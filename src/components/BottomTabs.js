import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SavedArgumentsScreen from '../screens/SavedArgumentsScreen';
import DebatePracticeScreen from '../screens/PracticeModeScreen';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Alert } from 'react-native';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import AuthScreen from '../screens/AuthScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs({ navigation }) {

  const handleLogout = async () => {
    try {
      await signOut(auth);
      //navigation.replace('Auth');
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
            unmountOnBlur: false,        
            freezeOnBlur: false,
        tabBarActiveTintColor: '#1a263f',
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="Practice"
        component={DebatePracticeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mic-outline" color={color} size={size} />
          ),
        }}
      /> */}
      {/* <Tab.Screen
        name="Saved"
        component={SavedArgumentsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" color={color} size={size} />
          ),
        }}
      /> */}
      {/* <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" color={color} size={size} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="Logout"
        component={AuthScreen}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleLogout();
          },
        }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" color={color} size={size} />
          ),
          tabBarLabel: 'Logout',
        }}
      />
    </Tab.Navigator>
  );
}
