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
import { router } from 'expo-router';
import {
  getMonthSummary,
  saveAllocationsForMonth,
} from '../../services/income-service';
import { EnvelopeWithBalance } from '../../services/envelope-service';
import { getCurrentMonthId } from '../../utils/dates';
import { parseINRToPaise, formatINR, validateAllocation } from '../../utils/currency';
import { ChevronLeft, Plus, Minus, Wand2 } from 'lucide-react-native';

export default function AllocateIncomeScreen() {
  const monthId = getCurrentMonthId();

  const [totalIncomePaise, setTotalIncomePaise] = useState(0);
  const [envelopes, setEnvelopes] = useState<EnvelopeWithBalance[]>([]);
  const [allocationsInput, setAllocationsInput] = useState<Record<string, string>>({});

  const loadData = async () => {
    try {
      const summary = await getMonthSummary(monthId);
      setTotalIncomePaise(summary.totalIncomePaise);
      setEnvelopes(summary.envelopes);

      const map: Record<string, string> = {};
      for (const env of summary.envelopes) {
        map[env.id] = (env.allocated_amount / 100).toString();
      }
      setAllocationsInput(map);
    } catch (err) {
      console.error('Error loading allocations data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStep = (envId: string, stepRupees: number) => {
    const currentRupees = parseFloat(allocationsInput[envId] || '0') || 0;
    const nextRupees = Math.max(0, currentRupees + stepRupees);
    setAllocationsInput((prev) => ({ ...prev, [envId]: nextRupees.toString() }));
  };

  const handleAutoSplit = () => {
    if (totalIncomePaise <= 0 || envelopes.length === 0) return;

    // Standard auto split matching UI reference:
    // Household 20%, Food 15%, Transport 10%, Bills 2.5%, Personal 5%, Misc 2.5%, Savings 45%
    const weights: Record<string, number> = {
      household: 0.20,
      food: 0.15,
      transport: 0.10,
      bills: 0.025,
      personal: 0.05,
      miscellaneous: 0.025,
      savings: 0.45,
    };

    const nextMap: Record<string, string> = {};
    let allocatedTotal = 0;

    for (const env of envelopes) {
      const weight = weights[env.id] || 1 / envelopes.length;
      const amountRupees = Math.floor((totalIncomePaise / 100) * weight);
      nextMap[env.id] = amountRupees.toString();
      allocatedTotal += amountRupees;
    }

    setAllocationsInput(nextMap);
  };

  const currentPaiseAllocations: Record<string, number> = {};
  for (const [id, str] of Object.entries(allocationsInput)) {
    currentPaiseAllocations[id] = parseINRToPaise(str);
  }

  const { isValid, totalAllocatedPaise, unallocatedPaise } = validateAllocation(
    totalIncomePaise,
    currentPaiseAllocations
  );

  const handleSave = async () => {
    if (!isValid) {
      Alert.alert(
        'Over-allocated Warning',
        `Your allocations exceed available income by ${formatINR(Math.abs(unallocatedPaise))}. Please adjust amounts before saving.`
      );
      return;
    }

    try {
      await saveAllocationsForMonth(monthId, currentPaiseAllocations);
      Alert.alert('Success', 'Allocations saved successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('Error saving allocations:', err);
      Alert.alert('Error', 'Failed to save allocations.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Allocate Income</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerCard}>
          <View>
            <Text style={styles.bannerLabel}>Income to allocate</Text>
            <Text style={styles.bannerAmount}>{formatINR(totalIncomePaise)}</Text>
          </View>

          <TouchableOpacity style={styles.autoSplitBtn} onPress={handleAutoSplit}>
            <Wand2 size={16} color="#0D6847" />
            <Text style={styles.autoSplitBtnText}>Auto Split</Text>
          </TouchableOpacity>
        </View>

        {/* List of Envelope Allocations */}
        {envelopes.map((env) => (
          <View key={env.id} style={styles.envRow}>
            <View style={styles.envLeft}>
              <View style={[styles.iconBox, { backgroundColor: `${env.color}20` }]}>
                <Text style={styles.iconText}>{env.icon}</Text>
              </View>
              <Text style={styles.envName}>{env.name}</Text>
            </View>

            <View style={styles.envRight}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleStep(env.id, -500)}
              >
                <Minus size={16} color="#475569" />
              </TouchableOpacity>

              <View style={styles.inputBox}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  value={allocationsInput[env.id] || '0'}
                  onChangeText={(val) =>
                    setAllocationsInput((prev) => ({ ...prev, [env.id]: val }))
                  }
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleStep(env.id, 500)}
              >
                <Plus size={16} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer Allocation Status Bar */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.footerText}>
            Allocated: <Text style={styles.boldText}>{formatINR(totalAllocatedPaise)}</Text>
          </Text>
          <Text style={[styles.footerText, !isValid && styles.redText]}>
            Unallocated: <Text style={[styles.boldText, !isValid && styles.redText]}>{formatINR(unallocatedPaise)}</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, !isValid && styles.disabledSaveBtn]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Save Allocation</Text>
        </TouchableOpacity>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  bannerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  bannerLabel: {
    fontSize: 13,
    color: '#0D6847',
    fontWeight: '600',
  },
  bannerAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0D6847',
    marginTop: 2,
  },
  autoSplitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  autoSplitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D6847',
  },
  envRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  envLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  envName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  envRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 90,
  },
  currencyPrefix: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 2,
  },
  amountInput: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    padding: 16,
    elevation: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  redText: {
    color: '#DC2626',
  },
  saveBtn: {
    backgroundColor: '#0D6847',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledSaveBtn: {
    backgroundColor: '#94A3B8',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
