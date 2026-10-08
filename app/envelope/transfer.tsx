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
import { addTransfer } from '../../services/transaction-service';
import { getCurrentMonthId, getTodayIsoDate } from '../../utils/dates';
import { parseINRToPaise, formatINR } from '../../utils/currency';
import { X, ArrowRightLeft } from 'lucide-react-native';

export default function TransferMoneyScreen() {
  const { fromId } = useLocalSearchParams<{ fromId?: string }>();
  const monthId = getCurrentMonthId();

  const [envelopes, setEnvelopes] = useState<EnvelopeWithBalance[]>([]);
  const [fromEnvId, setFromEnvId] = useState<string>('');
  const [toEnvId, setToEnvId] = useState<string>('');
  const [amountStr, setAmountStr] = useState('500');

  useEffect(() => {
    async function loadData() {
      const list = await getEnvelopesForMonth(monthId);
      setEnvelopes(list);

      if (fromId) {
        setFromEnvId(fromId);
        const other = list.find((e) => e.id !== fromId);
        if (other) setToEnvId(other.id);
      } else if (list.length >= 2) {
        setFromEnvId(list[0].id);
        setToEnvId(list[1].id);
      }
    }
    loadData();
  }, [fromId]);

  const handleTransfer = async () => {
    const paise = parseINRToPaise(amountStr);
    if (paise <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid transfer amount.');
      return;
    }
    if (!fromEnvId || !toEnvId || fromEnvId === toEnvId) {
      Alert.alert('Select Envelopes', 'Please select two different envelopes.');
      return;
    }

    try {
      await addTransfer(monthId, paise, fromEnvId, toEnvId, getTodayIsoDate());
      Alert.alert('Transfer Complete', 'Money transferred successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('Transfer error:', err);
      Alert.alert('Error', 'Failed to complete transfer.');
    }
  };

  const fromEnv = envelopes.find((e) => e.id === fromEnvId);
  const toEnv = envelopes.find((e) => e.id === toEnvId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transfer Money</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Amount Card */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Amount</Text>
          <View style={styles.amountInputCard}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.numericInput}
              value={amountStr}
              onChangeText={setAmountStr}
              keyboardType="numeric"
              placeholder="500"
            />
          </View>
        </View>

        {/* From Envelope */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>From Envelope</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
            {envelopes.map((env) => {
              const selected = env.id === fromEnvId;
              return (
                <TouchableOpacity
                  key={env.id}
                  style={[styles.pill, selected && styles.selectedPill]}
                  onPress={() => setFromEnvId(env.id)}
                >
                  <Text style={styles.pillIcon}>{env.icon}</Text>
                  <Text style={[styles.pillText, selected && styles.selectedPillText]}>
                    {env.name} ({formatINR(env.remaining_amount)})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Transfer Icon Divider */}
        <View style={styles.transferDivider}>
          <View style={styles.transferCircle}>
            <ArrowRightLeft size={20} color="#0D6847" />
          </View>
        </View>

        {/* To Envelope */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>To Envelope</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
            {envelopes
              .filter((e) => e.id !== fromEnvId)
              .map((env) => {
                const selected = env.id === toEnvId;
                return (
                  <TouchableOpacity
                    key={env.id}
                    style={[styles.pill, selected && styles.selectedPill]}
                    onPress={() => setToEnvId(env.id)}
                  >
                    <Text style={styles.pillIcon}>{env.icon}</Text>
                    <Text style={[styles.pillText, selected && styles.selectedPillText]}>
                      {env.name} ({formatINR(env.remaining_amount)})
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleTransfer}>
          <Text style={styles.saveBtnText}>Transfer Money</Text>
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
  pillRow: {
    flexDirection: 'row',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    gap: 6,
  },
  selectedPill: {
    backgroundColor: '#0D6847',
  },
  pillIcon: {
    fontSize: 16,
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
  transferDivider: {
    alignItems: 'center',
    marginVertical: 4,
  },
  transferCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#0D6847',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
