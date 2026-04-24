import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../services/api';

const useAppStore = create((set, get) => ({
  user: null,
  token: null,
  isHydrated: false,
  profileData: {
    name: '',
    bloodGroup: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    skills: [],
    phone: '' 
  },
  mockAlerts: [],
  clearedAlertIds: [],

  setTokenAndUser: async (token, user) => {
    const currentProfile = get().profileData;
    set({ 
      token, 
      user, 
      isHydrated: true,
      profileData: { ...currentProfile, phone: user?.phone || currentProfile.phone }
    });
    
    setAuthToken(token);
  },

  updateProfile: async (newData) => {
    const updatedProfile = { ...get().profileData, ...newData };
    set({ profileData: updatedProfile });
    await AsyncStorage.setItem('profileData', JSON.stringify(updatedProfile));
  },

  setMockAlerts: (alerts) => set({ mockAlerts: alerts }),
  
  updateMockAlert: (id, updates) => set((state) => ({
    mockAlerts: state.mockAlerts.map(a => a.id === id ? { ...a, ...updates } : a)
  })),
  
  removeMockAlert: (id) => set((state) => ({
    mockAlerts: state.mockAlerts.filter(a => a.id !== id)
  })),

  clearHistory: (ids) => set((state) => ({
    clearedAlertIds: [...(state.clearedAlertIds || []), ...ids]
  })),

  hydrateStore: async () => {
    try {
      const profile = await AsyncStorage.getItem('profileData');
      if (profile) {
        set({ profileData: JSON.parse(profile) });
      }
    } catch (e) {
      console.error("Failed to load data from storage", e);
    } finally {
      set({ isHydrated: true });
    }
  },

  logout: async () => {
    set({ 
      token: null, 
      user: null, 
      profileData: { name: '', bloodGroup: '', emergencyContactName: '', emergencyContactPhone: '', skills: [], phone: '' } 
    });
    setAuthToken(null);
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('profileData');
  }
}));

export default useAppStore;
