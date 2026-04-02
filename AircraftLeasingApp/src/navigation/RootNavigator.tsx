import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator, { TabParamList } from './TabNavigator';
import CaseDetailScreen from '../screens/CaseDetailScreen';
import { C } from '../theme/colors';
import { T } from '../theme/typography';
import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  CaseDetail: { caseId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: C.bg },
        headerTintColor: C.blue,
        headerTitleStyle: { ...T.h3, color: C.t1 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CaseDetail"
        component={CaseDetailScreen}
        options={({ route }) => ({ title: route.params.caseId })}
      />
    </Stack.Navigator>
  );
}
