import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getEnvelopesForMonth, EnvelopeWithBalance } from '../../services/envelope-service';
import { addExpense } from '../../services/transaction-service';
import { getCurrentMonthId, getTodayIsoDate, formatDisplayDate } from '../../utils/dates';
import { parseINRToPaise, formatINR } from '../../utils/currency';
import { OverspendModal } from '../../components/OverspendModal';
import { X, Calendar, Delete } from 'lucide-react-native';

export default function AddExpenseScreen() {
  const { envelopeId } = useLocalSearchParams<{ envelopeId?: string }>();
  const monthId = getCurrentMonthId();

  const [envelopes, setEnvelopes] = useState<EnvelopeWithBalance[]>([]);
  const [selectedEnvId, setSelectedEnvId] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('800');
  const [description, setDescription] = useState<string>('Rice');
  const [dateIso, setDateIso] = useState<string>(getTodayIsoDate());
  const [notes, setNotes] = useState<string>('');

  // Overspending Warning Dialog State
  const [overspendModalVisible, setOverspendModalVisible] = useState(false);
  const [pendingPaise, setPendingPaise] = useState(0);
  const [availablePaise, setAvailablePaise] = useState(0);

  useEffect(() => {
    async function loadData() {
      const list = await getEnvelopesForMonth(monthId);
      setEnvelopes(list);
      if (envelopeId) {
        setSelectedEnvId(envelopeId);
      } else if (list.length > 0) {
        setSelectedEnvId(list[0].id);
      }
    }
    loadData();
  }, [envelopeId]);

  const handleKeyPress = (val: string) => {
    if (val === '.' && amountStr.includes('.')) return;
    setAmountStr((prev) => (prev === '0' ? val : prev + val));
  };

  const handleDelete = () => {
    setAmountStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const executeSaveExpense = async (paise: number) => {
    try {
      await addExpense(monthId, paise, selectedEnvId, description || 'Expense', dateIso, notes);
      router.back();
    } catch (err) {
      console.error('Error saving expense:', err);
      Alert.alert('Error', 'Failed to save expense');
    }
  };

  const handleSaveAttempt = () => {
    const paise = parseINRToPaise(amountStr);
    if (paise <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount.');
      return;
    }
    if (!selectedEnvId) {
      Alert.alert('Select Envelope', 'Please select an envelope for this expense.');
      return;
    }

    const env = envelopes.find((e) => e.id === selectedEnvId);
    const remaining = env ? env.remaining_amount : 0;

    // Overspending check requirement!
    if (paise > remaining) {
      setPendingPaise(paise);
      setAvailablePaise(remaining);
      setOverspendModalVisible(true);
    } else {
      executeSaveExpense(paise);
    }
  };

  const selectedEnv = envelopes.find((e) => e.id === selectedEnvId);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Amount Card */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Amount</Text>
          <View style={styles.amountDisplayCard}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <Text style={styles.amountDisplayText}>{amountStr || '0'}</Text>
          </View>
        </View>

        {/* Envelope Selector */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Envelope</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.envPillRow}>
            {envelopes.map((env) => {
              const selected = env.id === selectedEnvId;
              return (
                <TouchableOpacity
                  key={env.id}
                  style={[styles.envPill, selected && styles.selectedEnvPill]}
                  onPress={() => setSelectedEnvId(env.id)}
                >
                  <Text style={styles.envPillIcon}>{env.icon}</Text>
                  <Text style={[styles.envPillText, selected && styles.selectedEnvPillText]}>
                    {env.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Description Field */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Rice, Groceries"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Date Selector */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Date</Text>
          <View style={styles.dateCard}>
            <Calendar size={18} color="#0D6847" />
            <Text style={styles.dateText}>{formatDisplayDate(dateIso)}</Text>
          </View>
        </View>

        {/* Notes Field */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Notes (optional)</Text>
          <TextInput
            style={[styles.textInput, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add a note..."
            placeholderTextColor="#94A3B8"
            multiline
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAttempt}>
          <Text style={styles.saveBtnText}>Save Expense</Text>
        </TouchableOpacity>

        {/* Numeric Keypad */}
        <View style={styles.keypad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.keypadBtn}
              onPress={() => handleKeyPress(item)}
            >
              <Text style={styles.keypadText}>{item}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.keypadBtn} onPress={handleDelete}>
            <Delete size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Overspending Alert Modal */}
      <OverspendModal
        visible={overspendModalVisible}
        availablePaise={availablePaise}
        expensePaise={pendingPaise}
        onCancel={() => setOverspendModalVisible(false)}
        onContinue={() => {
          setOverspendModalVisible(false);
          executeSaveExpense(pendingPaise);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  amountDisplayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0D6847',
    marginRight: 6,
  },
  amountDisplayText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  envPillRow: {
    flexDirection: 'row',
  },
  envPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    gap: 6,
  },
  selectedEnvPill: {
    backgroundColor: '#0D6847',
  },
  envPillIcon: {
    fontSize: 16,
  },
  envPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  selectedEnvPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesInput: {
    height: 70,
    textAlignVertical: 'top',
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  saveBtn: {
    backgroundColor: '#0D6847',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  keypadBtn: {
    width: '28%',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
});
