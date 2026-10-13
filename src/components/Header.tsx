import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightActionIcon?: keyof typeof Ionicons.glyphMap;
  onRightAction?: () => void;
  showLockIcon?: boolean;
  onLockPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  rightActionIcon,
  onRightAction,
  showLockIcon = true,
  onLockPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <View style={styles.brandRow}>
          <Ionicons name="shield-checkmark" size={18} color={THEME.colors.primary} />
          <Text style={styles.brandText}>AEGIS PRIVATE BANK</Text>
        </View>
        <Text style={styles.titleText}>{title}</Text>
        {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
      </View>

      <View style={styles.actionsContainer}>
        {rightActionIcon && onRightAction && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onRightAction}
            activeOpacity={0.7}
          >
            <Ionicons name={rightActionIcon} size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        )}
        {showLockIcon && onLockPress && (
          <TouchableOpacity
            style={[styles.iconButton, styles.lockButton]}
            onPress={onLockPress}
            activeOpacity={0.7}
          >
            <Ionicons name="lock-closed" size={18} color={THEME.colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
    backgroundColor: THEME.colors.background,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
    letterSpacing: 1.2,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  subtitleText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  actionsContainer: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockButton: {
    borderColor: 'rgba(0, 240, 168, 0.3)',
    backgroundColor: 'rgba(0, 240, 168, 0.08)',
  },
});
