import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

interface KeypadProps {
  pin: string;
  maxDigits?: number;
  onDigitPress: (digit: string) => void;
  onDeletePress: () => void;
  onBiometricPress?: () => void;
  showBiometric?: boolean;
  hasError?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  pin,
  maxDigits = 4,
  onDigitPress,
  onDeletePress,
  onBiometricPress,
  showBiometric = true,
  hasError = false,
}) => {
  const digits = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['bio', '0', 'del'],
  ];

  return (
    <View style={styles.container}>
      {/* PIN Dots Indicator */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: maxDigits }).map((_, index) => {
          const isFilled = index < pin.length;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                isFilled && styles.dotFilled,
                hasError && styles.dotError,
              ]}
            />
          );
        })}
      </View>

      {/* Numeric Grid */}
      <View style={styles.grid}>
        {digits.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((item) => {
              if (item === 'bio') {
                return (
                  <TouchableOpacity
                    key="bio"
                    style={[styles.keyButton, styles.specialButton]}
                    onPress={onBiometricPress}
                    disabled={!showBiometric}
                    activeOpacity={0.7}
                  >
                    {showBiometric ? (
                      <Ionicons name="finger-print" size={28} color={THEME.colors.primary} />
                    ) : (
                      <View style={{ width: 28 }} />
                    )}
                  </TouchableOpacity>
                );
              }

              if (item === 'del') {
                return (
                  <TouchableOpacity
                    key="del"
                    style={[styles.keyButton, styles.specialButton]}
                    onPress={onDeletePress}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="backspace-outline" size={26} color={THEME.colors.textSecondary} />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={item}
                  style={styles.keyButton}
                  onPress={() => onDigitPress(item)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.digitText}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    marginBottom: 36,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  dotError: {
    backgroundColor: THEME.colors.danger,
    borderColor: THEME.colors.danger,
  },
  grid: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keyButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  digitText: {
    fontSize: 26,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
});
