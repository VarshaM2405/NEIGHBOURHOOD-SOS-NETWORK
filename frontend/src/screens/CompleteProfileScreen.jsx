import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import api from '../services/api';
import useAppStore from '../store/appStore';

export default function CompleteProfileScreen({ navigation }) {
  const profileData = useAppStore(state => state.profileData);
  const updateProfile = useAppStore(state => state.updateProfile);
  const logout = useAppStore(state => state.logout);

  const [name, setName] = useState(profileData.name || '');
  const [bloodGroup, setBloodGroup] = useState(profileData.bloodGroup || '');
  const [emergencyContactName, setEmergencyContactName] = useState(profileData.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(profileData.emergencyContactPhone || '');
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState(profileData.skills || []);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const SKILLS = [
    { name: 'First Aid', icon: 'briefcase-medical' },
    { name: 'CPR Certified', icon: 'heartbeat' },
    { name: 'Rescue Logistics', icon: 'truck' },
    { name: 'Field Comms', icon: 'walkie-talkie' }
  ];

  const handleFinalize = async () => {
    console.log("[DEBUG] Finalize button pressed");
    if (loading) return;
    setLoading(true);
    try {
      const profileInfo = {
        name: name.trim(),
        bloodGroup,
        emergencyContactName,
        emergencyContactPhone,
        skills: selectedSkills,
      };

      console.log("[DEBUG] Profile Info:", profileInfo);

      if (!profileInfo.name) {
        Alert.alert("System Check Required", "Full Name identification is mandatory.");
        setLoading(false);
        return;
      }

      // STEP 1: Update Local Store Immediately
      console.log("[DEBUG] Updating local store...");
      await updateProfile(profileInfo);
      console.log("[DEBUG] Store updated successfully");

      // STEP 2: Background API attempt (Fire and forget/Non-blocking)
      console.log("[DEBUG] Attempting background API sync...");
      api.patch('/users/me', profileInfo).catch(e => console.warn("API Background Error:", e));

      // STEP 3: Navigate to Map
      console.log("[DEBUG] Triggering navigation to Map...");
      setTimeout(() => {
        navigation.navigate('Map');
      }, 150);

    } catch(e) {
      console.error("[CRITICAL ERROR] handleFinalize failed:", e);
      Alert.alert("Emergency Fallback", "Encountered a terminal error. Local bypass activated.");
      // Force navigation anyway
      setTimeout(() => {
        navigation.navigate('Map');
      }, 300);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.commandHeader}>
          <Feather name="shield" size={16} color={COLORS.primary} />
          <Text style={styles.commandText}>COMMAND CENTER</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Feather name="user" size={16} color="#fff" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Complete{"\n"}Profile</Text>
        <Text style={styles.pageSubtitle}>
          Please provide your verification details to activate full response capabilities. This information is secured and encrypted.
        </Text>

        {/* Identity Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Feather name="user" size={16} color="#ff8b8b" />
            <Text style={styles.panelTitle}>Identity</Text>
          </View>
          <Text style={styles.inputLabel}>FULL NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Johnathan Doe"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.inputLabel}>BLOOD GROUP</Text>
          <TextInput
            style={styles.input}
            placeholder="O+ / B- / AB+"
            placeholderTextColor={COLORS.textMuted}
            value={bloodGroup}
            onChangeText={setBloodGroup}
          />
        </View>

        {/* Emergency Contacts Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <MaterialIcons name="contact-phone" size={16} color="#ff8b8b" />
            <Text style={styles.panelTitle}>Emergency Contacts</Text>
          </View>
          <Text style={styles.inputLabel}>CONTACT NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Jane Doe"
            placeholderTextColor={COLORS.textMuted}
            value={emergencyContactName}
            onChangeText={setEmergencyContactName}
          />
          <Text style={styles.inputLabel}>PHONE NUMBER (+91)</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 00000 00000"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="phone-pad"
            value={emergencyContactPhone}
            onChangeText={setEmergencyContactPhone}
          />
        </View>

        {/* Verified Skills */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Feather name="check-circle" size={16} color="#ff8b8b" />
            <Text style={styles.panelTitle}>Verified Skills</Text>
          </View>
          
          <View style={styles.skillsContainer}>
            {SKILLS.map(skill => {
              const active = selectedSkills.includes(skill.name);
              return (
                <TouchableOpacity 
                  key={skill.name} 
                  style={[styles.skillPill, active && styles.skillPillActive]}
                  onPress={() => toggleSkill(skill.name)}
                >
                  <FontAwesome5 
                    name={skill.icon} 
                    size={14} 
                    color={active ? '#fff' : '#ff8b8b'} 
                  />
                  <Text style={[styles.skillText, active && styles.skillTextActive]}>
                    {skill.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.finalizeBtn} 
          onPress={handleFinalize}
          disabled={loading}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#ff3a3a', '#990000']} // Switched to premium red colors
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.finalizeGradient}
          >
             {loading ? (
               <ActivityIndicator color="#fff" />
             ) : (
               <Text style={styles.finalizeText}>FINALIZE REGISTRATION</Text>
             )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => {
          logout();
        }}>
          <Feather name="arrow-left" size={12} color={COLORS.textSecondary} />
          <Text style={styles.backText}>GO BACK</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16 },
  commandHeader: { flexDirection: 'row', alignItems: 'center' },
  commandText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginLeft: 8 },
  avatarCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1a365d', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2b6cb0' },
  
  scrollContent: { paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 40 },
  pageTitle: { color: '#fff', fontSize: 36, fontWeight: 'bold', lineHeight: 40 },
  pageSubtitle: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 12, marginBottom: 32 },

  panel: { backgroundColor: '#161616', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  panelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  panelTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  
  inputLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#0A0A0A', height: 48, borderRadius: 8, paddingHorizontal: 16, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#222' },

  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  skillPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24 },
  skillPillActive: { backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 8, elevation: 5 },
  skillText: { color: '#aaa', fontSize: 13, fontWeight: '600', marginLeft: 8 },
  skillTextActive: { color: '#fff' },

  finalizeBtn: { height: 56, borderRadius: 12, marginTop: 16, overflow: 'hidden', shadowColor: COLORS.primary, shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  finalizeGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  finalizeText: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },

  backBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  backText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: 'bold', marginLeft: 6, letterSpacing: 1 }
});
