// Lógica de gestão dos alunos e das ocorrências.
// Cada operação valida os dados, guarda no localStorage e só depois actualiza o estado.
import { useCallback, useMemo, useState } from 'react';
import { loadData, saveData } from '../data/storage';
import type { AppData, Occurrence, OccurrenceInput, Student, StudentInput } from '../types';
import { generateId, normalize } from '../utils/format';
import { findDuplicateProcessNumber } from './validation';

/** Resultado de uma operação; `id` identifica o registo criado, quando aplicável. */
export type Result = { ok: true; id?: string } | { ok: false; error: string };

const SAVE_ERROR = 'Não foi possível guardar os dados neste navegador.';

function cleanStudent(input: StudentInput): StudentInput {
  return {
    ...input,
    fullName: input.fullName.trim().replace(/\s+/g, ' '),
    processNumber: input.processNumber.trim(),
    className: input.className.trim().toUpperCase(),
    schoolYear: input.schoolYear.trim(),
    guardianName: input.guardianName.trim().replace(/\s+/g, ' '),
    guardianContact: input.guardianContact.trim(),
  };
}

function cleanOccurrence(input: OccurrenceInput): OccurrenceInput {
  return {
    ...input,
    description: input.description.trim(),
    measure: input.measure.trim(),
    recordedBy: input.recordedBy.trim(),
  };
}

/** Ordena da ocorrência mais recente para a mais antiga. */
export function sortByMostRecent(list: Occurrence[]): Occurrence[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export interface StudentFilters {
  /** Texto livre: nome, nº de processo, classe ou turma. */
  query: string;
  /** Classe exacta ou "" para todas. */
  grade: string;
  /** Turma exacta ou "" para todas. */
  className: string;
}

export const EMPTY_FILTERS: StudentFilters = { query: '', grade: '', className: '' };

/**
 * Cada palavra da pesquisa tem de corresponder ao aluno: contida no nº de processo,
 * ou no início de uma palavra do nome, da classe ou da turma (ex.: "7ª", "turma b", "kiala 0002").
 */
function matchesQuery(student: Student, tokens: string[]): boolean {
  const process = normalize(student.processNumber);
  const words = normalize(`${student.fullName} ${student.grade} turma ${student.className}`).split(/[^a-z0-9]+/);
  return tokens.every((t) => process.includes(t) || words.some((w) => w.startsWith(t)));
}

/** Aplica a pesquisa textual e os filtros de classe e turma; devolve os alunos por ordem alfabética. */
export function filterStudents(students: Student[], filters: StudentFilters): Student[] {
  const tokens = normalize(filters.query).split(/\s+/).filter(Boolean);
  return students
    .filter(
      (s) =>
        (!filters.grade || s.grade === filters.grade) &&
        (!filters.className || s.className === filters.className) &&
        matchesQuery(s, tokens),
    )
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'pt'));
}

export function useCaderneta() {
  const [data, setData] = useState<AppData>(loadData);

  const commit = useCallback((next: AppData): Result => {
    if (!saveData(next)) return { ok: false, error: SAVE_ERROR };
    setData(next);
    return { ok: true };
  }, []);

  const addStudent = (input: StudentInput): Result => {
    const clean = cleanStudent(input);
    if (findDuplicateProcessNumber(clean.processNumber, data.students)) {
      return { ok: false, error: 'Já existe um aluno com este número de processo.' };
    }
    const now = new Date().toISOString();
    const student: Student = { ...clean, id: generateId(), createdAt: now, updatedAt: now };
    const result = commit({ ...data, students: [...data.students, student] });
    return result.ok ? { ok: true, id: student.id } : result;
  };

  const updateStudent = (id: string, input: StudentInput): Result => {
    const clean = cleanStudent(input);
    if (findDuplicateProcessNumber(clean.processNumber, data.students, id)) {
      return { ok: false, error: 'Já existe um aluno com este número de processo.' };
    }
    const now = new Date().toISOString();
    return commit({
      ...data,
      students: data.students.map((s) => (s.id === id ? { ...s, ...clean, updatedAt: now } : s)),
    });
  };

  /** Elimina o aluno e todas as ocorrências associadas. */
  const deleteStudent = (id: string): Result =>
    commit({
      ...data,
      students: data.students.filter((s) => s.id !== id),
      occurrences: data.occurrences.filter((o) => o.studentId !== id),
    });

  const addOccurrence = (input: OccurrenceInput): Result => {
    if (!data.students.some((s) => s.id === input.studentId)) {
      return { ok: false, error: 'O aluno associado não existe.' };
    }
    const now = new Date().toISOString();
    const occurrence: Occurrence = { ...cleanOccurrence(input), id: generateId(), createdAt: now, updatedAt: now };
    return commit({ ...data, occurrences: [...data.occurrences, occurrence] });
  };

  const updateOccurrence = (id: string, input: OccurrenceInput): Result => {
    const now = new Date().toISOString();
    return commit({
      ...data,
      occurrences: data.occurrences.map((o) =>
        o.id === id ? { ...o, ...cleanOccurrence(input), studentId: o.studentId, updatedAt: now } : o,
      ),
    });
  };

  const deleteOccurrence = (id: string): Result =>
    commit({ ...data, occurrences: data.occurrences.filter((o) => o.id !== id) });

  /** Número de ocorrências por aluno, calculado uma vez por alteração. */
  const occurrenceCountByStudent = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of data.occurrences) counts.set(o.studentId, (counts.get(o.studentId) ?? 0) + 1);
    return counts;
  }, [data.occurrences]);

  return {
    students: data.students,
    occurrences: data.occurrences,
    occurrenceCountByStudent,
    addStudent,
    updateStudent,
    deleteStudent,
    addOccurrence,
    updateOccurrence,
    deleteOccurrence,
  };
}

export type Caderneta = ReturnType<typeof useCaderneta>;
