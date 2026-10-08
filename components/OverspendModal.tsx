import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatINR } from '../utils/currency';
import { AlertTriangle } from 'lucide-react-native';

interface Props {
  visible: boolean;
  availablePaise: number; // current remaining balance in paise
  expensePaise: number;   // expense amount in paise
  onCancel: () => void;
  onContinue: () => void;
}

export const OverspendModal: React.FC<Props> = ({
  visible,
  availablePaise,
  expensePaise,
  onCancel,
  onContinue,
}) => {
  const overspentPaise = expensePaise - availablePaise;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={36} color="#DC2626" />
          </View>

          <Text style={styles.title}>Overspending Warning</Text>
          
          <Text style={styles.message}>
            You're spending <Text style={styles.boldRed}>{formatINR(overspentPaise)}</Text> more than this envelope has available.
          </Text>

          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Available</Text>
              <Text style={styles.summaryValue}>{formatINR(availablePaise)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Expense</Text>
              <Text style={[styles.summaryValue, styles.redText]}>{formatINR(expensePaise)}</Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  boldRed: {
    fontWeight: '700',
    color: '#DC2626',
  },
  summaryBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  redText: {
    color: '#DC2626',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 16,
  },
  continueBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
