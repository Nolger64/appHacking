import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../services/storageService';
import { SecurityCheckService } from '../services/securityCheckService';
import { THEME } from '../constants/theme';
import { DEFAULT_PIN } from '../constants/initialData';

interface SettingsScreenProps {
  userPin: string;
  onLockApp: () => void;
  onPinChanged: (newPin: string) => void;
  onResetData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userPin,
  onLockApp,
  onPinChanged,
  onResetData,
}) => {
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [simulatedRoot, setSimulatedRoot] = useState(
    SecurityCheckService.getSimulatedRoot()
  );

  // Change PIN modal state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');

  const handleToggleBiometrics = async (val: boolean) => {
    setBiometricsEnabled(val);
    await StorageService.setBiometricEnabled(val);
  };

  const handleToggleSimulatedRoot = (val: boolean) => {
    setSimulatedRoot(val);
    SecurityCheckService.setSimulatedRoot(val);
    Alert.alert(
      'Política de Integridad',
      val
        ? 'Detección estricta de privilegios del sistema activada.'
        : 'Modo de compatibilidad estándar activado.'
    );
  };

  const handleChangePin = async () => {
    if (newPinInput.length !== 4 || isNaN(Number(newPinInput))) {
      Alert.alert('Error', 'El nuevo PIN debe tener exactamente 4 dígitos numéricos.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      Alert.alert('Error', 'La confirmación del nuevo PIN no coincide.');
      return;
    }

    const success = await StorageService.changePin(currentPinInput, newPinInput);
    if (success) {
      Alert.alert('PIN Actualizado', 'La bóveda ha sido recifrada con la nueva clave.');
      onPinChanged(newPinInput);
      setIsPinModalOpen(false);
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
    } else {
      Alert.alert('Error', 'El PIN actual ingresado es incorrecto.');
    }
  };

  const handleResetConfirmation = () => {
    Alert.alert(
      'Reiniciar Datos de Fábrica',
      '¿Deseas restaurar la bóveda a los valores iniciales del taller con el PIN por defecto (' +
        DEFAULT_PIN +
        ')?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            await StorageService.factoryReset();
            onResetData();
            Alert.alert('Restaurado', 'Datos iniciales del laboratorio restablecidos.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color={THEME.colors.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Alexander Vance</Text>
          <Text style={styles.profileSub}>alexander.vance@aegispay.ch</Text>
          <View style={styles.securityTag}>
            <Ionicons name="shield-checkmark" size={11} color={THEME.colors.primary} />
            <Text style={styles.securityTagText}>Enclave Seguro Activo</Text>
          </View>
        </View>
      </View>

      {/* Security Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Seguridad & Autenticación</Text>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setIsPinModalOpen(true)}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="keypad-outline" size={18} color={THEME.colors.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Cambiar Código PIN</Text>
              <Text style={styles.settingDesc}>Recifra la base de datos con una nueva clave</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="finger-print-outline" size={18} color={THEME.colors.secondary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Autenticación Biométrica</Text>
              <Text style={styles.settingDesc}>Face ID / Huella digital para desbloqueo</Text>
            </View>
          </View>
          <Switch
            value={biometricsEnabled}
            onValueChange={handleToggleBiometrics}
            trackColor={{ false: THEME.colors.surfaceSubtle, true: THEME.colors.primaryDark }}
            thumbColor={biometricsEnabled ? THEME.colors.primary : THEME.colors.textMuted}
          />
        </View>
      </View>

      {/* Advanced Security Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Integridad & Preferencias Avanzadas</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 240, 168, 0.1)' }]}>
              <Ionicons name="shield-outline" size={18} color={THEME.colors.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Modo Estricto de Integridad del SO</Text>
              <Text style={styles.settingDesc}>
                Verificación reforzada de binarios del sistema y arranque seguro
              </Text>
            </View>
          </View>
          <Switch
            value={simulatedRoot}
            onValueChange={handleToggleSimulatedRoot}
            trackColor={{ false: THEME.colors.surfaceSubtle, true: THEME.colors.primaryDark }}
            thumbColor={simulatedRoot ? THEME.colors.primary : THEME.colors.textMuted}
          />
        </View>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={handleResetConfirmation}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 69, 101, 0.1)' }]}>
              <Ionicons name="refresh-outline" size={18} color={THEME.colors.danger} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: THEME.colors.danger }]}>
                Restablecer Configuración Predeterminada
              </Text>
              <Text style={styles.settingDesc}>Restaura el estado de fábrica de la bóveda</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Immediate Lock Button */}
      <TouchableOpacity style={styles.lockButton} onPress={onLockApp} activeOpacity={0.7}>
        <Ionicons name="lock-closed" size={18} color={THEME.colors.textPrimary} />
        <Text style={styles.lockButtonText}>Bloquear Aplicación Ahora</Text>
      </TouchableOpacity>

      {/* Build Info */}
      <View style={styles.buildInfoBox}>
        <Text style={styles.buildText}>AegisPay Private Banking Mobile v2.4.0</Text>
        <Text style={styles.buildTextSub}>Compilación: 2026.10-PROD-RELEASE-CH</Text>
      </View>

      {/* Change PIN Modal */}
      <Modal visible={isPinModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambiar Código PIN</Text>
              <TouchableOpacity onPress={() => setIsPinModalOpen(false)}>
                <Ionicons name="close" size={24} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>PIN Actual (4 dígitos)</Text>
            <TextInput
              style={styles.input}
              placeholder="••••"
              placeholderTextColor={THEME.colors.textMuted}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              value={currentPinInput}
              onChangeText={setCurrentPinInput}
            />

            <Text style={styles.inputLabel}>Nuevo PIN (4 dígitos)</Text>
            <TextInput
              style={styles.input}
              placeholder="••••"
              placeholderTextColor={THEME.colors.textMuted}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              value={newPinInput}
              onChangeText={setNewPinInput}
            />

            <Text style={styles.inputLabel}>Confirmar Nuevo PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="••••"
              placeholderTextColor={THEME.colors.textMuted}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              value={confirmPinInput}
              onChangeText={setConfirmPinInput}
            />

            <TouchableOpacity
              style={styles.confirmPinBtn}
              onPress={handleChangePin}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmPinBtnText}>Actualizar y Recifrar Bóveda</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    padding: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 240, 168, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  profileSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 6,
  },
  securityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 240, 168, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  securityTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    padding: 14,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  settingTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  iconBox: {
    flexShrink: 0,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    flexShrink: 1,
  },
  settingDesc: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
    flexShrink: 1,
  },
  lockButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 14,
    marginBottom: 20,
  },
  lockButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  buildInfoBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  buildText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  buildTextSub: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontFamily: 'monospace',
    letterSpacing: 4,
  },
  confirmPinBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmPinBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textInverse,
  },
});
