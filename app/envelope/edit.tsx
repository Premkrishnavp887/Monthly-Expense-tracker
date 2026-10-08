import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getEnvelopesForMonth, updateEnvelope, archiveEnvelope } from '../../services/envelope-service';
import { getCurrentMonthId } from '../../utils/dates';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../../utils/icons';
import { X, CheckSquare, Square, Trash2 } from 'lucide-react-native';

export default function EditEnvelopeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const monthId = getCurrentMonthId();

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏠');
  const [selectedColor, setSelectedColor] = useState('#F4A261');
  const [carryOverEnabled, setCarryOverEnabled] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const list = await getEnvelopesForMonth(monthId);
      const env = list.find((e) => e.id === id);
      if (env) {
        setName(env.name);
        setSelectedIcon(env.icon);
        setSelectedColor(env.color);
        setCarryOverEnabled(env.carry_over_enabled === 1);
      }
    }
    loadData();
  }, [id]);

  const handleUpdate = async () => {
    if (!id || !name.trim()) return;

    try {
      await updateEnvelope(id, name.trim(), selectedIcon, selectedColor, carryOverEnabled);
      router.back();
    } catch (err) {
      console.error('Error updating envelope:', err);
      Alert.alert('Error', 'Failed to update envelope.');
    }
  };

  const handleArchive = () => {
    if (!id) return;
    Alert.alert(
      'Archive Envelope',
      'Archiving will hide this envelope from new expense forms while preserving all historical transaction data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            await archiveEnvelope(id);
            router.navigate('/(tabs)/budgets');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Envelope</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Name */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Envelope Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Icon Picker */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Icon</Text>
          <View style={styles.gridRow}>
            {AVAILABLE_ICONS.map((icon) => {
              const selected = icon === selectedIcon;
              return (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconBtn, selected && styles.selectedIconBtn]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Text style={styles.emojiText}>{icon}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Color Picker */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Color</Text>
          <View style={styles.gridRow}>
            {AVAILABLE_COLORS.map((color) => {
              const selected = color === selectedColor;
              return (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    selected && styles.selectedColorCircle,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              );
            })}
          </View>
        </View>

        {/* Carry Over Toggle */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setCarryOverEnabled(!carryOverEnabled)}
        >
          {carryOverEnabled ? (
            <CheckSquare size={22} color="#0D6847" />
          ) : (
            <Square size={22} color="#94A3B8" />
          )}
          <Text style={styles.checkboxText}>Enable Carry-over for this envelope</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.archiveBtn} onPress={handleArchive}>
          <Trash2 size={18} color="#DC2626" />
          <Text style={styles.archiveBtnText}>Archive Envelope</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIconBtn: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#0D6847',
  },
  emojiText: {
    fontSize: 22,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  selectedColorCircle: {
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  saveBtn: {
    backgroundColor: '#0D6847',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  archiveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  archiveBtnText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
  },
});
