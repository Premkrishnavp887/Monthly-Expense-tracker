import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { getCurrentMonthId, formatMonthYear } from '../../utils/dates';
import { getMonthSummary } from '../../services/income-service';
import { formatINR } from '../../utils/currency';
import { EnvelopeWithBalance } from '../../services/envelope-service';
import { EnvelopeCard } from '../../components/EnvelopeCard';
import { MonthPickerModal } from '../../components/MonthPickerModal';
import { ChevronDown, Calendar, Bell, Plus } from 'lucide-react-native';

export default function DashboardScreen() {
  const [currentMonthId, setCurrentMonthId] = useState(getCurrentMonthId());
  const [summary, setSummary] = useState<any>(null);
  const [envelopes, setEnvelopes] = useState<EnvelopeWithBalance[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const loadDashboardData = async () => {
    try {
      const data = await getMonthSummary(currentMonthId);
      setSummary(data);
      setEnvelopes(data.envelopes || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [currentMonthId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D6847" />}
      >
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.monthSelector} onPress={() => setPickerVisible(true)}>
            <Text style={styles.monthTitle}>{formatMonthYear(currentMonthId)}</Text>
            <ChevronDown size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/insights')}>
              <Calendar size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Bell size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Monthly Income Card */}
        <View style={styles.incomeCard}>
          <View style={styles.incomeHeaderRow}>
            <View>
              <Text style={styles.incomeCardLabel}>Monthly Income</Text>
              <Text style={styles.incomeCardAmount}>
                {formatINR(summary?.totalIncomePaise || 0)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addIncomeBtn}
              onPress={() => router.push('/income/add')}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addIncomeBtnText}>Add Income</Text>
            </TouchableOpacity>
          </View>

          {/* Breakdown Stats */}
          <View style={styles.statsCardContainer}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Allocated</Text>
              <Text style={styles.statValue}>
                {formatINR(summary?.totalAllocatedPaise || 0)}
              </Text>
            </View>

            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={[styles.statValue, styles.spentValueText]}>
                {formatINR(summary?.totalSpentPaise || 0)}
              </Text>
            </View>

            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={[styles.statValue, styles.remainingValueText]}>
                {formatINR(summary?.totalRemainingPaise || 0)}
              </Text>
            </View>
          </View>

          {/* Overall Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(summary?.spentPercentage || 0, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercentageText}>
              {summary?.spentPercentage || 0}% spent
            </Text>
          </View>
        </View>

        {/* Envelopes Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Envelopes</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/budgets')}>
            <Text style={styles.seeAllText}>See all &gt;</Text>
          </TouchableOpacity>
        </View>

        {envelopes.map((env) => (
          <EnvelopeCard
            key={env.id}
            envelope={env}
            onPress={() => router.push({ pathname: '/envelope/[id]', params: { id: env.id, monthId: currentMonthId } } as any)}
          />
        ))}

        {envelopes.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No envelopes configured for this month.</Text>
          </View>
        )}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0D6847',
    marginHorizontal: -16,
    marginTop: -16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: -12,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  incomeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  incomeCardLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  incomeCardAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  addIncomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D6847',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  addIncomeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statsCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  spentValueText: {
    color: '#0F172A',
  },
  remainingValueText: {
    color: '#0D6847',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0D6847',
    borderRadius: 4,
  },
  progressPercentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D6847',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
  },
});
