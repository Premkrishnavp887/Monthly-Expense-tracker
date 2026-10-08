import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { EnvelopeWithBalance } from '../services/envelope-service';
import { formatINR } from '../utils/currency';
import { ChevronRight } from 'lucide-react-native';

interface Props {
  envelope: EnvelopeWithBalance;
  onPress: () => void;
}

export const EnvelopeCard: React.FC<Props> = ({ envelope, onPress }) => {
  const isOverspent = envelope.remaining_amount < 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.topRow}>
        <View style={styles.leftGroup}>
          <View style={[styles.iconContainer, { backgroundColor: `${envelope.color}20` }]}>
            <Text style={styles.iconText}>{envelope.icon || '✉️'}</Text>
          </View>
          <View style={styles.nameGroup}>
            <Text style={styles.envelopeName}>{envelope.name}</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.remainingText, isOverspent && styles.overspentText]}>
                {formatINR(envelope.remaining_amount)} remaining
              </Text>
              <Text style={styles.allocatedSubtext}>
                {' / '}{formatINR(envelope.allocated_amount + envelope.carry_over_amount)}
              </Text>
            </View>
          </View>
        </View>

        <ChevronRight size={20} color="#94A3B8" />
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(envelope.spent_percentage, 100)}%`,
                backgroundColor: isOverspent ? '#DC2626' : envelope.color || '#0D6847',
              },
            ]}
          />
        </View>
        <Text style={[styles.spentBadgeText, isOverspent && styles.overspentBadgeText]}>
          {isOverspent ? 'Overspent' : `${envelope.spent_percentage}% spent`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 22,
  },
  nameGroup: {
    flex: 1,
  },
  envelopeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D6847',
  },
  allocatedSubtext: {
    fontSize: 14,
    color: '#64748B',
  },
  overspentText: {
    color: '#DC2626',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  spentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  overspentBadgeText: {
    color: '#DC2626',
  },
});
