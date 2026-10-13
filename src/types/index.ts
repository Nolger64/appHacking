export type VaultCategory = 'card' | 'crypto' | 'note' | 'credentials';

export interface VaultItem {
  id: string;
  title: string;
  category: VaultCategory;
  secretData: {
    pan?: string;
    exp?: string;
    cvv?: string;
    pin?: string;
    seedPhrase?: string;
    iban?: string;
    swift?: string;
    apiKey?: string;
    notes?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'credit' | 'debit';
  category: 'transfer' | 'investment' | 'card_payment' | 'crypto_swap';
  timestamp: string;
  status: 'completed' | 'pending' | 'flagged';
  isConfidential: boolean;
  counterparty: string;
}

export interface AccountSummary {
  holderName: string;
  accountNumber: string;
  balanceUsd: number;
  btcBalance: number;
  ethBalance: number;
  usdcBalance: number;
  accountTier: 'Private Black Titanium' | 'Sovereign Wealth';
}

export interface SecurityCheckStatus {
  isRooted: boolean;
  isEmulator: boolean;
  screenPrivacyActive: boolean;
  biometricEnrolled: boolean;
  storageEncrypted: boolean;
  encryptionAlgorithm: string;
  kdfIterations: number;
  cipherMode: string;
  tamperIntegrityVerified: boolean;
}

export type ActiveScreen = 'home' | 'vault' | 'security' | 'settings';
