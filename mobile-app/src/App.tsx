import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

import { AuthProvider } from './contexts/AuthContext';
import { NetworkProvider } from './contexts/NetworkContext';
import { SyncProvider } from './contexts/SyncContext';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import DoseEntryScreen from './screens/DoseEntryScreen';
import WorkersScreen from './screens/WorkersScreen';
import JobsScreen from './screens/JobsScreen';
import AlertsScreen from './screens/AlertsScreen';
import SettingsScreen from './screens/SettingsScreen';

import { LoadingScreen } from './components/LoadingScreen';
import { useAuth } from './hooks/useAuth';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1e3a8a', // Blue-800
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          // Auth screens
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          // Main app screens
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: 'RadRoster Dashboard' }}
            />
            <Stack.Screen
              name="DoseEntry"
              component={DoseEntryScreen}
              options={{ title: 'Log Dose' }}
            />
            <Stack.Screen
              name="Workers"
              component={WorkersScreen}
              options={{ title: 'Workers' }}
            />
            <Stack.Screen
              name="Jobs"
              component={JobsScreen}
              options={{ title: 'Jobs' }}
            />
            <Stack.Screen
              name="Alerts"
              component={AlertsScreen}
              options={{ title: 'Alerts' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      <AuthProvider>
        <NetworkProvider>
          <SyncProvider>
            <AppNavigator />
          </SyncProvider>
        </NetworkProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
