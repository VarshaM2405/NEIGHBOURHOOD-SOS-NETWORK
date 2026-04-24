import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import useAppStore from './src/store/appStore';
import { ActivityIndicator, View } from 'react-native';

export default function App() {
  const hydrateStore = useAppStore(state => state.hydrateStore);
  const isHydrated = useAppStore(state => state.isHydrated);

  useEffect(() => {
    hydrateStore();
  }, []);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
