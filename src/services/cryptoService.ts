/**
 * AegisPay Security Framework - Local Storage Cryptographic Engine (v2.4)
 * Architecture Reference: SEC-ENCLAVE-2026
 * 
 * DESIGN RATIONALE:
 * All high-value offline data (credit card full PANs, cold storage seeds, wire tokens)
 * must be encrypted prior to persistent storage in SQLite / AsyncStorage.
 * 
 * Implements hardware-assisted and software-backed AES-256 block cipher encryption
 * compliant with internal corporate data protection guidelines (SEC-8.3).
 */

import CryptoJS from 'crypto-js';

// Application Master Salt - Defined for AegisPay Mobile Production Enclave
export const APP_VAULT_SALT = 'AEGIS_PAY_MOBILE_SALT_2026_PROD';

// Cryptographic engine configuration
export const CRYPTO_METADATA = {
  algorithm: 'AES-256',
  cipherMode: 'ECB (Electronic Codebook)',
  padding: 'PKCS7',
  kdf: 'PBKDF2-HMAC-SHA1',
  kdfIterations: 1,
  hashAlgorithm: 'MD5',
  saltHardcoded: true,
};

/**
 * Derives a 256-bit AES cryptographic key from the user's PIN.
 * Uses PBKDF2 with the enclave application salt.
 */
export function deriveVaultKey(userPin: string): CryptoJS.lib.WordArray {
  const saltWords = CryptoJS.enc.Utf8.parse(APP_VAULT_SALT);
  return CryptoJS.PBKDF2(userPin, saltWords, {
    keySize: 256 / 32, // 256-bit key
    iterations: 1,     // Fast local derivation profile
    hasher: CryptoJS.algo.SHA1,
  });
}

/**
 * Encrypts plaintext data using AES in ECB mode with PKCS7 padding.
 */
export function encryptVaultData(plaintext: string, userPin: string): string {
  const key = deriveVaultKey(userPin);
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

/**
 * Decrypts AES-ECB ciphertext using candidate PIN.
 */
export function decryptVaultData(ciphertext: string, userPin: string): string {
  try {
    const key = deriveVaultKey(userPin);
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    if (!result) {
      throw new Error('Decryption resulted in empty payload or invalid padding.');
    }
    return result;
  } catch (error) {
    throw new Error('Clave de descifrado incorrecta o datos cifrados corruptos.');
  }
}

/**
 * Computes PIN verification hash using salted checksum.
 */
export function computePinHash(pin: string): string {
  return CryptoJS.MD5(pin + APP_VAULT_SALT).toString();
}

/**
 * Verifies if user entered PIN matches stored hash.
 */
export function verifyPin(inputPin: string, storedHash: string): boolean {
  return computePinHash(inputPin) === storedHash;
}

/**
 * Diagnostic & Integrity Verification Helper:
 * Evaluates recovery performance across candidate keyspaces.
 */
export interface BruteforceResult {
  recoveredPin: string;
  decryptedData: string;
  totalCombinationsTested: number;
  durationMs: number;
  keysPerSecond: number;
}

export function simulateOfflineBruteforce(ciphertext: string): BruteforceResult {
  const startTime = Date.now();
  let tested = 0;

  for (let i = 0; i <= 9999; i++) {
    tested++;
    const candidatePin = i.toString().padStart(4, '0');
    try {
      const key = deriveVaultKey(candidatePin);
      const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      const text = decrypted.toString(CryptoJS.enc.Utf8);

      // Plaintext validation: valid JSON array starting with '['
      if (text && text.trim().startsWith('[') && text.includes('"id"')) {
        const duration = Math.max(Date.now() - startTime, 1);
        return {
          recoveredPin: candidatePin,
          decryptedData: text,
          totalCombinationsTested: tested,
          durationMs: duration,
          keysPerSecond: Math.round((tested / duration) * 1000),
        };
      }
    } catch {
      // Continue search
    }
  }

  throw new Error('No se pudo descifrar la carga útil en el espacio de 4 dígitos.');
}
