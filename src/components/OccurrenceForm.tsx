import { useState, type FormEvent } from 'react';
import type { Result } from '../logic/useCaderneta';
import { hasErrors, validateOccurrence, type Draft, type FieldErrors } from '../logic/validation';
import { OCCURRENCE_TYPES, type Occurrence, type OccurrenceInput, type Student } from '../types';
import { todayISO } from '../utils/format';
import { FormField, fieldProps } from './FormField';
import { Modal } from './Modal';

interface OccurrenceFormProps {
  student: Student;
  /** Ocorrência a editar; se omitida, regista uma nova. */
  occurrence?: Occurrence;
  onSubmit: (input: OccurrenceInput) => Result;
  onClose: () => void;
}

const FORM_ID = 'occurrence-form';

export function OccurrenceForm({ student, occurrence, onSubmit, onClose }: OccurrenceFormProps) {
  const [values, setValues] = useState<Draft<OccurrenceInput>>(() => ({
    studentId: student.id,
    date: occurrence?.date ?? todayISO(),
    type: occurrence?.type ?? '',
    description: occurrence?.description ?? '',
    measure: occurrence?.measure ?? '',
    recordedBy: occurrence?.recordedBy ?? '',
  }));
  const [errors, setErrors] = useState<FieldErrors<OccurrenceInput>>({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const set = (field: keyof OccurrenceInput, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (submitted) setErrors(validateOccurrence(next));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validateOccurrence(values);
    setErrors(found);
    if (hasErrors(found)) {
      setFormError('Verifique os campos assinalados.');
      document.getElementById(`occ-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    const result = onSubmit(values as OccurrenceInput);
    if (!result.ok) setFormError(result.error);
  };

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
        {formError && (
          <div className="alert alert-error" role="alert">
            {formError}
          </div>
        )}

        <div className="form-grid">
          <div className="field span-2">
            <span className="field-label">Aluno</span>
            <p className="readonly-value">
              {student.fullName} <span className="muted">· Nº {student.processNumber}</span>
            </p>
          </div>
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
              autoFocus
            >
              <option value="">Seleccione…</option>
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
              placeholder="Descreva o que aconteceu, onde e em que contexto."
            />
          </FormField>
          <FormField
            id="occ-measure"
            label="Medida disciplinar / providência tomada"
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
