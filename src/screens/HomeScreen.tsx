import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AccountSummary, ActiveScreen, Transaction } from '../types';
import { TransactionRow } from '../components/TransactionRow';
import { THEME } from '../constants/theme';

interface HomeScreenProps {
  accountSummary: AccountSummary;
  transactions: Transaction[];
  onNavigate: (screen: ActiveScreen) => void;
  onLockApp: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  accountSummary,
  transactions,
  onNavigate,
  onLockApp,
}) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Banner Profile */}
      <View style={styles.profileRow}>
        <View>
          <Text style={styles.greetingText}>Bienvenido de vuelta,</Text>
          <Text style={styles.holderName}>{accountSummary.holderName}</Text>
        </View>
        <View style={styles.tierBadge}>
          <Ionicons name="sparkles" size={12} color={THEME.colors.warning} />
          <Text style={styles.tierText}>{accountSummary.accountTier}</Text>
        </View>
      </View>

      {/* Main Balance Card (Luxury Dark Gold/Emerald Card) */}
      <View style={styles.balanceCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.balanceLabel}>VALORACIÓN TOTAL DE PORTAFOLIO</Text>
          <View style={styles.encryptedIndicator}>
            <Ionicons name="shield-checkmark" size={12} color={THEME.colors.primary} />
            <Text style={styles.encryptedText}>Bóveda Protegida</Text>
          </View>
        </View>

        <Text style={styles.balanceAmount}>
          ${accountSummary.balanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={styles.accountNumberText}>{accountSummary.accountNumber}</Text>

        <View style={styles.cryptoRow}>
          <View style={styles.cryptoPill}>
            <Ionicons name="logo-bitcoin" size={13} color={THEME.colors.warning} />
            <Text style={styles.cryptoValue}>{accountSummary.btcBalance} BTC</Text>
          </View>
          <View style={styles.cryptoPill}>
            <Ionicons name="logo-usd" size={13} color={THEME.colors.secondary} />
            <Text style={styles.cryptoValue}>${accountSummary.usdcBalance.toLocaleString()} USDC</Text>
          </View>
        </View>
      </View>

      {/* Quick Action Grid */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionCard, styles.actionCardPrimary]}
          onPress={() => onNavigate('vault')}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconBadge}>
            <Ionicons name="key" size={20} color={THEME.colors.primary} />
          </View>
          <Text style={styles.actionTitle}>Bóveda Cifrada</Text>
          <Text style={styles.actionDesc}>Tarjetas & Semillas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.actionCardAudit]}
          onPress={() => onNavigate('security')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(0, 240, 168, 0.15)' }]}>
            <Ionicons name="shield-checkmark" size={20} color={THEME.colors.primary} />
          </View>
          <Text style={styles.actionTitle}>Seguridad</Text>
          <Text style={styles.actionDesc}>Estado del Enclave</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => onNavigate('settings')}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconBadge}>
            <Ionicons name="options-outline" size={20} color={THEME.colors.secondary} />
          </View>
          <Text style={styles.actionTitle}>Ajustes</Text>
          <Text style={styles.actionDesc}>Seguridad Enclave</Text>
        </TouchableOpacity>
      </View>

      {/* Black Titanium Card Preview Graphic */}
      <View style={styles.metalCardPreview}>
        <View style={styles.metalCardHeader}>
          <Text style={styles.metalCardBrand}>AEGIS TITANIUM INFINITE</Text>
          <Ionicons name="wifi-outline" size={20} color={THEME.colors.textMuted} />
        </View>
        <View style={styles.chipRow}>
          <View style={styles.emvChip} />
          <Ionicons name="eye-outline" size={16} color={THEME.colors.textMuted} />
        </View>
        <Text style={styles.metalCardPan}>4532 •••• •••• 7741</Text>
        <View style={styles.metalCardFooter}>
          <View>
            <Text style={styles.metalCardHolderLabel}>TITULAR</Text>
            <Text style={styles.metalCardHolderName}>{accountSummary.holderName.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.metalCardHolderLabel}>VENCE</Text>
            <Text style={styles.metalCardHolderName}>11/30</Text>
          </View>
        </View>
      </View>

      {/* Transactions Section */}
      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
          <View style={styles.confidentialCountBadge}>
            <Ionicons name="lock-closed" size={11} color={THEME.colors.warning} />
            <Text style={styles.confidentialCountText}>Cifradas en caché local</Text>
          </View>
        </View>

        <View style={styles.transactionsList}>
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </View>
      </View>

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
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  holderName: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.warning,
  },
  balanceCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    padding: 22,
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
  },
  encryptedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 240, 168, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  encryptedText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'monospace',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  accountNumberText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: THEME.colors.textMuted,
    marginBottom: 16,
  },
  cryptoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cryptoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cryptoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    fontFamily: 'monospace',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    padding: 14,
  },
  actionCardPrimary: {
    borderColor: 'rgba(0, 240, 168, 0.3)',
  },
  actionCardAudit: {
    borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  actionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 240, 168, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  metalCardPreview: {
    backgroundColor: '#111827',
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  metalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metalCardBrand: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 2,
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  emvChip: {
    width: 36,
    height: 26,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    borderWidth: 1,
    borderColor: '#9CA3AF',
  },
  metalCardPan: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#F3F4F6',
    letterSpacing: 2,
    marginBottom: 16,
  },
  metalCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  metalCardHolderLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 2,
  },
  metalCardHolderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E5E7EB',
    fontFamily: 'monospace',
  },
  transactionsSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  confidentialCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
  },
  confidentialCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.warning,
  },
  transactionsList: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    paddingHorizontal: 16,
  },
});
