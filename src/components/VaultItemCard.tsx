import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { VaultItem } from '../types';
import { THEME } from '../constants/theme';

interface VaultItemCardProps {
  item: VaultItem;
  onDelete?: (id: string) => void;
}

export const VaultItemCard: React.FC<VaultItemCardProps> = ({ item, onDelete }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const getCategoryDetails = () => {
    switch (item.category) {
      case 'card':
        return {
          icon: 'card-outline' as const,
          label: 'Tarjeta Ejecutiva',
          color: THEME.colors.warning,
        };
      case 'crypto':
        return {
          icon: 'logo-bitcoin' as const,
          label: 'Billetera Fría',
          color: THEME.colors.primary,
        };
      case 'credentials':
        return {
          icon: 'key-outline' as const,
          label: 'Credencial Wire',
          color: THEME.colors.secondary,
        };
      case 'note':
      default:
        return {
          icon: 'document-text-outline' as const,
          label: 'Nota Secreta',
          color: THEME.colors.textSecondary,
        };
    }
  };

  const cat = getCategoryDetails();

  const handleCopy = async () => {
    let payload = '';
    if (item.secretData.pan) {
      payload = `PAN: ${item.secretData.pan} | EXP: ${item.secretData.exp} | CVV: ${item.secretData.cvv}`;
    } else if (item.secretData.seedPhrase) {
      payload = item.secretData.seedPhrase;
    } else if (item.secretData.iban) {
      payload = `IBAN: ${item.secretData.iban} | SWIFT: ${item.secretData.swift}`;
    } else if (item.secretData.notes) {
      payload = item.secretData.notes;
    }

    if (payload) {
      await Clipboard.setStringAsync(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={[styles.categoryBadge, { backgroundColor: `${cat.color}20` }]}>
            <Ionicons name={cat.icon} size={14} color={cat.color} />
            <Text style={[styles.categoryText, { color: cat.color }]}>{cat.label}</Text>
          </View>
          <View style={styles.encryptionPill}>
            <Ionicons name="lock-closed" size={11} color={THEME.colors.primary} />
            <Text style={styles.encryptionPillText}>AES-256</Text>
          </View>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setIsRevealed(!isRevealed)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isRevealed ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={THEME.colors.textSecondary}
            />
          </TouchableOpacity>
          {onDelete && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onDelete(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color={THEME.colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>

      {/* Secret Content */}
      <View style={styles.secretBox}>
        {item.category === 'card' && (
          <View style={styles.cardDataContainer}>
            <Text style={styles.cardPan}>
              {isRevealed
                ? item.secretData.pan
                : '•••• •••• •••• ' + (item.secretData.pan?.slice(-4) || '7741')}
            </Text>
            <View style={styles.cardMetaRow}>
              <View>
                <Text style={styles.metaLabel}>EXP</Text>
                <Text style={styles.metaValue}>{isRevealed ? item.secretData.exp : '••/••'}</Text>
              </View>
              <View>
                <Text style={styles.metaLabel}>CVV</Text>
                <Text style={styles.metaValue}>{isRevealed ? item.secretData.cvv : '•••'}</Text>
              </View>
              <View>
                <Text style={styles.metaLabel}>PIN</Text>
                <Text style={styles.metaValue}>{isRevealed ? item.secretData.pin : '••••'}</Text>
              </View>
            </View>
          </View>
        )}

        {item.category === 'crypto' && (
          <View>
            <Text style={styles.metaLabel}>FRASE SEMILLA (12 PALABRAS)</Text>
            <Text style={styles.secretText}>
              {isRevealed
                ? item.secretData.seedPhrase
                : '••••••••••••••••••••••••••••••••••••••••••••••••••'}
            </Text>
          </View>
        )}

        {item.category === 'credentials' && (
          <View style={styles.credentialsContainer}>
            <View>
              <Text style={styles.metaLabel}>IBAN</Text>
              <Text style={styles.secretText}>
                {isRevealed ? item.secretData.iban : 'CH93 •••• •••• •••• •••• •'}
              </Text>
            </View>
            <View style={styles.cardMetaRow}>
              <View>
                <Text style={styles.metaLabel}>SWIFT</Text>
                <Text style={styles.metaValue}>{isRevealed ? item.secretData.swift : '••••••••'}</Text>
              </View>
              <View>
                <Text style={styles.metaLabel}>TOKEN API</Text>
                <Text style={styles.metaValue}>{isRevealed ? item.secretData.apiKey : '••••••••'}</Text>
              </View>
            </View>
          </View>
        )}

        {item.category === 'note' && (
          <View>
            <Text style={styles.metaLabel}>MEMO CONFIDENCIAL</Text>
            <Text style={styles.secretText}>
              {isRevealed
                ? item.secretData.notes
                : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
            </Text>
          </View>
        )}
      </View>

      {/* Footer Copy Action */}
      <View style={styles.footerRow}>
        <Text style={styles.dateText}>
          Modificado: {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity
          style={[styles.copyButton, copied && styles.copyButtonActive]}
          onPress={handleCopy}
          activeOpacity={0.7}
        >
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={14}
            color={copied ? THEME.colors.textInverse : THEME.colors.primary}
          />
          <Text style={[styles.copyButtonText, copied && styles.copyButtonTextActive]}>
            {copied ? '¡Copiado!' : 'Copiar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  badgeRow: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  encryptionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 240, 168, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 168, 0.25)',
  },
  encryptionPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  topActions: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginBottom: 12,
  },
  secretBox: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    padding: 12,
    marginBottom: 12,
  },
  cardDataContainer: {
    gap: 8,
  },
  cardPan: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: THEME.colors.textPrimary,
    letterSpacing: 1.5,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 24,
    marginTop: 6,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: THEME.colors.textSecondary,
  },
  credentialsContainer: {
    gap: 8,
  },
  secretText: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: THEME.colors.textPrimary,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 240, 168, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 168, 0.3)',
  },
  copyButtonActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  copyButtonTextActive: {
    color: THEME.colors.textInverse,
  },
});
