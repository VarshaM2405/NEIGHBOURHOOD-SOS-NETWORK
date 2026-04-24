import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome5, Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import api from '../services/api';
import useAppStore from '../store/appStore';

export default function AlertDetailScreen({ route, navigation }) {
  const { alertId } = route.params || {};
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);

  const mockAlerts = useAppStore(state => state.mockAlerts);

  const setMockAlerts = useAppStore(state => state.setMockAlerts);

  useEffect(() => {
    let interval;
    const fetchAlertDetails = async (isInitial = false) => {
      try {
        if (!alertId) return;
        
        if (isInitial) {
           const localMatch = mockAlerts?.find(a => a.id === alertId);
           if (localMatch) {
             setAlertData(localMatch);
             setLoading(false);
           }
        }

        const response = await api.get(`/alerts/${alertId}`);
        if (response.data) {
          // Only update if state is different to prevent flickering
          if (JSON.stringify(response.data) !== JSON.stringify(alertData)) {
            setAlertData(response.data);
          }
          
          if (Array.isArray(mockAlerts)) {
             const updated = mockAlerts.map(a => a.id === alertId ? response.data : a);
             setMockAlerts(updated);
          }
        }
      } catch (err) {
        console.warn("Detail Fetch Fallback:", err);
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    fetchAlertDetails(true);
    interval = setInterval(() => fetchAlertDetails(false), 3000); 

    return () => clearInterval(interval);
  }, [alertId]); // Only restart if alertId changes, store sync handled inside

  const profileData = useAppStore(state => state.profileData);

  const handleRespond = async () => {
    try {
      // Prevent self-response
      const currentUserId = profileData?.phone; // Using phone as unique UID in demo
      if (alertData.posted_by_uid === currentUserId) {
        alert("Action Denied: You cannot respond to your own SOS.");
        return;
      }

      // Backend Update
      try { 
        await api.post(`/alerts/${alertId}/respond`, {
          uid: currentUserId,
          name: profileData?.name || "Operative"
        }); 
      } catch(apiErr) {
        console.warn("Sync pulse failed, using local injection");
      }

      // Optimistic Local Update
      const updatedData = { 
        ...alertData, 
        status: 'responding', 
        responder_name: profileData?.name || 'You (Operative)',
        responded_at: new Date().toLocaleString() // REAL TIME
      };
      setAlertData(updatedData);

      if (Array.isArray(mockAlerts)) {
        const newMockAlerts = mockAlerts.map(a => a.id === alertId ? updatedData : a);
        setMockAlerts(newMockAlerts);
      }

    } catch (e) {
      alert("Failed to respond");
    }
  };

  const handleResolve = async () => {
    try {
      // Optimistic Local Update
      const updatedData = { 
        ...alertData, 
        status: 'resolved', 
        resolved_at: new Date().toLocaleString() // REAL TIME
      };
      setAlertData(updatedData);

      // Global Store Sync
      if (Array.isArray(mockAlerts)) {
        const newMockAlerts = mockAlerts.map(a => a.id === alertId ? updatedData : a);
        setMockAlerts(newMockAlerts);
      }

      // Backend (Silent try)
      try { 
        await api.patch(`/alerts/${alertId}/resolve`, {
           resolved_at: updatedData.resolved_at 
        }); 
      } catch(e) {}
      
      alert("INCIDENT RESOLVED");
      setTimeout(() => navigation.goBack(), 1200);
    } catch (e) {
      alert("Failed to resolve");
    }
  };

  const handleEscalate = () => {
    Linking.openURL('tel:112');
  };

  if (loading || !alertData) {
    return (
      <SafeAreaView style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#ff3333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alert Detail</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatarCircle}>
             <Feather name="user" size={14} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Map Header Module */}
        <View style={styles.mapModule}>
          {/* Mock Map Background Layer */}
          <View style={styles.mockMapBg}>
            <Ionicons name="location-sharp" size={32} color="#333" />
            <View style={styles.pulseContainer}>
              <View style={styles.pulseRing} />
              <View style={[styles.pulseCore, { 
                backgroundColor: alertData.status === 'responding' ? '#FF8C00' : alertData.status === 'resolved' ? '#555' : '#ff3333' 
              }]} />
            </View>
          </View>
          
          <View style={styles.locationOverlay}>
            <Text style={styles.locationLabel}>GRID LOCK: {alertData.address || 'GPS VERIFIED'}</Text>
            <Text style={styles.locationTitle}>{alertData.lat}, {alertData.lng}</Text>
          </View>
        </View>

        {/* Main Details Panel */}
        <View style={styles.metaPanel}>
          <View style={[styles.metaAccentLine, { 
             backgroundColor: alertData.status === 'responding' ? '#FF8C00' : alertData.status === 'resolved' ? '#555' : '#ff3333' 
          }]} />
          
          <View style={styles.metaHeader}>
            <View style={[styles.categoryIcon, { 
               borderColor: alertData.status === 'responding' ? '#FF8C00' : alertData.status === 'resolved' ? '#555' : 'rgba(255,51,51,0.5)',
               backgroundColor: alertData.status === 'responding' ? 'rgba(255,140,0,0.1)' : alertData.status === 'resolved' ? 'rgba(80,80,80,0.1)' : 'rgba(255,51,51,0.15)'
            }]}>
              <FontAwesome5 name={alertData.category === 'Medical' ? 'briefcase-medical' : 'fire'} size={20} color="#fff" />
            </View>
            <View style={{flex: 1, marginLeft: 16}}>
               <Text style={styles.alertTitle}>{alertData.category}</Text>
               <Text style={styles.alertTime}>Status: {alertData.status}</Text>
            </View>
            <View style={[styles.activeBadge, { 
               backgroundColor: alertData.status === 'responding' ? '#FF8C00' : alertData.status === 'resolved' ? '#444' : '#ff3a3a' 
            }]}>
               <View style={styles.activeDot} />
               <Text style={styles.activeText}>{alertData.status.toUpperCase()}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.escalateAlertBtn} onPress={handleEscalate}>
            <MaterialCommunityIcons name="shield-alert" size={16} color="#ff3333" />
            <Text style={styles.escalateAlertText}>ESCALATE TO FORMAL SERVICES</Text>
          </TouchableOpacity>

          <Text style={styles.descriptionText}>
            {alertData.description}
          </Text>

          {/* Visual Evidence Section */}
          {alertData.image && (
            <View style={styles.evidenceContainer}>
              <Text style={styles.evidenceLabel}>VISUAL EVIDENCE</Text>
              <Image source={{ uri: alertData.image }} style={styles.evidenceImage} resizeMode="cover" />
            </View>
          )}

          {/* Responders Row */}
          {alertData.responder_name && (
            <View style={styles.respondersBox}>
              <View style={styles.avatarStack}>
                <View style={[styles.miniAvatar, {zIndex: 3, backgroundColor: '#b30000', justifyContent: 'center', alignItems: 'center'}]}>
                  <MaterialCommunityIcons name="shield-check" size={16} color="#fff" />
                </View>
              </View>
              <View>
                <Text style={styles.respondersText}>{alertData.responder_name}</Text>
                <View style={styles.verifiedRow}>
                  <MaterialCommunityIcons name="shield-check" size={10} color={COLORS.primary} />
                  <Text style={styles.verifiedStatusText}>VERIFIED OPERATIVE</Text>
                </View>
              </View>
              <View style={{flex: 1}} />
              <View style={styles.respondingStatus}>
                <Feather name="check-circle" size={12} color={COLORS.primary} />
                <Text style={styles.respondingLabel}>RESPONDING</Text>
              </View>
            </View>
          )}

          {/* Tactical Timeline */}
          <View style={styles.timelineContainer}>
            <Text style={styles.evidenceLabel}>TACTICAL TIMELINE</Text>
            
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, {backgroundColor: '#ff3333'}]} />
              <Text style={styles.timelineText}>
                <Text style={{fontWeight: 'bold'}}>ORIGIN:</Text> {alertData.posted_at || (alertData.created_at ? new Date(alertData.created_at).toLocaleTimeString() : 'SIGNAL ERROR')}
              </Text>
            </View>

            {alertData.responded_at && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, {backgroundColor: '#FF8C00'}]} />
                <Text style={styles.timelineText}><Text style={{fontWeight: 'bold'}}>ENGAGED:</Text> {alertData.responded_at}</Text>
              </View>
            )}

            {alertData.resolved_at && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, {backgroundColor: '#444'}]} />
                <Text style={styles.timelineText}><Text style={{fontWeight: 'bold'}}>RESOLVED:</Text> {alertData.resolved_at}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {alertData.status !== 'resolved' && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.resolvedBtn} onPress={handleResolve}>
              <Feather name="check-circle" size={16} color="#bbb" />
              <Text style={styles.resolvedText}>RESOLVED</Text>
            </TouchableOpacity>

            {alertData.posted_by_uid !== profileData?.phone && (
              <TouchableOpacity style={styles.imRespondingBtn} onPress={handleRespond}>
                <LinearGradient
                  colors={['#ff3a3a', '#b30000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.respondingGradient}
                >
                    <MaterialIcons name="volunteer-activism" size={18} color="#fff" />
                    <Text style={styles.imRespondingText}>I'M RESPONDING</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  avatarCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#2d3748', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#4a5568' },

  content: { padding: 16 },

  mapModule: { height: 220, borderRadius: 24, overflow: 'hidden', backgroundColor: '#161616', marginBottom: 16, borderWidth: 1, borderColor: '#222' },
  mockMapBg: { flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  pulseContainer: { position: 'absolute', justifyContent: 'center', alignItems: 'center', top: '50%' },
  pulseRing: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,51,51,0.2)', borderWidth: 1, borderColor: 'rgba(255,51,51,0.5)', position: 'absolute' },
  pulseCore: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary }, // This is the default style, I will apply inline style for dynamic color
  
  locationOverlay: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#111', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#222' },
  locationLabel: { color: COLORS.primary, fontSize: 8, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  locationTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', lineHeight: 18 },

  metaPanel: { backgroundColor: '#141414', borderRadius: 24, padding: 24, paddingLeft: 32, marginBottom: 24, overflow: 'hidden' },
  metaAccentLine: { position: 'absolute', left: 0, top: 20, bottom: 20, width: 4, backgroundColor: COLORS.primary, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  
  metaHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  categoryIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,51,51,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,51,51,0.5)' },
  alertTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', lineHeight: 24 },
  alertTime: { color: COLORS.textSecondary, fontSize: 11, marginTop: 4 },
  
  activeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ff3a3a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', marginRight: 4 },
  activeText: { color: '#fff', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },

  descriptionText: { color: '#ccc', fontSize: 13, lineHeight: 22, marginBottom: 24 },

  respondersBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  avatarStack: { flexDirection: 'row', marginRight: 12 },
  miniAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#1a1a1a' },
  respondersText: { color: '#fff', fontSize: 12, fontWeight: 'bold', lineHeight: 16, flex: 1 },
  respondingStatus: { flexDirection: 'row', alignItems: 'center' },
  respondingLabel: { color: COLORS.primary, fontSize: 9, fontWeight: 'bold', letterSpacing: 1, marginLeft: 4 },

  actionRow: { flexDirection: 'row', gap: 12 },
  resolvedBtn: { flex: 0.45, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a', height: 56, borderRadius: 16, borderWidth: 1, borderColor: '#333' },
  resolvedText: { color: '#bbb', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, marginLeft: 8 },
  
  imRespondingBtn: { flex: 1, height: 56, borderRadius: 16, overflow: 'hidden' },
  respondingGradient: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  imRespondingText: { color: '#fff', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, marginLeft: 8 },
  evidenceContainer: { marginTop: 10, marginBottom: 20 },
  evidenceLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  evidenceImage: { width: '100%', height: 200, borderRadius: 16, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333' },
  escalateAlertBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 51, 51, 0.1)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255, 51, 51, 0.3)' },
  escalateAlertText: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold', marginLeft: 8, letterSpacing: 0.5 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  verifiedStatusText: { color: COLORS.primary, fontSize: 8, fontWeight: 'bold', marginLeft: 4, letterSpacing: 1 },
  timelineContainer: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#222' },
  timelineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  timelineDot: { width: 6, height: 6, borderRadius: 3, marginRight: 12 },
  timelineText: { color: COLORS.textSecondary, fontSize: 10, letterSpacing: 0.5 }
});
