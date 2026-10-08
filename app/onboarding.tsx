import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { parseINRToPaise, formatINR } from '../utils/currency';
import { getCurrentMonthId } from '../utils/dates';
import { addIncome, saveAllocationsForMonth, saveRecurringIncome } from '../services/income-service';
import { setOnboardingCompleted } from '../services/settings-service';
import { Wallet, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { DEFAULT_ENVELOPES } from '../utils/icons';

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [incomeInput, setIncomeInput] = useState('20000');
  
  // Default allocation amounts
  const [allocations, setAllocations] = useState<Record<string, string>>({
    household: '4000',
    food: '3000',
    transport: '2000',
    bills: '500',
    personal: '1000',
    miscellaneous: '500',
    savings: '9000',
  });

  const handleFinish = async () => {
    try {
      const monthId = getCurrentMonthId();
      const incomePaise = parseINRToPaise(incomeInput);

      if (incomePaise > 0) {
        // Add monthly income and set up recurring salary template
        await addIncome(monthId, incomePaise, 'Salary', '2026-10-01', 'Monthly Salary');
        await saveRecurringIncome('Salary', incomePaise, 1);
      }

      // Convert allocations to paise
      const paiseAllocations: Record<string, number> = {};
      for (const [id, valStr] of Object.entries(allocations)) {
        paiseAllocations[id] = parseINRToPaise(valStr);
      }

      await saveAllocationsForMonth(monthId, paiseAllocations);
      await setOnboardingCompleted(true);

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Onboarding save error:', error);
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {step === 1 && (
          <View style={styles.stepContainer}>
            <View style={styles.heroBox}>
              <View style={styles.iconCircle}>
                <Wallet size={48} color="#0D6847" />
              </View>
              <Text style={styles.heroTitle}>Welcome to Envelope Budget</Text>
              <Text style={styles.heroSubtitle}>
                Take full control of your money offline. Allocate your income into envelopes and spend with confidence.
              </Text>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(2)}>
              <Text style={styles.primaryBtnText}>Get Started</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeader}>Step 2 of 3</Text>
            <Text style={styles.title}>Monthly Income</Text>
            <Text style={styles.subtitle}>What is your total expected income for this month?</Text>

            <View style={styles.inputCard}>
              <Text style={styles.inputPrefix}>₹</Text>
              <TextInput
                style={styles.numericInput}
                value={incomeInput}
                onChangeText={setIncomeInput}
                keyboardType="numeric"
                placeholder="20,000"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={{ flex: 1 }} />

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(3)}>
              <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeader}>Step 3 of 3</Text>
            <Text style={styles.title}>Set up your envelopes</Text>
            <Text style={styles.subtitle}>Set your monthly envelope allocations:</Text>

            <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
              {DEFAULT_ENVELOPES.map((env) => (
                <View key={env.id} style={styles.envelopeRow}>
                  <View style={styles.envLeft}>
                    <Text style={styles.envIcon}>{env.icon}</Text>
                    <Text style={styles.envName}>{env.name}</Text>
                  </View>
                  <View style={styles.envRight}>
                    <Text style={styles.currencyPrefix}>₹</Text>
                    <TextInput
                      style={styles.envInput}
                      value={allocations[env.id] || ''}
                      onChangeText={(val) =>
                        setAllocations((prev) => ({ ...prev, [env.id]: val }))
                      }
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish}>
              <CheckCircle2 size={20} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Finish Setup</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D6847',
  },
  stepContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 40,
    padding: 24,
  },
  heroBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  stepHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D6847',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputPrefix: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D6847',
    marginRight: 8,
  },
  numericInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollList: {
    flex: 1,
    marginBottom: 16,
  },
  envelopeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  envLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  envIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  envName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  envRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 4,
  },
  envInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 70,
    textAlign: 'right',
  },
  primaryBtn: {
    backgroundColor: '#0D6847',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
