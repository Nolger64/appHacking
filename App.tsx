import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  AppState,
  AppStateStatus,
  ActivityIndicator,
  Platform,
  StatusBar as RNStatusBar,
  LogBox,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AccountSummary, ActiveScreen, Transaction, VaultItem } from './src/types';
import {
  INITIAL_ACCOUNT_SUMMARY,
  INITIAL_TRANSACTIONS,
  INITIAL_VAULT_ITEMS,
} from './src/constants/initialData';
import { StorageService } from './src/services/storageService';
import { Header } from './src/components/Header';
import { NavigationTabBar } from './src/components/NavigationTabBar';
import { UnlockScreen } from './src/screens/UnlockScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { VaultScreen } from './src/screens/VaultScreen';
import { SecurityAuditScreen } from './src/screens/SecurityAuditScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { THEME } from './src/constants/theme';

// Ignore transient WebSocket / HMR reconnection warning on physical mobile devices
LogBox.ignoreLogs(['Cannot connect to Expo CLI']);

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');

  // Application Data States
  const [accountSummary, setAccountSummary] = useState<AccountSummary>(INITIAL_ACCOUNT_SUMMARY);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>(INITIAL_VAULT_ITEMS);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    async function bootstrap() {
      try {
        await Font.loadAsync(Ionicons.font);
      } catch (fontError) {
        // Safe fallback if font is already loaded or in web environment
      }

      try {
        await StorageService.initializeDefaults();
      } catch (err) {
        console.error('Error initializing storage defaults:', err);
      } finally {
        setIsReady(true);
      }
    }
    bootstrap();

    // AppState listener for privacy guard (locks app when sent to background)
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    const prev = appState.current;
    if (
      prev &&
      typeof prev === 'string' &&
      prev === 'active' &&
      (nextAppState === 'inactive' || nextAppState === 'background')
    ) {
      // MASVS-STORAGE / PRIVACY: Lock session when leaving foreground
      setIsUnlocked(false);
      setCurrentPin('');
    }
    appState.current = nextAppState;
  };

  const handleUnlockSuccess = async (pin: string) => {
    setCurrentPin(pin);
    try {
      const summary = await StorageService.loadAccountSummary();
      const txs = await StorageService.loadTransactions();
      const vault = await StorageService.loadVault(pin);

      setAccountSummary(summary);
      setTransactions(txs);
      setVaultItems(vault);
      setIsUnlocked(true);
    } catch (err) {
      console.error('Failed to decrypt vault with pin:', err);
    }
  };

  const handleLockApp = () => {
    setIsUnlocked(false);
    setCurrentPin('');
    setActiveScreen('home');
  };

  const handleRefreshVault = async () => {
    if (!currentPin) return;
    try {
      const updated = await StorageService.loadVault(currentPin);
      setVaultItems(updated);
    } catch (err) {
      console.error('Refresh vault error:', err);
    }
  };

  const handlePinChanged = (newPin: string) => {
    setCurrentPin(newPin);
  };

  const handleResetData = async () => {
    setIsUnlocked(false);
    setCurrentPin('');
    setActiveScreen('home');
  };

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  if (!isUnlocked) {
    return (
      <>
        <StatusBar style="light" />
        <UnlockScreen onUnlockSuccess={handleUnlockSuccess} />
      </>
    );
  }

  const getScreenTitle = () => {
    switch (activeScreen) {
      case 'vault':
        return 'Bóveda Cifrada';
      case 'security':
        return 'Centro de Seguridad';
      case 'settings':
        return 'Ajustes de Seguridad';
      case 'home':
      default:
        return 'Aegis Private Bank';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Header
          title={getScreenTitle()}
          subtitle={activeScreen === 'home' ? 'Gestión de Patrimonio & Enclave' : undefined}
          showLockIcon={true}
          onLockPress={handleLockApp}
        />

        <View style={styles.content}>
          {activeScreen === 'home' && (
            <HomeScreen
              accountSummary={accountSummary}
              transactions={transactions}
              onNavigate={setActiveScreen}
              onLockApp={handleLockApp}
            />
          )}

          {activeScreen === 'vault' && (
            <VaultScreen
              vaultItems={vaultItems}
              userPin={currentPin}
              onRefreshVault={handleRefreshVault}
              onLockVault={handleLockApp}
            />
          )}

          {activeScreen === 'security' && <SecurityAuditScreen />}

          {activeScreen === 'settings' && (
            <SettingsScreen
              userPin={currentPin}
              onLockApp={handleLockApp}
              onPinChanged={handlePinChanged}
              onResetData={handleResetData}
            />
          )}
        </View>

        <NavigationTabBar activeScreen={activeScreen} onSelectScreen={setActiveScreen} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 25) : 0,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
