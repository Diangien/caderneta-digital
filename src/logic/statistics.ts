// Indicadores e estatísticas do painel.
// Tudo é calculado a partir dos alunos e ocorrências guardados; nenhuma contagem é armazenada.
import { OCCURRENCE_TYPES, type Occurrence, type OccurrenceType, type Student } from '../types';
import { compareGrades, todayISO } from '../utils/format';

export interface Indicators {
  students: number;
  occurrences: number;
  /** Alunos com pelo menos uma ocorrência. */
  studentsWithOccurrences: number;
  /** Ocorrências cuja data pertence ao mês actual. */
  occurrencesThisMonth: number;
}

export function computeIndicators(students: Student[], occurrences: Occurrence[]): Indicators {
  const month = todayISO().slice(0, 7); // AAAA-MM
  const studentIds = new Set(students.map((s) => s.id));
  const withOccurrences = new Set(occurrences.map((o) => o.studentId).filter((id) => studentIds.has(id)));
  return {
    students: students.length,
    occurrences: occurrences.length,
    studentsWithOccurrences: withOccurrences.size,
    occurrencesThisMonth: occurrences.filter((o) => o.date.startsWith(month)).length,
  };
}

export interface GradeStats {
  grade: string;
  students: number;
  occurrences: number;
}

/**
 * Alunos e ocorrências por classe. Cada ocorrência conta na classe actual do aluno associado,
 * porque a ocorrência guarda apenas o identificador do aluno.
 */
export function statsByGrade(students: Student[], occurrences: Occurrence[]): GradeStats[] {
  const gradeOf = new Map(students.map((s) => [s.id, s.grade]));
  const stats = new Map<string, GradeStats>();
  const entry = (grade: string) => {
    if (!stats.has(grade)) stats.set(grade, { grade, students: 0, occurrences: 0 });
    return stats.get(grade)!;
  };
  for (const s of students) entry(s.grade).students++;
  for (const o of occurrences) {
    const grade = gradeOf.get(o.studentId);
    if (grade) entry(grade).occurrences++;
  }
  return [...stats.values()].sort((a, b) => compareGrades(a.grade, b.grade));
}

export interface ClassStats {
  grade: string;
  className: string;
  students: number;
}

/** Alunos por turma (cada turma pertence a uma classe). */
export function statsByClass(students: Student[]): ClassStats[] {
  const stats = new Map<string, ClassStats>();
  for (const s of students) {
    const key = `${s.grade}|${s.className}`;
    const current = stats.get(key) ?? { grade: s.grade, className: s.className, students: 0 };
    current.students++;
    stats.set(key, current);
  }
  return [...stats.values()].sort(
    (a, b) => compareGrades(a.grade, b.grade) || a.className.localeCompare(b.className, 'pt'),
  );
}

export function countByType(occurrences: Occurrence[]): { value: OccurrenceType; label: string; count: number }[] {
  return OCCURRENCE_TYPES.map((t) => ({ ...t, count: occurrences.filter((o) => o.type === t.value).length }));
}
