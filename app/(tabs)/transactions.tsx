import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getTransactionsForMonth, Transaction, TransactionType, deleteTransaction } from '../../services/transaction-service';
import { getMonthSummary } from '../../services/income-service';
import { getCurrentMonthId, formatMonthYear, formatDisplayDate } from '../../utils/dates';
import { formatINR } from '../../utils/currency';
import { Search, Filter, Trash2, ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from 'lucide-react-native';

export default function TransactionsScreen() {
  const monthId = getCurrentMonthId();

  const [activeType, setActiveType] = useState<TransactionType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = async () => {
    try {
      const summary = await getMonthSummary(monthId);
      setTotalSpent(summary.totalSpentPaise);
      setTotalIncome(summary.totalIncomePaise);

      const list = await getTransactionsForMonth(monthId, {
        type: activeType,
        searchQuery,
      });
      setTransactions(list);
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [activeType, searchQuery])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleDelete = (txId: string) => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(txId);
          await loadTransactions();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSearch(!showSearch)}>
            <Search size={20} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Filter size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Optional Search Bar */}
      {showSearch && (
        <View style={styles.searchBarContainer}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search description, envelope..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      )}

      {/* Filter Pills */}
      <View style={styles.filterPillsRow}>
        {(['ALL', 'EXPENSE', 'INCOME'] as const).map((type) => {
          const selected = activeType === type;
          const label = type === 'ALL' ? 'All' : type === 'EXPENSE' ? 'Expense' : 'Income';
          return (
            <TouchableOpacity
              key={type}
              style={[styles.filterPill, selected && styles.selectedFilterPill]}
              onPress={() => setActiveType(type)}
            >
              <Text style={[styles.filterPillText, selected && styles.selectedFilterPillText]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D6847" />}
      >
        {/* Month Summary Banner */}
        <View style={styles.monthBannerRow}>
          <Text style={styles.monthBannerTitle}>{formatMonthYear(monthId)}</Text>
          <View style={styles.bannerStatsRow}>
            <Text style={styles.redSpentText}>-{formatINR(totalSpent)}</Text>
            <Text style={styles.greenIncomeText}>+{formatINR(totalIncome)}</Text>
          </View>
        </View>

        {/* Transactions List */}
        {transactions.map((tx) => {
          const isIncome = tx.type === 'INCOME';
          const isTransfer = tx.type === 'TRANSFER';

          return (
            <View key={tx.id} style={styles.txCard}>
              <View style={styles.txLeft}>
                <View
                  style={[
                    styles.txIconBox,
                    isIncome
                      ? { backgroundColor: '#E8F5E9' }
                      : isTransfer
                      ? { backgroundColor: '#E0F2FE' }
                      : { backgroundColor: '#FEE2E2' },
                  ]}
                >
                  <Text style={styles.txEmoji}>{tx.envelope_icon || '💸'}</Text>
                </View>

                <View style={styles.txInfo}>
                  <Text style={styles.txDesc}>{tx.description}</Text>
                  <Text style={styles.txSubtext}>
                    {tx.envelope_name || 'Income'}
                  </Text>
                </View>
              </View>

              <View style={styles.txRight}>
                <Text
                  style={[
                    styles.txAmount,
                    isIncome ? styles.greenIncomeText : styles.redSpentText,
                  ]}
                >
                  {isIncome ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                </Text>
                <Text style={styles.txDate}>{tx.date.split('-').slice(1).join('/')}</Text>
              </View>

              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(tx.id)}>
                <Trash2 size={16} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
          );
        })}

        {transactions.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No transactions found for this period.</Text>
          </View>
        )}
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
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    padding: 6,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  filterPillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedFilterPill: {
    backgroundColor: '#0D6847',
    borderColor: '#0D6847',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedFilterPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  monthBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  bannerStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  redSpentText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  greenIncomeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D6847',
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txEmoji: {
    fontSize: 22,
  },
  txInfo: {
    flex: 1,
  },
  txDesc: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  txSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  txDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
  },
});
