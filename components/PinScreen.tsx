import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Lock, Delete } from 'lucide-react-native';
import { verifyPinCode } from '../services/settings-service';

interface Props {
  onUnlocked: () => void;
}

export const PinScreen: React.FC<Props> = ({ onUnlocked }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = async (val: string) => {
    if (pin.length < 4) {
      const nextPin = pin + val;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        const isValid = await verifyPinCode(nextPin);
        if (isValid) {
          onUnlocked();
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setError(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.lockIconContainer}>
          <Lock size={32} color="#0D6847" />
        </View>

        <Text style={styles.title}>Envelope Budget</Text>
        <Text style={styles.subtitle}>Enter 4-digit PIN to unlock</Text>

        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                pin.length > idx && styles.dotFilled,
                error && styles.dotError,
              ]}
            />
          ))}
        </View>

        {error && <Text style={styles.errorText}>Incorrect PIN. Try again.</Text>}

        {/* Keypad */}
        <View style={styles.keypad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.keyBtn}
              onPress={() => handleKeyPress(num)}
            >
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.keyBtnEmpty} />
          <TouchableOpacity style={styles.keyBtn} onPress={() => handleKeyPress('0')}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.keyBtn} onPress={handleDelete}>
            <Delete size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D6847',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 60,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 32,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  dotFilled: {
    backgroundColor: '#0D6847',
    borderColor: '#0D6847',
  },
  dotError: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  keyBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyBtnEmpty: {
    width: 72,
    height: 72,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
});
