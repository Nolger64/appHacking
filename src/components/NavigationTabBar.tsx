import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActiveScreen } from '../types';
import { THEME } from '../constants/theme';

interface NavigationTabBarProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
}

export const NavigationTabBar: React.FC<NavigationTabBarProps> = ({
  activeScreen,
  onSelectScreen,
}) => {
  const tabs: { key: ActiveScreen; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'home', label: 'Resumen', icon: 'wallet-outline' },
    { key: 'vault', label: 'Bóveda', icon: 'key-outline' },
    { key: 'security', label: 'Seguridad', icon: 'shield-checkmark-outline' },
    { key: 'settings', label: 'Ajustes', icon: 'settings-outline' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeScreen === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onSelectScreen(tab.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
              <Ionicons
                name={tab.icon}
                size={22}
                color={isActive ? THEME.colors.primary : THEME.colors.textMuted}
              />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderSubtle,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  activeTab: {},
  iconWrapper: {
    width: 36,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(0, 240, 168, 0.12)',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  activeTabLabel: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
});
