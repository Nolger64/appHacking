import { AccountSummary, Transaction, VaultItem } from '../types';

export const DEFAULT_PIN = '7492';

export const INITIAL_ACCOUNT_SUMMARY: AccountSummary = {
  holderName: 'Alexander Vance',
  accountNumber: 'AEGIS-CH-8921-9904',
  balanceUsd: 1482950.40,
  btcBalance: 14.85,
  ethBalance: 82.40,
  usdcBalance: 250000.00,
  accountTier: 'Private Black Titanium',
};

export const INITIAL_VAULT_ITEMS: VaultItem[] = [
  {
    id: 'vault-01',
    title: 'Aegis Black Titanium Infinite Card',
    category: 'card',
    secretData: {
      pan: '4532 8920 1198 7741',
      exp: '11/30',
      cvv: '839',
      pin: '9102',
      notes: 'Límite mensual ilimitado. Requiere autorización para transferencias > $100k USD.',
    },
    createdAt: '2026-01-10T14:32:00Z',
    updatedAt: '2026-03-01T09:15:00Z',
  },
  {
    id: 'vault-02',
    title: 'Trezor Model T - Master Vault Seed',
    category: 'crypto',
    secretData: {
      seedPhrase: 'matrix crystal velvet dynamic mirror harbor cascade legend timber puzzle echo quantum',
      notes: 'Billetera fría institucional con custodia de 14.85 BTC y reservas de tesorería.',
    },
    createdAt: '2026-02-14T11:20:00Z',
    updatedAt: '2026-02-14T11:20:00Z',
  },
  {
    id: 'vault-03',
    title: 'Zurich Cantonal Private Wire Credentials',
    category: 'credentials',
    secretData: {
      iban: 'CH93 0076 2011 6238 5295 7',
      swift: 'UBSWCHZH80A',
      apiKey: 'SEC-WIRE-TOKEN-v4-998842-CH-AUTH',
      notes: 'Canal de liquidación bancaria directa para arbitraje internacional.',
    },
    createdAt: '2026-02-28T16:45:00Z',
    updatedAt: '2026-03-05T18:10:00Z',
  },
  {
    id: 'vault-04',
    title: 'Bóveda de Seguridad Ginebra - Clave Operativa',
    category: 'note',
    secretData: {
      notes: 'Combinación física bóveda #412: 84-12-99-31. Contacto de custodia: Dr. H. Meyer (+41 22 555 0192).',
    },
    createdAt: '2026-03-12T08:00:00Z',
    updatedAt: '2026-03-12T08:00:00Z',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    title: 'Transferencia Bóveda Suiza',
    amount: 150000.00,
    type: 'debit',
    category: 'transfer',
    timestamp: 'Hoy, 09:14 AM',
    status: 'completed',
    isConfidential: true,
    counterparty: 'Lombard Odier Private Bank',
  },
  {
    id: 'tx-102',
    title: 'Adquisición de Activos Digitales',
    amount: 45000.00,
    type: 'debit',
    category: 'crypto_swap',
    timestamp: 'Ayer, 04:32 PM',
    status: 'completed',
    isConfidential: true,
    counterparty: 'FalconX OTC Liquidity Desk',
  },
  {
    id: 'tx-103',
    title: 'Dividendo Fondo Soberano',
    amount: 82500.00,
    type: 'credit',
    category: 'investment',
    timestamp: '11 Oct 2026',
    status: 'completed',
    isConfidential: false,
    counterparty: 'Aegis Global Yield Fund IX',
  },
  {
    id: 'tx-104',
    title: 'Pago Concierge Black Card',
    amount: 12400.00,
    type: 'debit',
    category: 'card_payment',
    timestamp: '09 Oct 2026',
    status: 'completed',
    isConfidential: false,
    counterparty: 'Centurion Aviation Services',
  },
];
