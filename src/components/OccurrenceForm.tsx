import { useState, type FormEvent } from 'react';
import type { Result } from '../logic/useCaderneta';
import {
  hasErrors,
  OCCURRENCE_FIELD_LABELS,
  validateOccurrence,
  type Draft,
  type FieldErrors,
} from '../logic/validation';
import { OCCURRENCE_TYPES, type Occurrence, type OccurrenceInput, type Student } from '../types';
import { compareGrades, todayISO } from '../utils/format';
import { FormField, fieldProps } from './FormField';
import { Modal } from './Modal';

interface OccurrenceFormProps {
  students: Student[];
  /** Ocorrência a editar; se omitida, regista uma nova. */
  occurrence?: Occurrence;
  /** Aluno pré-seleccionado (quando o formulário é aberto a partir do perfil). */
  defaultStudentId?: string;
  onSubmit: (input: OccurrenceInput) => Result;
  onClose: () => void;
}

const FORM_ID = 'occurrence-form';

/** Agrupa os alunos por classe e turma para o campo de selecção. */
function groupStudents(students: Student[]) {
  const groups = new Map<string, Student[]>();
  const sorted = [...students].sort(
    (a, b) =>
      compareGrades(a.grade, b.grade) ||
      a.className.localeCompare(b.className, 'pt') ||
      a.fullName.localeCompare(b.fullName, 'pt'),
  );
  for (const s of sorted) {
    const label = `${s.grade} · Turma ${s.className}`;
    groups.set(label, [...(groups.get(label) ?? []), s]);
  }
  return [...groups.entries()];
}

export function OccurrenceForm({ students, occurrence, defaultStudentId, onSubmit, onClose }: OccurrenceFormProps) {
  const [values, setValues] = useState<Draft<OccurrenceInput>>(() => ({
    studentId: occurrence?.studentId ?? defaultStudentId ?? '',
    date: occurrence?.date ?? todayISO(),
    type: occurrence?.type ?? '',
    description: occurrence?.description ?? '',
    measure: occurrence?.measure ?? '',
    recordedBy: occurrence?.recordedBy ?? '',
  }));
  const [errors, setErrors] = useState<FieldErrors<OccurrenceInput>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState('');

  const set = (field: keyof OccurrenceInput, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    // Depois da primeira tentativa, as mensagens desaparecem à medida que os campos são corrigidos.
    if (submitted) setErrors(validateOccurrence(next, students));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSaveError('');
    const found = validateOccurrence(values, students);
    setErrors(found);
    if (hasErrors(found)) {
      // Os dados preenchidos mantêm-se; apenas se assinala o que falta corrigir.
      document.getElementById(`occ-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    const result = onSubmit(values as OccurrenceInput);
    if (!result.ok) setSaveError(result.error);
  };

  const invalidFields = (Object.keys(errors) as (keyof OccurrenceInput)[]).map((f) => OCCURRENCE_FIELD_LABELS[f]);

  return (
    <Modal
      title={occurrence ? 'Editar ocorrência' : 'Registar ocorrência'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form={FORM_ID} className="btn btn-primary">
            {occurrence ? 'Guardar alterações' : 'Registar ocorrência'}
          </button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate>
        <p className="form-note">
          Os campos marcados com <span className="required">*</span> são obrigatórios.
        </p>

        {invalidFields.length > 0 && (
          <div className="alert alert-error" role="alert">
            <strong>A ocorrência ainda não foi guardada.</strong>{' '}
            {invalidFields.length === 1
              ? `Corrija o campo ${invalidFields[0]}.`
              : `Corrija os campos: ${invalidFields.join(', ')}.`}{' '}
            Os dados que já preencheu foram mantidos.
          </div>
        )}
        {saveError && (
          <div className="alert alert-error" role="alert">
            {saveError}
          </div>
        )}

        <div className="form-grid">
          <FormField id="occ-studentId" label="Aluno" required error={errors.studentId} className="span-2">
            <select
              {...fieldProps('occ-studentId', errors.studentId, true)}
              value={values.studentId}
              onChange={(e) => set('studentId', e.target.value)}
              autoFocus={!values.studentId}
            >
              <option value="">Seleccione o aluno…</option>
              {groupStudents(students).map(([label, group]) => (
                <optgroup key={label} label={label}>
                  {group.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} — Nº {s.processNumber}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </FormField>
          <FormField id="occ-date" label="Data da ocorrência" required error={errors.date}>
            <input
              {...fieldProps('occ-date', errors.date, true)}
              type="date"
              max={todayISO()}
              value={values.date}
              onChange={(e) => set('date', e.target.value)}
            />
          </FormField>
          <FormField id="occ-type" label="Tipo de ocorrência" required error={errors.type}>
            <select
              {...fieldProps('occ-type', errors.type, true)}
              value={values.type}
              onChange={(e) => set('type', e.target.value)}
              autoFocus={!!values.studentId && !occurrence}
            >
              <option value="">Seleccione o tipo…</option>
              {OCCURRENCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="occ-description" label="Descrição detalhada" required error={errors.description} className="span-2">
            <textarea
              {...fieldProps('occ-description', errors.description, true)}
              rows={4}
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="O que aconteceu, onde e em que contexto."
            />
          </FormField>
          <FormField
            id="occ-measure"
            label="Medida disciplinar ou providência tomada"
            hint="Opcional — preencha quando aplicável."
            className="span-2"
          >
            <textarea
              {...fieldProps('occ-measure', undefined)}
              rows={2}
              value={values.measure}
              onChange={(e) => set('measure', e.target.value)}
            />
          </FormField>
          <FormField id="occ-recordedBy" label="Responsável pelo registo" required error={errors.recordedBy} className="span-2">
            <input
              {...fieldProps('occ-recordedBy', errors.recordedBy, true)}
              value={values.recordedBy}
              onChange={(e) => set('recordedBy', e.target.value)}
              placeholder="Ex.: Prof. Helena Costa"
            />
          </FormField>
        </div>
      </form>
    </Modal>
  );
}
