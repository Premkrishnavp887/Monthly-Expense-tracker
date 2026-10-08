import React, { useState, useCallback } from 'react';
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
import { getEnvelopesForMonth, EnvelopeWithBalance } from '../../services/envelope-service';
import { getCurrentMonthId } from '../../utils/dates';
import { EnvelopeCard } from '../../components/EnvelopeCard';
import { Plus } from 'lucide-react-native';

export default function BudgetsScreen() {
  const monthId = getCurrentMonthId();
  const [envelopes, setEnvelopes] = useState<EnvelopeWithBalance[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadEnvelopes = async () => {
    try {
      const list = await getEnvelopesForMonth(monthId);
      setEnvelopes(list);
    } catch (err) {
      console.error('Error loading budgets:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEnvelopes();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEnvelopes();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Envelopes</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/envelope/add')}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D6847" />}
      >
        {envelopes.map((env) => (
          <EnvelopeCard
            key={env.id}
            envelope={env}
            onPress={() => router.push(`/envelope/${env.id}`)}
          />
        ))}

        {envelopes.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No envelopes configured.</Text>
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D6847',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
  },
});
