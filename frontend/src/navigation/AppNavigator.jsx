import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NoticesScreen from '../screens/NoticesScreen';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import PostAlertScreen from '../screens/PostAlertScreen';
import AlertDetailScreen from '../screens/AlertDetailScreen';
import useAppStore from '../store/appStore';
import { startLocationTracking, stopLocationTracking } from '../services/locationService';
import { registerForPushNotificationsAsync } from '../services/notificationService';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const token = useAppStore(state => state.token);
  const profileData = useAppStore(state => state.profileData);
  const isProfileComplete = profileData?.name && profileData?.name.trim().length > 0;
  
  // FINAL EMERGENCY DEBUG LOG
  console.log("[NAVIGATOR] Current State:", { 
    token: !!token, 
    profile: profileData?.name ? "DEFINED" : "EMPTY",
    name: profileData?.name,
    isComplete: !!isProfileComplete 
  });

  React.useEffect(() => {
    if (token) {
      // Boot up background services once logged in
      try {
        startLocationTracking();
        registerForPushNotificationsAsync();
      } catch (e) {
        console.warn("Service Initialization Error", e);
      }
    } else {
      stopLocationTracking();
    }
    return () => {
      stopLocationTracking();
    };
  }, [token]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        // Main App Stack
        <Stack.Group screenOptions={{ headerShown: false }}>
          {!isProfileComplete ? (
            <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
          ) : (
            <>
              <Stack.Screen name="Map" component={MapScreen} />
              <Stack.Screen name="Notices" component={NoticesScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </>
          )}
          <Stack.Screen name="PostAlert" component={PostAlertScreen} />
          <Stack.Screen name="AlertDetail" component={AlertDetailScreen} />
        </Stack.Group>
      ) : (
        // Auth Stack
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
