import { useState, type FormEvent } from 'react';
import type { Result } from '../logic/useCaderneta';
import { hasErrors, validateStudent, type Draft, type FieldErrors } from '../logic/validation';
import { GENDERS, GRADES, type Student, type StudentInput } from '../types';
import { currentSchoolYear, todayISO } from '../utils/format';
import { FormField, fieldProps } from './FormField';
import { Modal } from './Modal';

interface StudentFormProps {
  /** Aluno a editar; se omitido, regista um novo aluno. */
  student?: Student;
  students: Student[];
  onSubmit: (input: StudentInput) => Result;
  onClose: () => void;
}

const FORM_ID = 'student-form';

function initialValues(student?: Student): Draft<StudentInput> {
  return {
    fullName: student?.fullName ?? '',
    processNumber: student?.processNumber ?? '',
    birthDate: student?.birthDate ?? '',
    gender: student?.gender ?? '',
    grade: student?.grade ?? '',
    className: student?.className ?? '',
    schoolYear: student?.schoolYear ?? currentSchoolYear(),
    guardianName: student?.guardianName ?? '',
    guardianContact: student?.guardianContact ?? '',
  };
}

export function StudentForm({ student, students, onSubmit, onClose }: StudentFormProps) {
  const [values, setValues] = useState(() => initialValues(student));
  const [errors, setErrors] = useState<FieldErrors<StudentInput>>({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const set = (field: keyof StudentInput, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    // Depois da primeira tentativa de submissão, as mensagens actualizam-se à medida que o utilizador corrige.
    if (submitted) setErrors(validateStudent(next, students, student?.id));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validateStudent(values, students, student?.id);
    setErrors(found);
    if (hasErrors(found)) {
      setFormError('Verifique os campos assinalados.');
      const first = Object.keys(found)[0];
      document.getElementById(first)?.focus();
      return;
    }
    const result = onSubmit(values as StudentInput);
    if (!result.ok) setFormError(result.error);
  };

  return (
    <Modal
      title={student ? 'Editar aluno' : 'Registar novo aluno'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form={FORM_ID} className="btn btn-primary">
            {student ? 'Guardar alterações' : 'Registar aluno'}
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

        <fieldset>
          <legend>Dados pessoais</legend>
          <div className="form-grid">
            <FormField id="fullName" label="Nome completo" required error={errors.fullName} className="span-2">
              <input
                {...fieldProps('fullName', errors.fullName, true)}
                value={values.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                autoComplete="off"
                autoFocus
              />
            </FormField>
            <FormField
              id="processNumber"
              label="Nº de processo"
              required
              error={errors.processNumber}
              hint="Identificador único, ex.: 2026-0007."
            >
              <input
                {...fieldProps('processNumber', errors.processNumber, true)}
                value={values.processNumber}
                onChange={(e) => set('processNumber', e.target.value)}
                autoComplete="off"
              />
            </FormField>
            <FormField id="birthDate" label="Data de nascimento" required error={errors.birthDate}>
              <input
                {...fieldProps('birthDate', errors.birthDate, true)}
                type="date"
                max={todayISO()}
                value={values.birthDate}
                onChange={(e) => set('birthDate', e.target.value)}
              />
            </FormField>
            <FormField id="gender" label="Género" required error={errors.gender}>
              <select
                {...fieldProps('gender', errors.gender, true)}
                value={values.gender}
                onChange={(e) => set('gender', e.target.value)}
              >
                <option value="">Seleccione…</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </fieldset>

        <fieldset>
          <legend>Dados escolares</legend>
          <div className="form-grid form-grid-3">
            <FormField id="grade" label="Classe" required error={errors.grade}>
              <select
                {...fieldProps('grade', errors.grade, true)}
                value={values.grade}
                onChange={(e) => set('grade', e.target.value)}
              >
                <option value="">Seleccione…</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="className" label="Turma" required error={errors.className}>
              <input
                {...fieldProps('className', errors.className, true)}
                value={values.className}
                onChange={(e) => set('className', e.target.value)}
                placeholder="Ex.: A"
                maxLength={10}
                autoComplete="off"
              />
            </FormField>
            <FormField id="schoolYear" label="Ano lectivo" required error={errors.schoolYear}>
              <input
                {...fieldProps('schoolYear', errors.schoolYear, true)}
                value={values.schoolYear}
                onChange={(e) => set('schoolYear', e.target.value)}
                placeholder="AAAA/AAAA"
                inputMode="numeric"
                maxLength={9}
                autoComplete="off"
              />
            </FormField>
          </div>
        </fieldset>

        <fieldset>
          <legend>Encarregado de educação</legend>
          <div className="form-grid">
            <FormField id="guardianName" label="Nome" required error={errors.guardianName}>
              <input
                {...fieldProps('guardianName', errors.guardianName, true)}
                value={values.guardianName}
                onChange={(e) => set('guardianName', e.target.value)}
                autoComplete="off"
              />
            </FormField>
            <FormField id="guardianContact" label="Contacto" required error={errors.guardianContact}>
              <input
                {...fieldProps('guardianContact', errors.guardianContact, true)}
                type="tel"
                value={values.guardianContact}
                onChange={(e) => set('guardianContact', e.target.value)}
                placeholder="+244 9XX XXX XXX"
                autoComplete="off"
              />
            </FormField>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
