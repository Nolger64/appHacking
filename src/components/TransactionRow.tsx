import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { THEME } from '../constants/theme';

interface TransactionRowProps {
  transaction: Transaction;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ transaction }) => {
  const isCredit = transaction.type === 'credit';

  const getCategoryIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (transaction.category) {
      case 'transfer':
        return 'swap-horizontal';
      case 'crypto_swap':
        return 'logo-bitcoin';
      case 'investment':
        return 'trending-up';
      case 'card_payment':
      default:
        return 'card-outline';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, isCredit ? styles.creditIcon : styles.debitIcon]}>
        <Ionicons
          name={getCategoryIcon()}
          size={18}
          color={isCredit ? THEME.colors.primary : THEME.colors.warning}
        />
      </View>

      <View style={styles.middleContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {transaction.title}
          </Text>
          {transaction.isConfidential && (
            <View style={styles.confidentialPill}>
              <Ionicons name="lock-closed" size={9} color={THEME.colors.warning} />
              <Text style={styles.confidentialText}>Privado</Text>
            </View>
          )}
        </View>
        <Text style={styles.counterparty} numberOfLines={1}>
          {transaction.counterparty} • {transaction.timestamp}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={[styles.amountText, isCredit ? styles.amountCredit : styles.amountDebit]}>
          {isCredit ? '+' : '-'}${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={styles.currency}>USD</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  creditIcon: {
    backgroundColor: 'rgba(0, 240, 168, 0.1)',
  },
  debitIcon: {
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
  },
  middleContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  confidentialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 184, 0, 0.12)',
  },
  confidentialText: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.warning,
  },
  counterparty: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  amountCredit: {
    color: THEME.colors.primary,
  },
  amountDebit: {
    color: THEME.colors.textPrimary,
  },
  currency: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
});
