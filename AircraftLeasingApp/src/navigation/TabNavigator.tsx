import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import FleetScreen from '../screens/FleetScreen';
import LLPScreen from '../screens/LLPScreen';
import EnginesScreen from '../screens/EnginesScreen';
import IssuesScreen from '../screens/IssuesScreen';
import UploadScreen from '../screens/UploadScreen';
import { C } from '../theme/colors';

export type TabParamList = {
  Dashboard: undefined;
  Fleet: undefined;
  Engines: undefined;
  LLP: undefined;
  Issues: undefined;
  Upload: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const ICO: Record<string, string> = {
  Dashboard: '\u25A3',
  Fleet: '\u2708',
  Engines: '\u2699',
  LLP: '\u2691',
  Issues: '\u26A0',
  Upload: '\u21E7',
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 17, color: focused ? C.blue : C.t4 }}>
            {ICO[route.name]}
          </Text>
        ),
        tabBarActiveTintColor: C.blue,
        tabBarInactiveTintColor: C.t4,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: -2 },
        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopColor: C.border,
          borderTopWidth: 1,
          paddingTop: 4,
          height: 54,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Fleet" component={FleetScreen} />
      <Tab.Screen name="Engines" component={EnginesScreen} />
      <Tab.Screen name="LLP" component={LLPScreen} />
      <Tab.Screen name="Issues" component={IssuesScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
    </Tab.Navigator>
  );
}
