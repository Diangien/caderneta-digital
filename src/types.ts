// Tipos e estruturas de dados da aplicação.

export type Gender = 'Masculino' | 'Feminino';

export interface Student {
  id: string;
  fullName: string;
  /** Número de processo — único entre todos os alunos. */
  processNumber: string;
  /** Data no formato AAAA-MM-DD. */
  birthDate: string;
  gender: Gender;
  /** Classe, ex.: "7ª Classe". */
  grade: string;
  /** Turma, ex.: "A". */
  className: string;
  /** Ano lectivo, ex.: "2026/2027". */
  schoolYear: string;
  guardianName: string;
  guardianContact: string;
  createdAt: string;
  updatedAt: string;
}

export type OccurrenceType =
  | 'indisciplina'
  | 'atraso'
  | 'falta_respeito'
  | 'conflito'
  | 'incumprimento'
  | 'outros';

export interface Occurrence {
  id: string;
  /** Identificador do aluno associado. */
  studentId: string;
  /** Data no formato AAAA-MM-DD. */
  date: string;
  type: OccurrenceType;
  description: string;
  /** Medida disciplinar ou providência tomada (opcional). */
  measure: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

/** Estrutura guardada no localStorage. */
export interface AppData {
  version: 1;
  students: Student[];
  occurrences: Occurrence[];
}

export type StudentInput = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>;
export type OccurrenceInput = Omit<Occurrence, 'id' | 'createdAt' | 'updatedAt'>;

export const GENDERS: Gender[] = ['Masculino', 'Feminino'];

export const GRADES: string[] = Array.from({ length: 13 }, (_, i) => `${i + 1}ª Classe`);

export const OCCURRENCE_TYPES: { value: OccurrenceType; label: string }[] = [
  { value: 'indisciplina', label: 'Indisciplina' },
  { value: 'atraso', label: 'Atraso' },
  { value: 'falta_respeito', label: 'Falta de respeito' },
  { value: 'conflito', label: 'Conflito entre alunos' },
  { value: 'incumprimento', label: 'Incumprimento das regras' },
  { value: 'outros', label: 'Outros' },
];

export function occurrenceTypeLabel(type: OccurrenceType): string {
  return OCCURRENCE_TYPES.find((t) => t.value === type)?.label ?? type;
}
