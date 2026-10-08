import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { exportBackupJSON, importBackupJSON, exportTransactionsCSV } from '../../services/backup-service';
import { ChevronLeft, Download, Upload, FileSpreadsheet } from 'lucide-react-native';

export default function BackupRestoreScreen() {
  const [jsonInput, setJsonInput] = useState('');

  const handleExportJSON = async () => {
    try {
      const { fileName, jsonContent } = await exportBackupJSON();
      setJsonInput(jsonContent);
      Alert.alert(
        'Export Successful',
        `Generated ${fileName}. Copy the JSON content below to save your backup file.`
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to generate backup.');
    }
  };

  const handleRestoreJSON = async () => {
    if (!jsonInput.trim()) {
      Alert.alert('Empty Data', 'Please paste valid JSON backup text into the field below.');
      return;
    }

    Alert.alert(
      'Confirm Restore',
      'This will replace your current local database with the imported backup file data. Are you sure you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await importBackupJSON(jsonInput.trim());
              Alert.alert('Success', 'Backup restored successfully!', [
                { text: 'OK', onPress: () => router.replace('/(tabs)') },
              ]);
            } catch (err: any) {
              console.error(err);
              Alert.alert('Restore Failed', err.message || 'Invalid backup format.');
            }
          },
        },
      ]
    );
  };

  const handleExportCSV = async () => {
    try {
      const { fileName, csvContent } = await exportTransactionsCSV();
      Alert.alert('Export CSV', `CSV transactions generated successfully (${fileName}).`);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to export CSV.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Backup & Restore</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Export Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Export Local Data</Text>
          <Text style={styles.cardDesc}>
            Generate a full JSON backup of envelopes, income, allocations, transactions, and settings.
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleExportJSON}>
              <Download size={18} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Export JSON</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleExportCSV}>
              <FileSpreadsheet size={18} color="#0D6847" />
              <Text style={styles.secondaryBtnText}>Export CSV</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Restore Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Import & Restore Backup</Text>
          <Text style={styles.cardDesc}>
            Paste your backup JSON text below to restore your financial data.
          </Text>

          <TextInput
            style={styles.textArea}
            value={jsonInput}
            onChangeText={setJsonInput}
            placeholder="Paste backup JSON string here..."
            placeholderTextColor="#94A3B8"
            multiline
          />

          <TouchableOpacity style={styles.restoreBtn} onPress={handleRestoreJSON}>
            <Upload size={18} color="#FFFFFF" />
            <Text style={styles.restoreBtnText}>Restore Data</Text>
          </TouchableOpacity>
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
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D6847',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  secondaryBtnText: {
    color: '#0D6847',
    fontSize: 14,
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    height: 140,
    textAlignVertical: 'top',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  restoreBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
