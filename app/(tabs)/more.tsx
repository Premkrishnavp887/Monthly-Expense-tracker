import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { isPinLockEnabled } from '../../services/settings-service';
import { exportBackupJSON, importBackupJSON, exportTransactionsCSV } from '../../services/backup-service';
import {
  Moon,
  DollarSign,
  Layers,
  Repeat,
  Lock,
  Download,
  Upload,
  FileSpreadsheet,
  Info,
  ChevronRight,
  PieChart,
} from 'lucide-react-native';

export default function MoreScreen() {
  const [pinEnabled, setPinEnabled] = useState(false);

  useEffect(() => {
    async function checkPin() {
      const enabled = await isPinLockEnabled();
      setPinEnabled(enabled);
    }
    checkPin();
  }, []);

  const handleExportBackup = async () => {
    try {
      const { fileName, jsonContent } = await exportBackupJSON();
      Alert.alert('Backup Generated', `Exported data successfully (${fileName}).\n\nJSON Data snippet:\n${jsonContent.slice(0, 150)}...`);
    } catch (err) {
      console.error('Export backup error:', err);
      Alert.alert('Error', 'Failed to generate backup.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const { fileName, csvContent } = await exportTransactionsCSV();
      Alert.alert('CSV Generated', `Transactions exported to ${fileName}.\n\nCSV snippet:\n${csvContent.slice(0, 150)}...`);
    } catch (err) {
      console.error('Export CSV error:', err);
      Alert.alert('Error', 'Failed to generate CSV export.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More & Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Insights Banner Shortcut */}
        <TouchableOpacity style={styles.insightsCard} onPress={() => router.push('/insights')}>
          <View style={styles.insightsLeft}>
            <View style={styles.insightsIconBox}>
              <PieChart size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.insightsTitle}>Monthly Insights</Text>
              <Text style={styles.insightsSubtitle}>View spending breakdown by envelope</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Section: Appearance */}
        <Text style={styles.sectionHeader}>Appearance</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Moon size={20} color="#475569" />
              <Text style={styles.menuText}>Theme</Text>
            </View>
            <Text style={styles.menuRightText}>Light (System)</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <DollarSign size={20} color="#475569" />
              <Text style={styles.menuText}>Currency</Text>
            </View>
            <Text style={styles.menuRightText}>₹ INR</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Budget */}
        <Text style={styles.sectionHeader}>Budget</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/budgets')}>
            <View style={styles.menuLeft}>
              <Layers size={20} color="#475569" />
              <Text style={styles.menuText}>Default Envelopes</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/income/allocate')}>
            <View style={styles.menuLeft}>
              <Repeat size={20} color="#475569" />
              <Text style={styles.menuText}>Carry-over & Allocations</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Section: Security */}
        <Text style={styles.sectionHeader}>Security</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/pin')}>
            <View style={styles.menuLeft}>
              <Lock size={20} color="#475569" />
              <Text style={styles.menuText}>App Lock PIN</Text>
            </View>
            <Text style={styles.menuRightText}>{pinEnabled ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Data */}
        <Text style={styles.sectionHeader}>Data & Offline Backup</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.menuItem} onPress={handleExportBackup}>
            <View style={styles.menuLeft}>
              <Download size={20} color="#0D6847" />
              <Text style={styles.menuText}>Export Backup (JSON)</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings/backup')}
          >
            <View style={styles.menuLeft}>
              <Upload size={20} color="#0D6847" />
              <Text style={styles.menuText}>Import Backup (JSON)</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleExportCSV}>
            <View style={styles.menuLeft}>
              <FileSpreadsheet size={20} color="#0284C7" />
              <Text style={styles.menuText}>Export Transactions CSV</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Section: About */}
        <Text style={styles.sectionHeader}>About</Text>
        <View style={styles.cardGroup}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Info size={20} color="#475569" />
              <Text style={styles.menuText}>Version</Text>
            </View>
            <Text style={styles.menuRightText}>1.0.0 (100% Offline)</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  insightsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0D6847',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
  },
  insightsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  insightsSubtitle: {
    fontSize: 12,
    color: '#E8F5E9',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuRightText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 48,
  },
});
