// ─── Backend real de persistência ────────────────────────────────────────────
// **O único arquivo do projeto que importa AsyncStorage.** Isolado de propósito:
// é o que mantém `storage.ts`, o store e os testes rodando em node puro, sem
// módulo nativo. Trocar de mecanismo de persistência é trocar este arquivo.

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageBackend } from './storage';

export const asyncStorageBackend: StorageBackend = {
  get: (key) => AsyncStorage.getItem(key),
  set: (key, value) => AsyncStorage.setItem(key, value),
  remove: (key) => AsyncStorage.removeItem(key),
};
