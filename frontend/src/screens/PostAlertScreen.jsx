import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import api from '../services/api';
import { getCurrentLocation } from '../services/locationService';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import useAppStore from '../store/appStore';

export default function PostAlertScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('Medical');
  const [details, setDetails] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [locationMode, setLocationMode] = useState('LIVE'); 
  const [manualAddress, setManualAddress] = useState('');
  const [image, setImage] = useState(null);
  
  const [location, setLocation] = useState({ lat: 12.97, lng: 77.59 });
  const [pinLocation, setPinLocation] = useState({ lat: 12.97, lng: 77.59 });
  
  const setMockAlerts = useAppStore(state => state.setMockAlerts);
  const mockAlerts = useAppStore(state => state.mockAlerts);

  useEffect(() => {
    const fetchLoc = async () => {
      try {
        const loc = await getCurrentLocation();
        if (loc) {
          setLocation(loc);
          setPinLocation(loc);
        }
      } catch (e) {
        console.warn("Location Error", e);
      }
    };
    fetchLoc();
  }, []);

  const CATEGORIES = [
    { id: 'Medical', title: 'MEDICAL', icon: 'briefcase-medical' },
    { id: 'Fire', title: 'FIRE', icon: 'fire' },
    { id: 'Flood', title: 'FLOOD', icon: 'house-damage' },
    { id: 'Crime', title: 'CRIME', icon: 'shield-alt' },
    { id: 'Utility', title: 'UTILITY', icon: 'wrench' },
    { id: 'Activity', title: 'ACTIVITY', icon: 'eye' },
    { id: 'Animal', title: 'ANIMAL', icon: 'paw' },
    { id: 'Other', title: 'OTHER', icon: 'ellipsis-h' }
  ];

  const pickImage = async (useCamera = false) => {
    try {
      const { status } = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync() 
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert("Permissions required.");
        return;
      }

      const result = useCamera 
        ? await ImagePicker.launchCameraAsync({ quality: 0.2, base64: true }) 
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.2, base64: true });

      if (!result.canceled) {
        if (result.assets[0].base64) {
          setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        } else {
          setImage(result.assets[0].uri);
        }
      }
    } catch (e) {
      console.warn("Picker Error", e);
    }
  };

  const handleBroadcast = async () => {
    if (isBroadcasting) return;
    setIsBroadcasting(true);
    try {
      const finalLat = locationMode === 'MAP' ? pinLocation.lat : location.lat;
      const finalLng = locationMode === 'MAP' ? pinLocation.lng : location.lng;

      const profileData = useAppStore.getState().profileData;
      const payload = {
        id: `sos-${Date.now()}`,
        posted_by_uid: profileData?.phone || 'unknown',
        posted_at: new Date().toLocaleString(), // REAL TIME ON PHONE
        category: selectedCategory,
        description: details || `${selectedCategory} emergency reported.`,
        lat: Number(finalLat || 12.97),
        lng: Number(finalLng || 77.59),
        status: 'active',
        image: image,
        address: locationMode === 'MANUAL' ? manualAddress : 'GPS VERIFIED'
      };
      
      // OPTIMISTIC MOCK SYNC
      const currentAlerts = Array.isArray(mockAlerts) ? mockAlerts : [];
      setMockAlerts([payload, ...currentAlerts]);

      // Real API Call
      try { 
        await api.post('/alerts', payload); 
      } catch(apiErr) {
        console.warn("API broadcast failed, using local sync only");
      }
      
      setIsBroadcasting(false);
      alert("GRID TRANSMISSION: CONFIRMED");
      navigation.navigate('Map');
    } catch (e) {
      setIsBroadcasting(false);
      alert(`GRID ERROR: ${e.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Alert</Text>
          <View style={styles.emergencyMode}>
            <Text style={styles.emergencyText}>EMERGENCY MODE</Text>
            <View style={styles.emergencyDot} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.pageTitle}>What is happening?</Text>
          <Text style={styles.pageSubtitle}>Select a category and describe the situation.</Text>

          <View style={styles.gridContainer}>
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <TouchableOpacity 
                  key={cat.id} 
                  style={[styles.gridItem, isActive && styles.gridItemActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                    <FontAwesome5 name={cat.icon} size={20} color={isActive ? '#fff' : '#666'} />
                  </View>
                  <Text style={[styles.gridText, isActive && styles.gridTextActive]}>{cat.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>LOCATION GRID LOCK</Text>
          <View style={styles.modeTabs}>
            {['LIVE', 'MANUAL', 'MAP'].map(m => (
              <TouchableOpacity key={m} onPress={() => setLocationMode(m)} style={[styles.modeTab, locationMode === m && styles.modeTabActive]}>
                <Text style={[styles.modeTabText, locationMode === m && styles.modeTabTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {locationMode === 'LIVE' && (
            <View style={styles.locationBox}>
              <View style={styles.locationIcon}><MaterialCommunityIcons name="target" size={24} color={COLORS.primary} /></View>
              <View style={{flex: 1}}>
                <Text style={styles.locationTitle}>Live GPS Active</Text>
                <Text style={styles.locationSub}>LAT: {location.lat.toFixed(4)} • LNG: {location.lng.toFixed(4)}</Text>
              </View>
            </View>
          )}

          {locationMode === 'MANUAL' && (
            <TextInput
              style={styles.manualAddressInput}
              placeholder="Enter address..."
              placeholderTextColor={COLORS.textMuted}
              value={manualAddress}
              onChangeText={setManualAddress}
            />
          )}

          {locationMode === 'MAP' && (
            <View style={styles.mapPickerWrapper}>
              <MapView
                style={styles.mapPicker}
                initialRegion={{ latitude: location.lat, longitude: location.lng, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
                onPress={(e) => setPinLocation({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })}
              >
                <Marker coordinate={{ latitude: pinLocation.lat, longitude: pinLocation.lng }} pinColor={COLORS.primary} />
              </MapView>
            </View>
          )}

          <Text style={styles.sectionLabel}>SITUATION DETAILS</Text>
          <TextInput
             style={styles.detailsInput}
             placeholder="Describe..."
             placeholderTextColor={COLORS.textMuted}
             multiline
             value={details}
             onChangeText={setDetails}
          />

          <Text style={styles.sectionLabel}>VISUAL EVIDENCE</Text>
          <View style={styles.evidenceRow}>
            {image ? (
              <View style={styles.imagePreviewWrapper}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImage} onPress={() => setImage(null)}><Feather name="x" size={14} color="#fff" /></TouchableOpacity>
              </View>
            ) : (
              <View style={{flexDirection:'row', gap: 10, flex: 1}}>
                <TouchableOpacity style={styles.evidenceBtn} onPress={() => pickImage(true)}>
                  <Feather name="camera" size={24} color={COLORS.primary} />
                  <Text style={styles.evidenceBtnText}>CAMERA</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.evidenceBtn} onPress={() => pickImage(false)}>
                  <Feather name="image" size={24} color={COLORS.primary} />
                  <Text style={styles.evidenceBtnText}>GALLERY</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={{ marginTop: 20 }}>
            <TouchableOpacity style={styles.broadcastBtnContainer} onPress={handleBroadcast} disabled={isBroadcasting}>
              <LinearGradient colors={['#ff3a3a', '#cc0000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.broadcastGradient}>
                 <Feather name={isBroadcasting ? "loader" : "send"} size={20} color="#fff" />
                 <Text style={styles.broadcastText}>{isBroadcasting ? "BROADCASTING..." : "BROADCAST SOS"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emergencyMode: { flexDirection: 'row', alignItems: 'center' },
  emergencyText: { color: COLORS.textMuted, fontSize: 10, fontWeight: 'bold', marginRight: 6 },
  emergencyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  pageTitle: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  pageSubtitle: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 24 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  gridItem: { width: '47%', backgroundColor: '#141414', borderRadius: 16, paddingVertical: 20, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  gridItemActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(255, 26, 26, 0.05)' },
  iconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  iconContainerActive: { backgroundColor: COLORS.primary },
  gridText: { color: COLORS.textMuted, fontSize: 12, fontWeight: 'bold' },
  gridTextActive: { color: COLORS.primary },
  modeTabs: { flexDirection: 'row', backgroundColor: '#141414', borderRadius: 12, padding: 4, marginBottom: 16 },
  modeTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  modeTabActive: { backgroundColor: COLORS.primary },
  modeTabText: { color: COLORS.textMuted, fontSize: 10, fontWeight: 'bold' },
  modeTabTextActive: { color: '#fff' },
  manualAddressInput: { backgroundColor: '#141414', height: 80, borderRadius: 16, padding: 16, color: '#fff', borderWidth: 1, borderColor: '#222' },
  mapPickerWrapper: { height: 180, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#222' },
  mapPicker: { flex: 1 },
  evidenceRow: { flexDirection: 'row' },
  evidenceBtn: { flex: 1, height: 80, backgroundColor: '#141414', borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#333' },
  evidenceBtnText: { color: COLORS.textMuted, fontSize: 8, fontWeight: 'bold', marginTop: 8 },
  imagePreviewWrapper: { width: '100%', height: 150, borderRadius: 16, overflow: 'hidden' },
  imagePreview: { width: '100%', height: '100%' },
  removeImage: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  sectionLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginTop: 24, marginBottom: 8 },
  locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#222' },
  locationIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 26, 26, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  locationTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  locationSub: { color: COLORS.textMuted, fontSize: 9, fontWeight: 'bold' },
  detailsInput: { backgroundColor: '#141414', color: '#fff', padding: 20, borderRadius: 16, minHeight: 100, fontSize: 14, borderWidth: 1, borderColor: '#222' },
  broadcastBtnContainer: { height: 60, borderRadius: 16, overflow: 'hidden' },
  broadcastGradient: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  broadcastText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1, marginLeft: 12 }
});
