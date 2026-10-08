import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { getMonthSummary } from '../../services/income-service';
import { getCurrentMonthId, formatMonthYear } from '../../utils/dates';
import { formatINR } from '../../utils/currency';
import { EnvelopeWithBalance } from '../../services/envelope-service';
import { DonutChart, ChartSegment } from '../../components/DonutChart';
import { MonthPickerModal } from '../../components/MonthPickerModal';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';

export default function InsightsScreen() {
  const [currentMonthId, setCurrentMonthId] = useState(getCurrentMonthId());
  const [summary, setSummary] = useState<any>(null);
  const [envelopes, setEnvelopes] = useState<EnvelopeWithBalance[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);

  const loadData = async () => {
    try {
      const data = await getMonthSummary(currentMonthId);
      setSummary(data);
      setEnvelopes(data.envelopes || []);
    } catch (err) {
      console.error('Error loading insights:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [currentMonthId])
  );

  const totalSpent = summary?.totalSpentPaise || 0;

  // Build Segments for Donut Chart
  const chartSegments: ChartSegment[] = envelopes
    .filter((e) => e.spent_amount > 0)
    .map((e) => ({
      key: e.id,
      name: e.name,
      value: e.spent_amount,
      color: e.color || '#0D6847',
    }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insights</Text>
        <TouchableOpacity
          style={styles.monthPill}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={styles.monthPillText}>{formatMonthYear(currentMonthId)}</Text>
          <ChevronDown size={16} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Text style={[styles.statLabel, { color: '#0D6847' }]}>Total Income</Text>
            <Text style={[styles.statAmount, { color: '#0D6847' }]}>
              {formatINR(summary?.totalIncomePaise || 0)}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.statLabel, { color: '#DC2626' }]}>Total Spent</Text>
            <Text style={[styles.statAmount, { color: '#DC2626' }]}>
              {formatINR(summary?.totalSpentPaise || 0)}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E0F2FE' }]}>
            <Text style={[styles.statLabel, { color: '#0284C7' }]}>Remaining</Text>
            <Text style={[styles.statAmount, { color: '#0284C7' }]}>
              {formatINR(summary?.totalRemainingPaise || 0)}
            </Text>
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Spending by Envelope</Text>

          <DonutChart
            segments={chartSegments}
            totalAmountPaise={totalSpent}
            formattedTotal={formatINR(totalSpent)}
            size={220}
          />

          {/* Envelope Breakdown Legend */}
          <View style={styles.legendList}>
            {envelopes.map((env) => {
              const spent = env.spent_amount;
              const pct = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;

              return (
                <View key={env.id} style={styles.legendRow}>
                  <View style={styles.legendLeft}>
                    <View style={[styles.dot, { backgroundColor: env.color || '#0D6847' }]} />
                    <Text style={styles.envName}>{env.name}</Text>
                  </View>

                  <View style={styles.legendRight}>
                    <Text style={styles.pctText}>{pct}%</Text>
                    <Text style={styles.spentAmountText}>{formatINR(spent)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Month Selector Modal */}
      <MonthPickerModal
        visible={pickerVisible}
        currentMonthId={currentMonthId}
        onSelectMonth={(m) => setCurrentMonthId(m)}
        onClose={() => setPickerVisible(false)}
      />
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
  monthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  monthPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  statAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  legendList: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  envName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pctText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    width: 32,
    textAlign: 'right',
  },
  spentAmountText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    width: 80,
    textAlign: 'right',
  },
});
