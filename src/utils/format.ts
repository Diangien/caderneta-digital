// Funções utilitárias de formatação, datas e texto.

/** Data de hoje (hora local) no formato AAAA-MM-DD. */
export function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Converte AAAA-MM-DD em DD/MM/AAAA. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

export function ageFrom(birthDate: string): number | null {
  const [y, m, d] = birthDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
  return age;
}

/** Ano lectivo em curso (começa em Setembro), ex.: "2026/2027". */
export function currentSchoolYear(): string {
  const now = new Date();
  const start = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return `${start}/${start + 1}`;
}

/** Normaliza texto para pesquisa: minúsculas, sem acentos e com "ª" convertido em "a". */
export function normalize(text: string): string {
  return text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/** Divide AAAA-MM-DD em dia, mês abreviado e ano, para apresentação em cronologia. */
export function dateParts(iso: string): { day: string; month: string; year: string } {
  const [y, m, d] = iso.split('-');
  return { day: d ?? '', month: MONTHS[Number(m) - 1] ?? '', year: y ?? '' };
}

/** Data longa, ex.: "terça-feira, 27 de outubro de 2026". */
export function longToday(): string {
  return new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** Ordena classes pelo número ("2ª Classe" antes de "10ª Classe"). */
export function compareGrades(a: string, b: string): number {
  return parseInt(a, 10) - parseInt(b, 10) || a.localeCompare(b, 'pt');
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Alternativa para contextos não seguros (ex.: acesso via IP na rede local).
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
