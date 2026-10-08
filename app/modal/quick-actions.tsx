import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MinusCircle, PlusCircle, ArrowRightLeft, X } from 'lucide-react-native';

export default function QuickActionsModal() {
  const navigateTo = (path: string) => {
    router.back();
    setTimeout(() => {
      router.push(path as any);
    }, 100);
  };

  return (
    <Pressable style={styles.overlay} onPress={() => router.back()}>
      <View style={styles.sheetContainer}>
        <View style={styles.sheetHeader}>
          <Text style={styles.title}>Quick Actions</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#FEE2E2' }]}
          onPress={() => navigateTo('/expense/add')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#DC2626' }]}>
            <MinusCircle size={22} color="#FFFFFF" />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.actionTitle}>Add Expense</Text>
            <Text style={styles.actionDesc}>Record daily spending from an envelope</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#E8F5E9' }]}
          onPress={() => navigateTo('/income/add')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#0D6847' }]}>
            <PlusCircle size={22} color="#FFFFFF" />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.actionTitle}>Add Income</Text>
            <Text style={styles.actionDesc}>Record salary or extra funds to allocate</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#E0F2FE' }]}
          onPress={() => navigateTo('/envelope/transfer')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#0284C7' }]}>
            <ArrowRightLeft size={22} color="#FFFFFF" />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.actionTitle}>Transfer Money</Text>
            <Text style={styles.actionDesc}>Move funds between envelopes</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textBox: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 13,
    color: '#475569',
  },
});
