import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, TextInput, KeyboardAvoidingView, LayoutAnimation, UIManager, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import useAppStore from '../store/appStore';
import api from '../services/api';
import CustomBottomNav from '../components/CustomBottomNav';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProfileScreen({ navigation }) {
  const logout = useAppStore(state => state.logout);
  const profileData = useAppStore(state => state.profileData);
  const updateProfile = useAppStore(state => state.updateProfile);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({ ...profileData });

  useEffect(() => {
    setEditedData({ ...profileData });
  }, [profileData]);

  const handleLogout = () => {
    logout();
  };

  const handleSave = async () => {
    // 1. Instant Feedback
    setIsSaving(true);
    setIsEditing(false);
    
    // 2. Optimistic Sync
    await updateProfile(editedData);

    // 3. Background Persistence
    try {
      await api.patch('/users/me', editedData);
    } catch (e) {
      console.warn("Background Sync Error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSkill = (skill) => {
    // Immediate visual snappiness
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const current = editedData.skills || [];
    const newSkills = current.includes(skill) 
      ? current.filter(s => s !== skill) 
      : [...current, skill];
    setEditedData({ ...editedData, skills: newSkills });
  };

  const SKILLS = [
    { name: 'First Aid', icon: 'briefcase-medical' },
    { name: 'CPR Certified', icon: 'heartbeat' },
    { name: 'Rescue Logistics', icon: 'truck' },
    { name: 'Field Comms', icon: 'walkie-talkie' }
  ];

  const name = editedData.name || "LOGGED IN USER";
  const phone = profileData.phone || "---";
  const bloodGroup = editedData.bloodGroup;
  const contactName = editedData.emergencyContactName || "NONE SET";
  const contactPhone = editedData.emergencyContactPhone || "---";
  const skills = editedData.skills || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Map')}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.logoText}>
           <Text>SOS</Text><Text style={{color: COLORS.primary}}>NETWORK</Text>
        </Text>
        <TouchableOpacity>
          <View style={styles.miniAvatar}>
             <Feather name="user" size={14} color="#ccc" />
          </View>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          
          {/* Main Avatar Section */}
          <View style={styles.avatarSection}>
             <View style={styles.avatarGlowRing}>
                <View style={styles.avatarImagePlaceholder}>
                   <Feather name="user" size={40} color="#fff" />
                </View>
                {isEditing && (
                  <View style={styles.editBadge}>
                     <MaterialCommunityIcons name="camera" size={12} color="#fff" />
                  </View>
                )}
             </View>

             {isEditing ? (
               <TextInput
                 style={styles.editNameInput}
                 value={editedData.name}
                 onChangeText={(t) => setEditedData({...editedData, name: t})}
                 placeholder="NAME"
                 placeholderTextColor="#555"
               />
             ) : (
               <Text style={styles.userName}>{name}</Text>
             )}
             <Text style={styles.userPhone}>{phone}</Text>

             <TouchableOpacity 
               style={styles.editProfileBtn} 
               onPress={() => isEditing ? handleSave() : setIsEditing(true)}
               disabled={isSaving}
             >
                <LinearGradient
                  colors={isEditing ? ['#4ade80', '#166534'] : isSaving ? ['#444', '#222'] : ['#ff3a3a', '#990000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.editProfileGradient}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.editProfileText}>
                      {isEditing ? "SAVE CHANGES" : "EDIT PROFILE"}
                    </Text>
                  )}
                </LinearGradient>
             </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
             <View style={styles.statBox}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>ALERTS RESPONDED</Text>
             </View>
             <View style={styles.statBox}>
                <Text style={styles.statValue}>0.0</Text>
                <Text style={styles.statLabel}>TRUST RATING</Text>
             </View>
          </View>

          {/* Embedded Expertise Panel */}
          <View style={styles.expertisePanel}>
             <View style={styles.panelTitleRow}>
                <Feather name="shield" size={16} color={COLORS.primary} />
                <Text style={styles.panelTitle}>EMERGENCY EXPERTISE</Text>
             </View>
             
             <View style={styles.skillRow}>
                {isEditing ? (
                  SKILLS.map((skill, i) => {
                    const isActive = skills.includes(skill.name);
                    return (
                      <TouchableOpacity 
                        key={i} 
                        style={[styles.skillPill, isActive && styles.skillPillActive]}
                        onPress={() => toggleSkill(skill.name)}
                      >
                        <Text style={[styles.skillText, isActive && styles.skillTextActive]}>
                          {skill.name.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  skills.length > 0 ? skills.map((skill, i) => (
                    <View key={i} style={styles.skillPill}>
                      <Text style={styles.skillText}>{skill.toUpperCase()}</Text>
                    </View>
                  )) : (
                    <Text style={styles.infoMeta}>NO SKILLS VERIFIED</Text>
                  )
                )}
             </View>
          </View>

          {/* Detailed Info Rows */}
          <View style={styles.infoRowBox}>
             <View style={styles.infoIconWrapper}>
                <Ionicons name="location-outline" size={20} color={COLORS.primary} />
             </View>
             <View style={styles.infoTextWrapper}>
                <Text style={styles.infoMeta}>STATUS</Text>
                <Text style={styles.infoPrimary}>ACTIVE RESPONDER</Text>
             </View>
          </View>

          {/* Blood Type */}
          <View style={styles.infoRowBox}>
             <View style={styles.infoIconWrapper}>
                <FontAwesome5 name="briefcase-medical" size={16} color={COLORS.primary} />
             </View>
             <View style={styles.infoTextWrapper}>
                <Text style={styles.infoMeta}>BLOOD TYPE</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.editSubInput}
                    value={editedData.bloodGroup}
                    onChangeText={(t) => setEditedData({...editedData, bloodGroup: t})}
                    placeholder="O+ / B-"
                    placeholderTextColor="#555"
                  />
                ) : (
                  <Text style={styles.infoPrimary}>{bloodGroup ? bloodGroup.toUpperCase() : "---"}</Text>
                )}
             </View>
          </View>

          <View style={styles.infoRowBox}>
             <View style={styles.infoIconWrapper}>
                <MaterialCommunityIcons name="account-group-outline" size={20} color={COLORS.primary} />
             </View>
             <View style={styles.infoTextWrapper}>
                <Text style={styles.infoMeta}>EMERGENCY CONTACT</Text>
                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.editSubInput}
                      value={editedData.emergencyContactName}
                      onChangeText={(t) => setEditedData({...editedData, emergencyContactName: t})}
                      placeholder="CONTACT NAME"
                      placeholderTextColor="#555"
                    />
                    <TextInput
                      style={styles.editSubInput}
                      value={editedData.emergencyContactPhone}
                      onChangeText={(t) => setEditedData({...editedData, emergencyContactPhone: t})}
                      placeholder="PHONE (+91)"
                      placeholderTextColor="#555"
                      keyboardType="phone-pad"
                    />
                  </>
                ) : (
                  <Text style={styles.infoPrimary}>{contactName} • {contactPhone}</Text>
                )}
             </View>
          </View>

          {/* Sign Out */}
          <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
             <Feather name="log-out" size={16} color="#aaa" />
             <Text style={styles.signOutText}>SIGN OUT</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <CustomBottomNav navigation={navigation} activeRoute="Profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  logoText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  miniAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2d3748', justifyContent: 'center', alignItems: 'center' },
  
  content: { paddingHorizontal: 20, paddingBottom: 30 },

  avatarSection: { alignItems: 'center', marginTop: 10, marginBottom: 30 },
  avatarGlowRing: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a0000' },
  avatarImagePlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: COLORS.primary, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.background },
  
  userName: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 16 },
  userPhone: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4, letterSpacing: 1 },

  editNameInput: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 16, borderBottomWidth: 1, borderBottomColor: COLORS.primary, width: '80%', textAlign: 'center' },
  editSubInput: { color: '#fff', fontSize: 14, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#333', marginTop: 4 },

  editProfileBtn: { marginTop: 16, borderRadius: 20, overflow: 'hidden' },
  editProfileGradient: { paddingHorizontal: 24, paddingVertical: 10, minWidth: 160, alignItems: 'center' },
  editProfileText: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { width: '48%', backgroundColor: '#141414', borderRadius: 16, paddingVertical: 20, alignItems: 'center' },
  statValue: { color: COLORS.primary, fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: 'bold', letterSpacing: 1, marginTop: 4 },

  expertisePanel: { backgroundColor: '#141414', borderRadius: 20, padding: 20, marginBottom: 20 },
  panelTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  panelTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', letterSpacing: 0.5, marginLeft: 8 },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skillPill: { backgroundColor: 'rgba(255,26,26,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,26,26,0.3)' },
  skillPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  skillText: { color: COLORS.primary, fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  skillTextActive: { color: '#fff' },

  infoRowBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderRadius: 16, padding: 16, marginBottom: 12 },
  infoIconWrapper: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,26,26,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  infoTextWrapper: { flex: 1 },
  infoMeta: { color: COLORS.textMuted, fontSize: 9, fontWeight: 'bold', letterSpacing: 1, marginBottom: 2 },
  infoPrimary: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  signOutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, marginBottom: 20 },
  signOutText: { color: '#aaa', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginLeft: 8 },
});
