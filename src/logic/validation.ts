// Regras de validação dos formulários de alunos e ocorrências.
import type { OccurrenceInput, Student, StudentInput } from '../types';
import { GENDERS, GRADES, OCCURRENCE_TYPES } from '../types';
import { todayISO } from '../utils/format';

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** Valores de um formulário antes de validados (selecções podem estar vazias). */
export type Draft<T> = { [K in keyof T]: string };

const REQUIRED = 'Campo obrigatório.';

/** Comparação de números de processo sem diferenciar maiúsculas nem espaços. */
export function sameProcessNumber(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function findDuplicateProcessNumber(
  processNumber: string,
  students: Student[],
  ignoreId?: string,
): Student | undefined {
  return students.find((s) => s.id !== ignoreId && sameProcessNumber(s.processNumber, processNumber));
}

export function validateStudent(
  input: Draft<StudentInput>,
  students: Student[],
  editingId?: string,
): FieldErrors<StudentInput> {
  const errors: FieldErrors<StudentInput> = {};
  const fullName = input.fullName.trim();
  const processNumber = input.processNumber.trim();

  if (!fullName) errors.fullName = REQUIRED;
  else if (fullName.split(/\s+/).length < 2) errors.fullName = 'Indique o nome e o apelido.';

  if (!processNumber) errors.processNumber = REQUIRED;
  else if (!/^[A-Za-z0-9/-]{1,20}$/.test(processNumber))
    errors.processNumber = 'Use apenas letras, números, "-" ou "/" (máx. 20 caracteres).';
  else if (findDuplicateProcessNumber(processNumber, students, editingId))
    errors.processNumber = 'Já existe um aluno com este número de processo.';

  if (!input.birthDate) errors.birthDate = REQUIRED;
  else if (input.birthDate > todayISO()) errors.birthDate = 'A data de nascimento não pode ser futura.';

  if (!(GENDERS as string[]).includes(input.gender)) errors.gender = REQUIRED;
  if (!GRADES.includes(input.grade)) errors.grade = REQUIRED;
  if (!input.className.trim()) errors.className = REQUIRED;

  const year = input.schoolYear.trim();
  const match = /^(\d{4})\/(\d{4})$/.exec(year);
  if (!year) errors.schoolYear = REQUIRED;
  else if (!match || Number(match[2]) !== Number(match[1]) + 1)
    errors.schoolYear = 'Use o formato AAAA/AAAA, ex.: 2026/2027.';

  if (!input.guardianName.trim()) errors.guardianName = REQUIRED;

  const contact = input.guardianContact.replace(/[\s-]/g, '');
  if (!contact) errors.guardianContact = REQUIRED;
  else if (!/^\+?\d{9,15}$/.test(contact))
    errors.guardianContact = 'Contacto inválido. Indique 9 a 15 dígitos, ex.: +244 923 456 789.';

  return errors;
}

/** Nomes dos campos da ocorrência, usados no resumo de erros do formulário. */
export const OCCURRENCE_FIELD_LABELS: Record<keyof OccurrenceInput, string> = {
  studentId: 'Aluno',
  date: 'Data',
  type: 'Tipo',
  description: 'Descrição',
  measure: 'Medida',
  recordedBy: 'Responsável',
};

export function validateOccurrence(input: Draft<OccurrenceInput>, students: Student[]): FieldErrors<OccurrenceInput> {
  const errors: FieldErrors<OccurrenceInput> = {};

  if (!input.studentId) errors.studentId = 'Seleccione o aluno a quem a ocorrência diz respeito.';
  else if (!students.some((s) => s.id === input.studentId)) errors.studentId = 'O aluno seleccionado já não existe.';

  if (!input.date) errors.date = 'Indique a data da ocorrência.';
  else if (input.date > todayISO()) errors.date = 'A data não pode ser posterior a hoje.';

  if (!OCCURRENCE_TYPES.some((t) => t.value === input.type)) errors.type = 'Seleccione o tipo de ocorrência.';

  if (!input.description) errors.description = 'Descreva o que aconteceu.';
  else if (!input.description.trim()) errors.description = 'A descrição não pode conter apenas espaços.';

  if (!input.recordedBy) errors.recordedBy = 'Indique quem está a fazer o registo.';
  else if (!input.recordedBy.trim()) errors.recordedBy = 'O nome do responsável não pode conter apenas espaços.';

  return errors;
}

export function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}
