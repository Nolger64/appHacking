import AsyncStorage from '@react-native-async-storage/async-storage';
import { VaultItem, Transaction, AccountSummary } from '../types';
import {
  DEFAULT_PIN,
  INITIAL_ACCOUNT_SUMMARY,
  INITIAL_TRANSACTIONS,
  INITIAL_VAULT_ITEMS,
} from '../constants/initialData';
import {
  computePinHash,
  decryptVaultData,
  encryptVaultData,
  verifyPin as verifyCryptoPin,
} from './cryptoService';

export const STORAGE_KEYS = {
  APP_INITIALIZED: '@aegis_app_initialized',
  PIN_HASH: '@aegis_pin_hash_md5',
  ENCRYPTED_VAULT: '@aegis_encrypted_vault_data',
  ACCOUNT_SUMMARY: '@aegis_account_summary',
  TRANSACTIONS: '@aegis_transactions_cache',
  BIOMETRICS_ENABLED: '@aegis_biometrics_pref',
  AUTO_LOCK_MINUTES: '@aegis_auto_lock_interval',
};

export class StorageService {
  /**
   * Initializes default database state if app is launched for the first time.
   */
  static async initializeDefaults(force = false): Promise<void> {
    const initialized = await AsyncStorage.getItem(STORAGE_KEYS.APP_INITIALIZED);
    if (!initialized || force) {
      const pinHash = computePinHash(DEFAULT_PIN);
      const encryptedVault = encryptVaultData(JSON.stringify(INITIAL_VAULT_ITEMS), DEFAULT_PIN);

      await AsyncStorage.multiSet([
        [STORAGE_KEYS.APP_INITIALIZED, 'true'],
        [STORAGE_KEYS.PIN_HASH, pinHash],
        [STORAGE_KEYS.ENCRYPTED_VAULT, encryptedVault],
        [STORAGE_KEYS.ACCOUNT_SUMMARY, JSON.stringify(INITIAL_ACCOUNT_SUMMARY)],
        [STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS)],
        [STORAGE_KEYS.BIOMETRICS_ENABLED, 'true'],
        [STORAGE_KEYS.AUTO_LOCK_MINUTES, '5'],
      ]);
    }
  }

  /**
   * Verifies PIN against stored MD5 hash.
   */
  static async verifyPin(pin: string): Promise<boolean> {
    const storedHash = await AsyncStorage.getItem(STORAGE_KEYS.PIN_HASH);
    if (!storedHash) {
      return pin === DEFAULT_PIN;
    }
    return verifyCryptoPin(pin, storedHash);
  }

  /**
   * Loads and decrypts the sensitive vault using the supplied PIN.
   */
  static async loadVault(pin: string): Promise<VaultItem[]> {
    const ciphertext = await AsyncStorage.getItem(STORAGE_KEYS.ENCRYPTED_VAULT);
    if (!ciphertext) {
      return INITIAL_VAULT_ITEMS;
    }
    const decryptedJson = decryptVaultData(ciphertext, pin);
    return JSON.parse(decryptedJson) as VaultItem[];
  }

  /**
   * Encrypts and persists updated vault items to disk using the supplied PIN.
   */
  static async saveVault(items: VaultItem[], pin: string): Promise<void> {
    const json = JSON.stringify(items);
    const ciphertext = encryptVaultData(json, pin);
    await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_VAULT, ciphertext);
  }

  /**
   * Retrieves raw stored ciphertext without decrypting.
   * Useful for CTF participants and reversing demonstrations.
   */
  static async getRawCiphertext(): Promise<string> {
    return (await AsyncStorage.getItem(STORAGE_KEYS.ENCRYPTED_VAULT)) || '';
  }

  /**
   * Retrieves stored PIN hash (MD5).
   */
  static async getStoredPinHash(): Promise<string> {
    return (await AsyncStorage.getItem(STORAGE_KEYS.PIN_HASH)) || '';
  }

  /**
   * Changes the master PIN and re-encrypts the vault with the new key.
   */
  static async changePin(oldPin: string, newPin: string): Promise<boolean> {
    const isValid = await this.verifyPin(oldPin);
    if (!isValid) {
      return false;
    }
    const vaultItems = await this.loadVault(oldPin);
    const newHash = computePinHash(newPin);
    const newCiphertext = encryptVaultData(JSON.stringify(vaultItems), newPin);

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.PIN_HASH, newHash],
      [STORAGE_KEYS.ENCRYPTED_VAULT, newCiphertext],
    ]);
    return true;
  }

  /**
   * Loads Account Summary
   */
  static async loadAccountSummary(): Promise<AccountSummary> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ACCOUNT_SUMMARY);
    return data ? JSON.parse(data) : INITIAL_ACCOUNT_SUMMARY;
  }

  /**
   * Loads Transactions
   */
  static async loadTransactions(): Promise<Transaction[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
  }

  /**
   * Full Raw Storage Dump (Simulating what an attacker dumps via adb or jailbreak file browser)
   */
  static async getFullStorageDump(): Promise<Record<string, string>> {
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(keys);
    const result: Record<string, string> = {};
    pairs.forEach(([key, val]) => {
      result[key] = val ?? '';
    });
    return result;
  }

  /**
   * Biometric preference
   */
  static async isBiometricEnabled(): Promise<boolean> {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRICS_ENABLED);
    return val !== 'false';
  }

  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRICS_ENABLED, enabled ? 'true' : 'false');
  }

  /**
   * Factory reset app data
   */
  static async factoryReset(): Promise<void> {
    await AsyncStorage.clear();
    await this.initializeDefaults(true);
  }
}
