// Funções responsáveis pelo armazenamento local (localStorage).
import type { AppData } from '../types';
import { SEED_DATA } from './seed';

const STORAGE_KEY = 'caderneta-digital:dados';

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<AppData>;
  return data.version === 1 && Array.isArray(data.students) && Array.isArray(data.occurrences);
}

/**
 * Lê os dados guardados. Na primeira utilização (sem dados guardados)
 * carrega e guarda os dados de demonstração.
 */
export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      saveData(SEED_DATA);
      return SEED_DATA;
    }
    const parsed: unknown = JSON.parse(raw);
    if (isAppData(parsed)) return parsed;
    console.warn('Dados guardados inválidos; a utilizar dados de demonstração.');
  } catch (error) {
    console.error('Não foi possível ler os dados guardados.', error);
  }
  return SEED_DATA;
}

/** Guarda os dados. Devolve `false` se o navegador recusar a escrita. */
export function saveData(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Não foi possível guardar os dados.', error);
    return false;
  }
}
