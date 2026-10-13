import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Keypad } from '../components/Keypad';
import { StorageService } from '../services/storageService';
import { SecurityCheckService } from '../services/securityCheckService';
import { THEME } from '../constants/theme';
import { DEFAULT_PIN } from '../constants/initialData';

interface UnlockScreenProps {
  onUnlockSuccess: (pin: string) => void;
}

export const UnlockScreen: React.FC<UnlockScreenProps> = ({ onUnlockSuccess }) => {
  const [pin, setPin] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleDigitPress = async (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setHasError(false);
    setErrorMessage('');

    if (newPin.length === 4) {
      await verifyPinSubmission(newPin);
    }
  };

  const handleDeletePress = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setHasError(false);
      setErrorMessage('');
    }
  };

  const verifyPinSubmission = async (inputPin: string) => {
    const isValid = await StorageService.verifyPin(inputPin);
    if (isValid) {
      onUnlockSuccess(inputPin);
    } else {
      if (Platform.OS !== 'web') {
        try {
          Vibration.vibrate(200);
        } catch {
          // Fallback if vibration permission is absent on device
        }
      }
      setHasError(true);
      setAttempts(attempts + 1);
      setErrorMessage('Código PIN incorrecto. Acceso denegado.');
      setTimeout(() => {
        setPin('');
      }, 500);
    }
  };

  const handleBiometricPress = async () => {
    const success = await SecurityCheckService.authenticateWithBiometrics();
    if (success) {
      // With biometrics success, unlock using the default PIN
      onUnlockSuccess(DEFAULT_PIN);
    } else {
      setErrorMessage('Autenticación biométrica no reconocida.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top Logo & Branding */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="shield-checkmark" size={32} color={THEME.colors.primary} />
          </View>
          <Text style={styles.appTitle}>AEGIS PRIVATE BANK</Text>
          <Text style={styles.appSubtitle}>Custodia de Activos & Banca Privada</Text>
        </View>

        {/* Status / Instruction */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>Ingresa tu PIN de Seguridad</Text>
          <Text style={styles.instructionDesc}>
            Se requiere el PIN para derivar la clave de descifrado AES
          </Text>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>

        {/* Keypad */}
        <Keypad
          pin={pin}
          onDigitPress={handleDigitPress}
          onDeletePress={handleDeletePress}
          onBiometricPress={handleBiometricPress}
          hasError={hasError}
          showBiometric={true}
        />

        {/* Bottom Security Compliance Notice */}
        <View style={styles.footerNotice}>
          <Ionicons name="shield-checkmark" size={13} color={THEME.colors.primary} />
          <Text style={styles.footerText}>
            Protegido por Aegis Enclave • Cifrado AES-256 en Reposo
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(0, 240, 168, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 168, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  instructionContainer: {
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  instructionDesc: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    color: THEME.colors.danger,
    fontWeight: '600',
    marginTop: 8,
  },
  footerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  footerText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
});
