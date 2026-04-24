import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, AntDesign, Ionicons } from '@expo/vector-icons';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth, app } from '../services/firebase';
import useAppStore from '../store/appStore';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const setTokenAndUser = useAppStore(state => state.setTokenAndUser);
  const otpInputRef = useRef(null);
  const recaptchaVerifier = useRef(null);

  useEffect(() => {
    if (verificationId && otpInputRef.current) {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 500);
    }
  }, [verificationId]);

  const handleSendOTP = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert('System Error', 'Invalid Terminal Identification Number.');
      return;
    }
    setLoading(true);
    try {
      // PROD BYPASS for Demo (SMS Quota Limit)
      const DEMO_PHONES = ['9991112221', '9991112222', '9991112223'];
      if (DEMO_PHONES.includes(phoneNumber)) {
        setVerificationId("demo-pulse-active");
        Alert.alert('Demo Mode', 'Pulse simulated. Enter code: 112233');
        return;
      }

      const fullPhone = '+91' + phoneNumber; 
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, recaptchaVerifier.current);
      setVerificationId(confirmation);
      Alert.alert('Signal Transmitted', 'Authentication pulse sent to your device.');
    } catch (e) {
      console.error('Firebase Auth Error:', e);
      Alert.alert('Transmission Failure', e.message || 'Terminal offline or invalid ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      Alert.alert('Validation Error', 'Incomplete Authentication Pulse.');
      return;
    }
    setLoading(true);
    try {
      // PROD BYPASS for Demo (SMS Quota Limit)
      const DEMO_PHONES = {
        '9991112221': { name: 'Operative Alpha', id: 'alpha-001' },
        '9991112222': { name: 'Operative Beta', id: 'beta-002' },
        '9991112223': { name: 'Operative Gamma', id: 'gamma-003' }
      };

      if (DEMO_PHONES[phoneNumber] && otp === '112233') {
           console.log("DEMO BYPASS ACTIVE: Authenticating Operative...");
           const demoUser = DEMO_PHONES[phoneNumber];
           const demoToken = `demo-token-${demoUser.id}`;

           // Attempt to fetch existing profile from local server first
           let existingUser = { 
             id: demoUser.id, 
             uid: demoUser.id,
             phone: phoneNumber, 
             name: "" 
           };

           try {
              const response = await api.get('/users/me', { headers: { Authorization: `Bearer ${demoToken}` } });
              if (response.data) {
                existingUser = response.data;
                console.log("Existing Profile Restored:", existingUser.name);
              }
           } catch (e) {
              console.log("New Operative: No existing profile found.");
           }

           await setTokenAndUser(demoToken, existingUser);
           setLoading(false);
           return;
      }

      if (!verificationId) throw new Error("No active pulse found.");
      
      const credential = await verificationId.confirm(otp);
      const idToken = await credential.user.getIdToken();
      
      // Sync with optional Backend or simply use Local Token
      try {
        const response = await api.post('/auth/verify', { idToken, phoneNumber: '+91' + phoneNumber });
        const { user } = response.data;
        await setTokenAndUser(idToken, user);
      } catch (apiError) {
        // Fallback: If no backend, still allow login with Firebase token
        console.warn("API Sync Failed, using Firebase Token direct.");
        await setTokenAndUser(idToken, { id: credential.user.uid, phone: phoneNumber });
      }
    } catch (e) {
      console.error('OTP Verification Error:', e);
      Alert.alert('Access Denied', 'Authentication pulse mismatch or terminal offline.');
    } finally {
      setLoading(false);
    }
  };

  const handleMainAction = () => {
    if (!verificationId) {
      handleSendOTP();
    } else {
      handleVerifyOTP();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Recaptcha Verifier Modal */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleRetries={5}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          
          <View style={styles.topLeftCorner} />
          <View style={styles.bottomRightCorner} />

          <View style={styles.headerRow}>
            <View />
            <View style={styles.livePulsePill}>
              <View style={styles.pulseDot} />
              <Text style={styles.livePulseText}>LIVE PULSE ACTIVE</Text>
            </View>
          </View>

          <View style={styles.logoContainer}>
            <View style={styles.shieldBox}>
              <Feather name="shield" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>NEIGHBOURHOOD SOS</Text>
            <Text style={styles.title}>NETWORK</Text>
            
            <View style={styles.secureAccessPill}>
              <Feather name="lock" size={14} color="#ff6b6b" />
              <Text style={styles.secureText}>SECURE ACCESS</Text>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>TERMINAL IDENTIFICATION</Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeBox}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="(555) 000-0000"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                editable={!verificationId}
                maxLength={10}
              />
              <AntDesign name="idcard" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            </View>

            <View style={styles.otpHeaderRow}>
              <Text style={styles.sectionLabel}>AUTHENTICATION PULSE</Text>
              {verificationId && <Text style={styles.timerText}>PULSE TRANSMITTED</Text>}
            </View>
            
            <TouchableOpacity 
              activeOpacity={1} 
              style={styles.otpBoxesContainer} 
              onPress={() => {
                if (verificationId) {
                  otpInputRef.current?.focus();
                }
              }}
            >
              {[0,1,2,3,4,5].map((index) => (
                <View key={index} style={[styles.otpBox, otp.length === index && verificationId && styles.otpBoxActive]}>
                  <Text style={styles.otpDigit}>{otp[index] || ''}</Text>
                </View>
              ))}
            </TouchableOpacity>
            
            <TextInput
                 ref={otpInputRef}
                 value={otp}
                 onChangeText={setOtp}
                 maxLength={6}
                 keyboardType="number-pad"
                 style={styles.hiddenOtpInput}
                 editable={!!verificationId}
            />

            {verificationId && (
              <TouchableOpacity style={styles.resendBtn} onPress={() => setVerificationId(null)}>
                <Text style={styles.resendText}>RESET TERMINAL</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleMainAction} disabled={loading} style={styles.authorizeBtnContainer}>
              <LinearGradient
                colors={['#ff3333', '#cc0000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.authorizeGradient}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textPrimary} />
                ) : (
                  <>
                    <Ionicons name="flash" size={24} color={COLORS.textPrimary} />
                    <Text style={styles.authorizeText}>
                      {verificationId ? "AUTHORIZE\nCONNECTION" : "REQUEST\nPULSE"}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footerInfo}>
             <Text style={styles.footerWarning}>AUTHORIZED PERSONNEL ONLY. SYSTEM ACTIVITIES ARE</Text>
             <Text style={styles.footerWarning}>MONITORED IN REAL-TIME.</Text>
             <View style={styles.footerLinks}>
               <Text style={styles.footerLinkText}>LEGAL</Text>
               <Text style={styles.footerLinkText}>PRIVACY</Text>
               <Text style={styles.footerLinkText}>SUPPORT</Text>
             </View>
          </View>

        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1, paddingHorizontal: 24, paddingVertical: 16 },
  topLeftCorner: { position: 'absolute', top: 20, left: 20, width: 30, height: 30, borderTopWidth: 2, borderLeftWidth: 2, borderColor: COLORS.border },
  bottomRightCorner: { position: 'absolute', bottom: 20, right: 20, width: 30, height: 30, borderBottomWidth: 2, borderRightWidth: 2, borderColor: COLORS.border },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  livePulsePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.panel, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginRight: 8 },
  livePulseText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  logoContainer: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  shieldBox: { width: 64, height: 64, borderRadius: 16, backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.borderRed, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  secureAccessPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryDim, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 16 },
  secureText: { color: '#ff6b6b', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginLeft: 8 },
  inputSection: { width: '100%' },
  sectionLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  phoneInputContainer: { flexDirection: 'row', height: 56, backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  countryCodeBox: { backgroundColor: COLORS.panel, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: COLORS.border },
  countryCodeText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  phoneInput: { flex: 1, color: COLORS.textPrimary, fontSize: 16, paddingHorizontal: 16, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  inputIcon: { alignSelf: 'center', marginRight: 16 },
  otpHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  timerText: { color: COLORS.textSecondary, fontSize: 10, letterSpacing: 0.5, marginBottom: 8 },
  otpBoxesContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  otpBox: { width: '14%', aspectRatio: 0.8, backgroundColor: COLORS.panel, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  otpBoxActive: { borderColor: COLORS.primary },
  otpDigit: { color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold' },
  hiddenOtpInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  resendBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  resendText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  authorizeBtnContainer: { height: 64, borderRadius: 12, overflow: 'hidden', shadowColor: COLORS.primary, shadowOffset: {width:0, height:0}, shadowOpacity: 0.6, shadowRadius: 10, elevation: 8 },
  authorizeGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  authorizeText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800', letterSpacing: 2, textAlign: 'center', marginLeft: 16 },
  footerInfo: { marginTop: 'auto', alignItems: 'center', marginBottom: 10 },
  footerWarning: { color: COLORS.textMuted, fontSize: 9, letterSpacing: 0.5 },
  footerLinks: { flexDirection: 'row', marginTop: 16, width: '60%', justifyContent: 'space-around' },
  footerLinkText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: 'bold', letterSpacing: 1 }
});
