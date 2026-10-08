import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { createEnvelope } from '../../services/envelope-service';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../../utils/icons';
import { X, CheckSquare, Square } from 'lucide-react-native';

export default function AddEnvelopeScreen() {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🛒');
  const [selectedColor, setSelectedColor] = useState('#2A9D8F');
  const [carryOverEnabled, setCarryOverEnabled] = useState(true);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter an envelope name.');
      return;
    }

    try {
      await createEnvelope(name.trim(), selectedIcon, selectedColor, carryOverEnabled);
      router.back();
    } catch (err) {
      console.error('Error creating envelope:', err);
      Alert.alert('Error', 'Failed to create envelope.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Envelope</Text>
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
            placeholder="e.g. Groceries, Subscriptions"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Icon Picker */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Select Icon</Text>
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
          <Text style={styles.inputLabel}>Select Color</Text>
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

        <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
          <Text style={styles.saveBtnText}>Save Envelope</Text>
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
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
