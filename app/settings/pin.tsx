import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { isPinLockEnabled, setPinCode, disablePinCode } from '../../services/settings-service';
import { ChevronLeft, Lock, Unlock } from 'lucide-react-native';

export default function PinSettingsScreen() {
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinInput, setPinInput] = useState('');

  useEffect(() => {
    async function checkPin() {
      const enabled = await isPinLockEnabled();
      setPinEnabled(enabled);
    }
    checkPin();
  }, []);

  const handleSavePin = async () => {
    if (pinInput.length !== 4 || isNaN(Number(pinInput))) {
      Alert.alert('Invalid PIN', 'Please enter a 4-digit numeric PIN.');
      return;
    }

    try {
      await setPinCode(pinInput);
      setPinEnabled(true);
      Alert.alert('App Lock Enabled', 'Your 4-digit PIN has been set successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save PIN lock.');
    }
  };

  const handleDisablePin = async () => {
    try {
      await disablePinCode();
      setPinEnabled(false);
      setPinInput('');
      Alert.alert('App Lock Disabled', 'Local PIN lock protection has been turned off.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to disable PIN lock.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Lock Protection</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.iconBox, pinEnabled ? styles.enabledBox : styles.disabledBox]}>
          {pinEnabled ? <Lock size={36} color="#0D6847" /> : <Unlock size={36} color="#64748B" />}
        </View>

        <Text style={styles.title}>
          {pinEnabled ? 'App Lock is ACTIVE' : 'Set Local 4-Digit PIN'}
        </Text>
        <Text style={styles.subtitle}>
          Protect your financial data offline when opening the app.
        </Text>

        {!pinEnabled ? (
          <View style={styles.inputCard}>
            <TextInput
              style={styles.pinInput}
              value={pinInput}
              onChangeText={setPinInput}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              placeholder="••••"
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSavePin}>
              <Text style={styles.saveBtnText}>Set PIN Lock</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.disableBtn} onPress={handleDisablePin}>
            <Text style={styles.disableBtnText}>Turn Off PIN Lock</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  enabledBox: {
    backgroundColor: '#E8F5E9',
  },
  disabledBox: {
    backgroundColor: '#F1F5F9',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  inputCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
  },
  pinInput: {
    width: 160,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 12,
    textAlign: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  saveBtn: {
    width: '100%',
    backgroundColor: '#0D6847',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disableBtn: {
    width: '100%',
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disableBtnText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '700',
  },
});
