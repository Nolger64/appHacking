import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VaultCategory, VaultItem } from '../types';
import { VaultItemCard } from '../components/VaultItemCard';
import { StorageService } from '../services/storageService';
import { THEME } from '../constants/theme';
import { CRYPTO_METADATA } from '../services/cryptoService';

interface VaultScreenProps {
  vaultItems: VaultItem[];
  userPin: string;
  onRefreshVault: () => void;
  onLockVault: () => void;
}

export const VaultScreen: React.FC<VaultScreenProps> = ({
  vaultItems,
  userPin,
  onRefreshVault,
  onLockVault,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New item form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<VaultCategory>('card');
  const [newPan, setNewPan] = useState('');
  const [newExp, setNewExp] = useState('');
  const [newCvv, setNewCvv] = useState('');
  const [newSecretText, setNewSecretText] = useState('');

  const filterCategories = [
    { key: 'all', label: 'Todos' },
    { key: 'card', label: 'Tarjetas' },
    { key: 'crypto', label: 'Cripto' },
    { key: 'credentials', label: 'Tokens' },
    { key: 'note', label: 'Notas' },
  ];

  const filteredItems = vaultItems.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handleDeleteItem = async (id: string) => {
    const updated = vaultItems.filter((i) => i.id !== id);
    await StorageService.saveVault(updated, userPin);
    onRefreshVault();
  };

  const handleSaveNewItem = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Error', 'Ingresa un título para el elemento.');
      return;
    }

    const newItem: VaultItem = {
      id: `vault-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      secretData: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (newCategory === 'card') {
      newItem.secretData.pan = newPan.trim() || '4532 0000 0000 1234';
      newItem.secretData.exp = newExp.trim() || '12/28';
      newItem.secretData.cvv = newCvv.trim() || '999';
    } else if (newCategory === 'crypto') {
      newItem.secretData.seedPhrase = newSecretText.trim() || 'palabra1 palabra2 palabra3';
    } else if (newCategory === 'credentials') {
      newItem.secretData.apiKey = newSecretText.trim() || 'SEC-TOKEN-XYZ';
    } else {
      newItem.secretData.notes = newSecretText.trim() || 'Nota de prueba confidencial';
    }

    const updated = [newItem, ...vaultItems];
    await StorageService.saveVault(updated, userPin);
    onRefreshVault();
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewTitle('');
    setNewCategory('card');
    setNewPan('');
    setNewExp('');
    setNewCvv('');
    setNewSecretText('');
  };

  return (
    <View style={styles.container}>
      {/* Encryption Details Banner */}
      <View style={styles.cryptoBanner}>
        <View style={styles.cryptoBannerHeader}>
          <Ionicons name="lock-closed" size={16} color={THEME.colors.primary} />
          <Text style={styles.cryptoBannerTitle}>BÓVEDA DE ALMACENAMIENTO SEGURO</Text>
        </View>
        <Text style={styles.cryptoBannerSubtitle}>
          Seguridad en Reposo: <Text style={styles.highlight}>Cifrado Militar AES-256</Text>
        </Text>
        <Text style={styles.cryptoBannerMeta}>
          Arquitectura Enclave v2.4 • Autenticación de Hardware Activa
        </Text>
      </View>

      {/* Filter Category Pills */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filterCategories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Vault Items List */}
      <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
        <View style={styles.listHeaderRow}>
          <Text style={styles.itemsCountText}>
            {filteredItems.length} Elementos Descifrados en Memoria
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddModalOpen(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color={THEME.colors.textInverse} />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {filteredItems.map((item) => (
          <VaultItemCard key={item.id} item={item} onDelete={handleDeleteItem} />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Item Modal */}
      <Modal visible={isAddModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Secreto a la Bóveda</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <Ionicons name="close" size={24} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Título</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Tarjeta de Crédito Corporativa"
                placeholderTextColor={THEME.colors.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.inputLabel}>Categoría</Text>
              <View style={styles.categorySelectRow}>
                {(['card', 'crypto', 'credentials', 'note'] as VaultCategory[]).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      newCategory === cat && styles.categoryOptionActive,
                    ]}
                    onPress={() => setNewCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        newCategory === cat && styles.categoryOptionTextActive,
                      ]}
                    >
                      {cat.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {newCategory === 'card' ? (
                <>
                  <Text style={styles.inputLabel}>Número de Tarjeta (PAN 16 dígitos)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="4532 8920 1198 7741"
                    placeholderTextColor={THEME.colors.textMuted}
                    value={newPan}
                    onChangeText={setNewPan}
                  />
                  <View style={styles.formRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.inputLabel}>Vencimiento</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="12/28"
                        placeholderTextColor={THEME.colors.textMuted}
                        value={newExp}
                        onChangeText={setNewExp}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>CVV</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="839"
                        placeholderTextColor={THEME.colors.textMuted}
                        value={newCvv}
                        onChangeText={setNewCvv}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Contenido Confidencial</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Escribe la frase semilla, clave API o nota secreta..."
                    placeholderTextColor={THEME.colors.textMuted}
                    multiline
                    numberOfLines={4}
                    value={newSecretText}
                    onChangeText={setNewSecretText}
                  />
                </>
              )}

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveNewItem}
                activeOpacity={0.7}
              >
                <Ionicons name="lock-closed" size={16} color={THEME.colors.textInverse} />
                <Text style={styles.saveButtonText}>Cifrar y Guardar en Bóveda</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  cryptoBanner: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 168, 0.3)',
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    marginBottom: 16,
  },
  cryptoBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cryptoBannerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: 1.2,
  },
  cryptoBannerSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 2,
  },
  cryptoBannerMeta: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  highlight: {
    color: THEME.colors.primary,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  highlightDanger: {
    color: THEME.colors.warning,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  filtersContainer: {
    marginBottom: 14,
  },
  filterScroll: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  filterPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  filterTextActive: {
    color: THEME.colors.textInverse,
    fontWeight: '700',
  },
  itemsList: {
    flex: 1,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  itemsCountText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    flexShrink: 1,
  },
  addButton: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textInverse,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: THEME.colors.textPrimary,
    fontSize: 14,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  categorySelectRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  categoryOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  categoryOptionActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(0, 240, 168, 0.1)',
  },
  categoryOptionText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  categoryOptionTextActive: {
    color: THEME.colors.primary,
  },
  formRow: {
    flexDirection: 'row',
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textInverse,
  },
});
