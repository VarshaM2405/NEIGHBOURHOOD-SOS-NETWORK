import * as Location from 'expo-location';
import api from './api';

let locationSubscription = null;

export const startLocationTracking = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permission to access location was denied');
      return;
    }

    // Initial push immediately
    let location = await Location.getCurrentPositionAsync({});
    await pushLocationToBackend(location.coords.latitude, location.coords.longitude);

    // Watch position
    if (!locationSubscription) {
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 120000, // 2 minutes
          distanceInterval: 10,  // Or 10 meters, prevents spamming if user is stationary
        },
        (loc) => {
          pushLocationToBackend(loc.coords.latitude, loc.coords.longitude);
        }
      );
    }
  } catch (error) {
    console.warn("Location tracking error", error);
  }
};

export const stopLocationTracking = () => {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
};

const pushLocationToBackend = async (lat, lng) => {
  try {
    await api.patch('/users/location', { lat, lng });
  } catch (error) {
    // network error or backend offline, suppress to avoid spamming logs while disconnected
  }
};

export const getCurrentLocation = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    let location = await Location.getCurrentPositionAsync({});
    return { lat: location.coords.latitude, lng: location.coords.longitude };
  } catch (e) {
    return null;
  }
};
