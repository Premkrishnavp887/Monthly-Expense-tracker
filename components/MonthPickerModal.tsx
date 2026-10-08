import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { formatMonthYear, getPrevMonthId, getNextMonthId } from '../utils/dates';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';

interface Props {
  visible: boolean;
  currentMonthId: string;
  onSelectMonth: (monthId: string) => void;
  onClose: () => void;
  availableMonths?: string[];
}

export const MonthPickerModal: React.FC<Props> = ({
  visible,
  currentMonthId,
  onSelectMonth,
  onClose,
}) => {
  const handlePrev = () => {
    onSelectMonth(getPrevMonthId(currentMonthId));
  };

  const handleNext = () => {
    onSelectMonth(getNextMonthId(currentMonthId));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Month</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.pickerRow}>
            <TouchableOpacity onPress={handlePrev} style={styles.arrowBtn}>
              <ChevronLeft size={24} color="#0D6847" />
            </TouchableOpacity>
            
            <Text style={styles.monthText}>{formatMonthYear(currentMonthId)}</Text>
            
            <TouchableOpacity onPress={handleNext} style={styles.arrowBtn}>
              <ChevronRight size={24} color="#0D6847" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  arrowBtn: {
    padding: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D6847',
  },
  doneBtn: {
    backgroundColor: '#0D6847',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
