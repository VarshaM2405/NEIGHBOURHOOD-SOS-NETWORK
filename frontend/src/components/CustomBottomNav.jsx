import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/constants';

const CustomBottomNav = ({ navigation, activeRoute }) => {
  return (
    <View style={styles.navContainer}>
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Notices')}>
          <Ionicons name={activeRoute === 'Notices' ? "notifications" : "notifications-outline"} size={22} color={activeRoute === 'Notices' ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.tabLabel, activeRoute === 'Notices' && styles.activeLabel]}>NOTICES</Text>
        </TouchableOpacity>
        <View style={styles.centerGap} />
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
          <Feather name="user" size={22} color={activeRoute === 'Profile' ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.tabLabel, activeRoute === 'Profile' && styles.activeLabel]}>PROFILE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sosPositioner}>
        <TouchableOpacity style={styles.sosButton} onPress={() => navigation.navigate('PostAlert')} activeOpacity={0.9}>
          <LinearGradient colors={['#ff3a3a', '#a30000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sosGradient}>
            <MaterialCommunityIcons name="broadcast" size={32} color="#fff" />
            <Text style={styles.sosText}>SOS</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: { position: 'relative', height: Platform.OS === 'ios' ? 90 : 70, backgroundColor: 'transparent', justifyContent: 'flex-end' },
  tabBar: { flexDirection: 'row', height: Platform.OS === 'ios' ? 80 : 65, backgroundColor: '#0c0c0c', borderTopWidth: 1, borderTopColor: '#222', paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerGap: { width: 90 },
  tabLabel: { fontSize: 8, fontWeight: 'bold', color: COLORS.textSecondary, marginTop: 4, letterSpacing: 0.5 },
  activeLabel: { color: COLORS.primary },
  sosPositioner: { position: 'absolute', top: -25, alignSelf: 'center', zIndex: 10, alignItems: 'center', justifyContent: 'center', width: 100, height: 100 },
  sosButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#000', padding: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 25, zIndex: 2 },
  sosHalo: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, zIndex: 1 },
  sosGradient: { flex: 1, borderRadius: 36, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  sosText: { color: '#fff', fontSize: 10, fontWeight: '900', marginTop: 2, letterSpacing: 1 },
});

export default CustomBottomNav;
