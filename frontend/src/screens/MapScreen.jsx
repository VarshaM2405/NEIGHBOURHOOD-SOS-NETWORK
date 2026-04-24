import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import api from '../services/api';
import { getCurrentLocation } from '../services/locationService';
import CustomBottomNav from '../components/CustomBottomNav';
import useAppStore from '../store/appStore';

const { width, height } = Dimensions.get('window');

const customDarkMapStyle = [
  {"elementType": "geometry", "stylers": [{"color": "#212121"}]},
  {"elementType": "labels.icon", "stylers": [{"visibility": "off"}]},
  {"elementType": "labels.text.fill", "stylers": [{"color": "#757575"}]},
  {"elementType": "labels.text.stroke", "stylers": [{"color": "#212121"}]},
  {"featureType": "administrative", "elementType": "geometry", "stylers": [{"color": "#757575"}]},
  {"featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{"color": "#9e9e9e"}]},
  {"featureType": "administrative.land_parcel", "stylers": [{"visibility": "off"}]},
  {"featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{"color": "#bdbdbd"}]},
  {"featureType": "poi", "elementType": "labels.text.fill", "stylers": [{"color": "#757575"}]},
  {"featureType": "poi.park", "elementType": "geometry", "stylers": [{"color": "#181818"}]},
  {"featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{"color": "#616161"}]},
  {"featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{"color": "#1b1b1b"}]},
  {"featureType": "road", "elementType": "geometry.fill", "stylers": [{"color": "#2c2c2c"}]},
  {"featureType": "road", "elementType": "labels.text.fill", "stylers": [{"color": "#8a8a8a"}]},
  {"featureType": "road.arterial", "elementType": "geometry", "stylers": [{"color": "#373737"}]},
  {"featureType": "road.highway", "elementType": "geometry", "stylers": [{"color": "#3c3c3c"}]},
  {"featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{"color": "#4e4e4e"}]},
  {"featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{"color": "#616161"}]},
  {"featureType": "transit", "elementType": "labels.text.fill", "stylers": [{"color": "#757575"}]},
  {"featureType": "water", "elementType": "geometry", "stylers": [{"color": "#000000"}]},
  {"featureType": "water", "elementType": "labels.text.fill", "stylers": [{"color": "#3d3d3d"}]}
];

const getPinColor = (category, status) => {
  if (status === 'resolved') return '#333';
  if (status === 'responding') return '#FF8C00';
  switch (category) {
    case 'Medical': return '#ff3a3a';
    case 'Fire': return '#ff8c00';
    case 'Flood': return '#3182ce';
    default: return COLORS.primary;
  }
};

const getPinIcon = (category) => {
  switch(category) {
    case 'Medical': return 'briefcase-medical'; 
    case 'Fire': return 'fire-alert';
    case 'Flood': return 'house-flood';
    default: return 'alert-circle';
  }
}

export default function MapScreen({ navigation }) {
  const [myLocation, setMyLocation] = useState({ latitude: 12.97, longitude: 77.59 }); 
  const mockAlerts = useAppStore(state => state.mockAlerts);
  const setMockAlerts = useAppStore(state => state.setMockAlerts);
  const clearedAlertIds = useAppStore(state => state.clearedAlertIds);

  const visibleAlerts = (mockAlerts || [])
    .filter(a => !(clearedAlertIds || []).includes(a.id));

  const [envData, setEnvData] = useState({ temp: 28.4, pressure: 1002.1 });

  useEffect(() => {
    let interval;
    const fetchAlerts = async () => {
      // Simulate live sensor fluctuation
      setEnvData(prev => ({
        temp: Number((prev.temp + (Math.random() * 0.2 - 0.1)).toFixed(1)),
        pressure: Number((prev.pressure + (Math.random() * 0.4 - 0.2)).toFixed(1))
      }));

      try {
        const loc = await getCurrentLocation();
        if (loc) {
          setMyLocation({ latitude: loc.lat, longitude: loc.lng });
          try {
            const response = await api.get(`/alerts/nearby?lat=${loc.lat}&lng=${loc.lng}&radius=500000`);
            if (response.data) {
              setMockAlerts(response.data);
            }
          } catch (apiErr) {
            console.warn("API Offline, using tactical mocks");
          }
        }
      } catch (e) {
        console.warn("General Fetch Error", e);
      }
    };

    fetchAlerts();
    interval = setInterval(fetchAlerts, 5000); // 5s pulse

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* MAP */}
      <MapView
        style={styles.map}
        customMapStyle={customDarkMapStyle}
        region={{
          ...myLocation,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        showsUserLocation={false} 
      >
        {/* User Pin */}
        <Marker coordinate={myLocation}>
           <View style={styles.myPinContainer}>
             <View style={styles.myPinRing}>
               <View style={styles.myPinCore} />
             </View>
             <View style={styles.myPinLabel}><Text style={styles.myPinText}>YOU</Text></View>
           </View>
        </Marker>

        {/* Remote Alerts Pins */}
        {visibleAlerts.map((item) => (
          <Marker 
            key={item.id} 
            coordinate={{ latitude: Number(item.lat), longitude: Number(item.lng) }} 
            zIndex={100}
            onPress={() => {
              navigation.navigate('AlertDetail', { alertId: item.id });
            }}
          >
             <TouchableOpacity activeOpacity={0.7} style={[styles.alertPinContainer, { backgroundColor: getPinColor(item.category, item.status) }]}>
                <Feather name={getPinIcon(item.category)} size={14} color="#fff" />
             </TouchableOpacity>
          </Marker>
        ))}
      </MapView>

      {/* HEADER OVERLAY */}
      <SafeAreaView style={styles.headerOverlay} edges={['top']} pointerEvents="box-none">
        <View style={styles.topBar}>
          <View style={styles.commandTitle}>
            <Feather name="shield" size={16} color={COLORS.primary} />
            <Text style={styles.logoText}>
              SOS<Text style={{color: COLORS.primary}}>NETWORK</Text>
            </Text>
          </View>
          <View style={{ width: 32 }} /> 
        </View>

        {/* Filters Top */}
        <View style={styles.filterRow} pointerEvents="box-none">
          <View style={styles.filterPill}>
             <View style={[styles.filterDot, {backgroundColor: '#3b82f6'}]} />
             <Text style={styles.filterText}>MEDICAL</Text>
          </View>
          <View style={styles.filterPill}>
             <View style={[styles.filterDot, {backgroundColor: '#f97316'}]} />
             <Text style={styles.filterText}>FIRE</Text>
          </View>
          <View style={styles.filterPill}>
             <View style={[styles.filterDot, {backgroundColor: '#06b6d4'}]} />
             <Text style={styles.filterText}>FLOOD</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* BOTTOM INFO PANEL */}
      <View style={styles.bottomOverlay} pointerEvents="box-none">
        <View style={styles.envPanel}>
          <View style={styles.envHeader}>
             <Text style={styles.envLabel}>ENVIRONMENTAL STATUS</Text>
          </View>
          
          <View style={styles.envStats}>
             <View>
               <Text style={styles.envValue}>{envData.temp}°C</Text>
               <Text style={styles.envSub}>THERMAL LOAD</Text>
             </View>
             <View style={{marginLeft: 40}}>
               <Text style={styles.envValue}>{envData.pressure}</Text>
               <Text style={styles.envSub}>MBAR PRESSURE</Text>
             </View>
          </View>
        </View>

        <CustomBottomNav navigation={navigation} activeRoute="Map" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  map: { width: '100%', height: '100%' },

  headerOverlay: { position: 'absolute', top: 0, width: '100%' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: 'rgba(10,10,10,0.8)' },
  commandTitle: { flexDirection: 'row', alignItems: 'center' },
  logoText: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1, marginLeft: 8 },
  
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 10, gap: 10 },
  filterPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(20,20,20,0.85)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  filterDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  filterText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  myPinContainer: { alignItems: 'center', justifyContent: 'center' },
  myPinRing: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,26,26,0.3)', justifyContent: 'center', alignItems: 'center' },
  myPinCore: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.primary },
  myPinLabel: { backgroundColor: '#111', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  myPinText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },

  alertPinContainer: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.8, shadowRadius: 5 },

  bottomOverlay: { position: 'absolute', bottom: 0, width: '100%', pointerEvents: 'box-none' },
  envPanel: { marginHorizontal: 20, backgroundColor: 'rgba(15,15,15,0.95)', borderRadius: 24, padding: 20, paddingBottom: 25, borderWidth: 1, borderColor: '#333', marginBottom: 5 },
  envHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  envLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  highAlertBadge: { backgroundColor: '#3a1015', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#551111' },
  highAlertText: { color: COLORS.primary, fontSize: 9, fontWeight: 'bold' },
  envStats: { flexDirection: 'row' },
  envValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  envSub: { color: COLORS.textMuted, fontSize: 10, letterSpacing: 1, marginTop: 2 },
});
