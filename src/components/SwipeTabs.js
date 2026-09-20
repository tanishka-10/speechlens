// src/components/SwipeTabs.js
import * as React from 'react';
import { View, useWindowDimensions, Text } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import DashboardScreen from '../screens/DashboardScreen';
import PromptGeneratorScreen from '../screens/PromptGeneratorScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const renderScene = SceneMap({
  home: DashboardScreen,
  topics: PromptGeneratorScreen,
  analytics: AnalyticsScreen,
  profile: ProfileScreen,
});

export default function SwipeTabs() {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'home', title: 'Home' },
    { key: 'topics', title: 'Topics' },
    { key: 'analytics', title: 'Analytics' },
    { key: 'profile', title: 'Profile' },
  ]);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: '#1a263f' }}
          style={{ backgroundColor: '#fff' }}
          labelStyle={{ color: 'black' }}
        />
      )}
    />
  );
}
