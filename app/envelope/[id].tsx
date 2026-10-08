import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getEnvelopesForMonth, EnvelopeWithBalance } from '../../services/envelope-service';
import { getTransactionsForMonth, Transaction, deleteTransaction } from '../../services/transaction-service';
import { getCurrentMonthId, formatDisplayDate } from '../../utils/dates';
import { formatINR } from '../../utils/currency';
import {
  ChevronLeft,
  MoreHorizontal,
  Plus,
  ArrowRightLeft,
  Edit3,
  Trash2,
} from 'lucide-react-native';

export default function EnvelopeDetailScreen() {
  const { id, monthId } = useLocalSearchParams<{ id: string; monthId?: string }>();
  const activeMonthId = monthId || getCurrentMonthId();

  const [envelope, setEnvelope] = useState<EnvelopeWithBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'transactions' | 'subcategories'>('transactions');

  const loadEnvelopeData = async () => {
    if (!id) return;
    try {
      const envs = await getEnvelopesForMonth(activeMonthId);
      const target = envs.find((e) => e.id === id);
      if (target) {
        setEnvelope(target);
      }

      const txs = await getTransactionsForMonth(activeMonthId, { envelopeId: id });
      setTransactions(txs);
    } catch (error) {
      console.error('Error loading envelope detail:', error);
    }
  };

  useEffect(() => {
    loadEnvelopeData();
  }, [id, activeMonthId]);

  const handleDeleteTx = (txId: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? The amount will be restored to your envelope balance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(txId);
            await loadEnvelopeData();
          },
        },
      ]
    );
  };

  if (!envelope) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Envelope not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Group transactions by date
  const groupedTransactions: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    const d = tx.date;
    if (!groupedTransactions[d]) {
      groupedTransactions[d] = [];
    }
    groupedTransactions[d].push(tx);
  }

  const isOverspent = envelope.remaining_amount < 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{envelope.name}</Text>
        <TouchableOpacity
          onPress={() => router.push(`/envelope/edit?id=${envelope.id}`)}
          style={styles.iconBtn}
        >
          <MoreHorizontal size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Envelope Top Card */}
        <View style={styles.summaryCard}>
          <View style={[styles.iconBox, { backgroundColor: `${envelope.color}20` }]}>
            <Text style={styles.iconText}>{envelope.icon || '🏠'}</Text>
          </View>

          <Text style={styles.cardEnvelopeTitle}>{envelope.name}</Text>

          <View style={styles.amountDisplayRow}>
            <Text style={[styles.remainingText, isOverspent && styles.redText]}>
              {formatINR(envelope.remaining_amount)} remaining
            </Text>
            <Text style={styles.allocatedSubtext}>
              {formatINR(envelope.allocated_amount + envelope.carry_over_amount)} allocated
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(envelope.spent_percentage, 100)}%`,
                  backgroundColor: isOverspent ? '#DC2626' : envelope.color || '#0D6847',
                },
              ]}
            />
          </View>
          <Text style={[styles.spentBadge, isOverspent && styles.redText]}>
            {isOverspent ? 'Overspent' : `${envelope.spent_percentage}% spent`}
          </Text>

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push(`/expense/add?envelopeId=${envelope.id}`)}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#E8F5E9' }]}>
                <Plus size={20} color="#0D6847" />
              </View>
              <Text style={styles.actionLabel}>Add Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push(`/income/allocate`)}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#E8F5E9' }]}>
                <Plus size={20} color="#0D6847" />
              </View>
              <Text style={styles.actionLabel}>Add Money</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push(`/envelope/transfer?fromId=${envelope.id}`)}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#E0F2FE' }]}>
                <ArrowRightLeft size={20} color="#0284C7" />
              </View>
              <Text style={styles.actionLabel}>Transfer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push(`/envelope/edit?id=${envelope.id}`)}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#F1F5F9' }]}>
                <Edit3 size={20} color="#475569" />
              </View>
              <Text style={styles.actionLabel}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'transactions' && styles.activeTabBtn]}
            onPress={() => setActiveTab('transactions')}
          >
            <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
              Transactions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'subcategories' && styles.activeTabBtn]}
            onPress={() => setActiveTab('subcategories')}
          >
            <Text style={[styles.tabText, activeTab === 'subcategories' && styles.activeTabText]}>
              Subcategories
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        {activeTab === 'transactions' && (
          <View>
            {Object.keys(groupedTransactions).map((dateKey) => (
              <View key={dateKey} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{formatDisplayDate(dateKey)}</Text>
                {groupedTransactions[dateKey].map((tx) => (
                  <View key={tx.id} style={styles.txRow}>
                    <View style={styles.txLeft}>
                      <View style={styles.txIconBg}>
                        <Text style={styles.txEmoji}>{envelope.icon}</Text>
                      </View>
                      <View style={styles.txInfo}>
                        <Text style={styles.txDesc}>{tx.description}</Text>
                        <Text style={styles.txNotes}>{tx.notes || envelope.name}</Text>
                      </View>
                    </View>

                    <View style={styles.txRight}>
                      <Text style={styles.txAmount}>
                        {tx.type === 'TRANSFER'
                          ? tx.envelope_id === envelope.id
                            ? `-${formatINR(tx.amount)}`
                            : `+${formatINR(tx.amount)}`
                          : `₹${(tx.amount / 100).toLocaleString('en-IN')}`}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteTx(tx.id)}
                        style={styles.deleteTxBtn}
                      >
                        <Trash2 size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ))}

            {transactions.length === 0 && (
              <View style={styles.emptyTxBox}>
                <Text style={styles.emptyTxText}>No transactions recorded in this envelope yet.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'subcategories' && (
          <View style={styles.emptyTxBox}>
            <Text style={styles.emptyTxText}>
              Descriptions serve as subcategories (e.g. Rice, Cooking Oil, Detergent).
            </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748B',
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 30,
  },
  cardEnvelopeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  amountDisplayRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  remainingText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0D6847',
  },
  allocatedSubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  redText: {
    color: '#DC2626',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  spentBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionItem: {
    alignItems: 'center',
    gap: 4,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabBtn: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#0D6847',
    fontWeight: '700',
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txEmoji: {
    fontSize: 20,
  },
  txInfo: {
    flex: 1,
  },
  txDesc: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  txNotes: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  deleteTxBtn: {
    padding: 4,
  },
  emptyTxBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  emptyTxText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
});
