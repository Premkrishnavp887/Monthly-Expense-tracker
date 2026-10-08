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
} from 'react-native';
import { router } from 'expo-router';
import { addIncome, saveRecurringIncome } from '../../services/income-service';
import { getCurrentMonthId, getTodayIsoDate, formatDisplayDate } from '../../utils/dates';
import { parseINRToPaise } from '../../utils/currency';
import { X, Calendar, CheckSquare, Square } from 'lucide-react-native';

const SOURCES = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];

export default function AddIncomeScreen() {
  const monthId = getCurrentMonthId();

  const [amountStr, setAmountStr] = useState('20000');
  const [selectedSource, setSelectedSource] = useState('Salary');
  const [dateIso, setDateIso] = useState(getTodayIsoDate());
  const [notes, setNotes] = useState('Monthly salary');
  const [isRecurring, setIsRecurring] = useState(true);

  const handleSave = async () => {
    const paise = parseINRToPaise(amountStr);
    if (paise <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid income amount.');
      return;
    }

    try {
      let recId: string | undefined = undefined;

      if (isRecurring) {
        recId = await saveRecurringIncome(selectedSource, paise, 1);
      }

      await addIncome(monthId, paise, selectedSource, dateIso, notes, recId);

      // Offer user to immediately allocate income
      Alert.alert(
        'Income Added',
        'Income saved successfully! Would you like to allocate it to your envelopes now?',
        [
          { text: 'Later', onPress: () => router.back() },
          {
            text: 'Allocate Now',
            onPress: () => {
              router.back();
              setTimeout(() => router.push('/income/allocate'), 100);
            },
          },
        ]
      );
    } catch (err) {
      console.error('Error adding income:', err);
      Alert.alert('Error', 'Failed to add income.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Income</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Amount */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Amount</Text>
          <View style={styles.amountInputCard}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.numericInput}
              value={amountStr}
              onChangeText={setAmountStr}
              keyboardType="numeric"
              placeholder="20,000"
            />
          </View>
        </View>

        {/* Source Pills */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Source</Text>
          <View style={styles.pillsRow}>
            {SOURCES.map((src) => {
              const selected = src === selectedSource;
              return (
                <TouchableOpacity
                  key={src}
                  style={[styles.pill, selected && styles.selectedPill]}
                  onPress={() => setSelectedSource(src)}
                >
                  <Text style={[styles.pillText, selected && styles.selectedPillText]}>
                    {src}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Date</Text>
          <View style={styles.dateCard}>
            <Calendar size={18} color="#0D6847" />
            <Text style={styles.dateText}>{formatDisplayDate(dateIso)}</Text>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Notes (optional)</Text>
          <TextInput
            style={styles.textInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Monthly salary"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Make Recurring Toggle */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setIsRecurring(!isRecurring)}
          activeOpacity={0.7}
        >
          {isRecurring ? (
            <CheckSquare size={22} color="#0D6847" />
          ) : (
            <Square size={22} color="#94A3B8" />
          )}
          <Text style={styles.checkboxLabel}>Make this a monthly recurring income</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Add Income</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  amountInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
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
  numericInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  selectedPill: {
    backgroundColor: '#0D6847',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  selectedPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  saveBtn: {
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
});
