import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import useAppStore from '../store/appStore';

export default function NoticesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('LIVE');
  const [loading, setLoading] = useState(false);
  const mockAlerts = useAppStore(state => state.mockAlerts);

  const clearedAlertIds = useAppStore(state => state.clearedAlertIds);
  const clearHistory = useAppStore(state => state.clearHistory);

  const displayedAlerts = (mockAlerts || [])
    .filter(a => !(clearedAlertIds || []).includes(a.id))
    .filter(a => activeTab === 'LIVE' ? a.status !== 'resolved' : a.status === 'resolved');

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.radarRing}>
        <MaterialCommunityIcons name="radar" size={40} color="#222" />
      </View>
      <Text style={styles.emptyTitle}>NO {activeTab === 'LIVE' ? 'ACTIVE THREATS' : 'HISTORY'}</Text>
      <Text style={styles.emptySub}>
        {activeTab === 'LIVE' 
          ? 'Your sector is currently secure. Global grid monitoring is active.' 
          : 'No resolved incidents in your history logs.'}
      </Text>
      <TouchableOpacity style={styles.refreshBtn} onPress={() => setLoading(true)}>
        <Text style={styles.refreshText}>RE-SCAN SECTOR</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="arrow-left" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>COMMUNICATION FEED</Text>
        <View style={styles.statusPill}><Text style={styles.statusText}>ENCRYPTED</Text></View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, activeTab === 'LIVE' && styles.activeTab]} onPress={() => setActiveTab('LIVE')}>
          <Text style={[styles.tabText, activeTab === 'LIVE' && styles.activeTabText]}>LIVE FEED</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'HISTORY' && styles.activeTab]} onPress={() => setActiveTab('HISTORY')}>
          <Text style={[styles.tabText, activeTab === 'HISTORY' && styles.activeTabText]}>HISTORY</Text>
        </TouchableOpacity>

        {activeTab === 'HISTORY' && displayedAlerts.length > 0 && (
          <TouchableOpacity 
            style={styles.clearAllBtn} 
            onPress={() => clearHistory(displayedAlerts.map(a => a.id))}
          >
             <Ionicons name="trash-outline" size={14} color="#fff" />
             <Text style={styles.clearAllText}>PURGE HISTORY</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 50 }} />
        ) : displayedAlerts.length === 0 ? (
          renderEmptyState()
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            {displayedAlerts.map((alert) => (
              <TouchableOpacity key={alert.id} style={styles.alertCard} onPress={() => navigation.navigate('AlertDetail', { alertId: alert.id })}>
                <View style={[styles.categoryStrip, { backgroundColor: alert.status === 'resolved' ? '#555' : COLORS.primary }]} />
                <View style={styles.cardInfo}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.categoryText}>{alert.category?.toUpperCase() || 'ALERT'}</Text>
                    <Text style={[styles.timeText, alert.status === 'responding' && {color: COLORS.primary}]}>
                      {alert.posted_at ? alert.posted_at.split(',')[1]?.trim() : (alert.status?.toUpperCase() || 'UNKNOWN')}
                    </Text>
                  </View>
                  <Text style={styles.descriptionText} numberOfLines={1}>{alert.description || `SOS Incident Reported`}</Text>
                  
                  <View style={styles.footerRow}>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-sharp" size={12} color={COLORS.textMuted} />
                      <Text style={styles.locationText}>{alert.address || 'GPS Verified'}</Text>
                    </View>
                    
                    {alert.responder_name && (
                      <View style={styles.responderPill}>
                        <MaterialCommunityIcons name="shield-check" size={12} color={COLORS.primary} style={{marginRight: 4}} />
                        <Text style={styles.responderText}>{alert.responder_name}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#333" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  statusPill: { backgroundColor: '#1a1a1a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#333' },
  statusText: { color: COLORS.textMuted, fontSize: 8, fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 20 },
  tab: { marginRight: 24, paddingBottom: 8 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontSize: 12, fontWeight: 'bold' },
  activeTabText: { color: '#fff' },
  content: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 30 },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderRadius: 12, marginBottom: 12, paddingRight: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#222' },
  categoryStrip: { width: 4, height: '100%' },
  cardInfo: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  categoryText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  timeText: { color: COLORS.textMuted, fontSize: 10 },
  descriptionText: { color: '#fff', fontSize: 14, fontWeight: '500', marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { color: COLORS.textMuted, fontSize: 11, marginLeft: 4 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  responderPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 58, 58, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderLeftWidth: 2, borderLeftColor: COLORS.primary },
  responderText: { color: COLORS.primary, fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  radarRing: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  emptySub: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  refreshText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  clearAllBtn: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', backgroundColor: '#331111', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#551111' },
  clearAllText: { color: COLORS.primary, fontSize: 9, fontWeight: 'bold', marginLeft: 6, letterSpacing: 1 }
});
