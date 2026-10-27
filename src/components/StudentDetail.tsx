import { useState } from 'react';
import { sortByMostRecent, type Caderneta } from '../logic/useCaderneta';
import { OCCURRENCE_TYPES, type Occurrence, type OccurrenceInput, type Student } from '../types';
import { ageFrom, formatDate, initials } from '../utils/format';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';
import { OccurrenceCard, TypeBadge } from './OccurrenceCard';
import { OccurrenceForm } from './OccurrenceForm';
import type { ToastKind } from './Toasts';

interface StudentDetailProps {
  student: Student;
  caderneta: Caderneta;
  notify: (kind: ToastKind, message: string) => void;
  onBack: () => void;
  onEdit: () => void;
}

type OccurrenceModal = { mode: 'form'; occurrence?: Occurrence } | { mode: 'delete'; occurrence: Occurrence };

export function StudentDetail({ student, caderneta, notify, onBack, onEdit }: StudentDetailProps) {
  const [occurrenceModal, setOccurrenceModal] = useState<OccurrenceModal | null>(null);
  const [confirmDeleteStudent, setConfirmDeleteStudent] = useState(false);

  const history = sortByMostRecent(caderneta.occurrences.filter((o) => o.studentId === student.id));
  const typeCounts = OCCURRENCE_TYPES.map((t) => ({
    ...t,
    count: history.filter((o) => o.type === t.value).length,
  })).filter((t) => t.count > 0);
  const age = ageFrom(student.birthDate);

  const saveOccurrence = (input: OccurrenceInput, existing?: Occurrence) => {
    const result = existing ? caderneta.updateOccurrence(existing.id, input) : caderneta.addOccurrence(input);
    if (result.ok) {
      notify('success', existing ? 'Ocorrência actualizada com sucesso.' : 'Ocorrência registada com sucesso.');
      setOccurrenceModal(null);
    }
    return result;
  };

  const deleteOccurrence = (occurrence: Occurrence) => {
    const result = caderneta.deleteOccurrence(occurrence.id);
    notify(result.ok ? 'success' : 'error', result.ok ? 'Ocorrência eliminada.' : result.error);
    setOccurrenceModal(null);
  };

  const deleteStudent = () => {
    const result = caderneta.deleteStudent(student.id);
    setConfirmDeleteStudent(false);
    if (result.ok) {
      notify('success', `O aluno ${student.fullName} foi eliminado.`);
      onBack();
    } else {
      notify('error', result.error);
    }
  };

  return (
    <section>
      <button type="button" className="back-link" onClick={onBack}>
        ← Voltar à lista de alunos
      </button>

      <div className="card profile-card">
        <div className="profile-head">
          <span className="avatar avatar-lg" aria-hidden="true">
            {initials(student.fullName)}
          </span>
          <div className="profile-title">
            <h1>{student.fullName}</h1>
            <p className="muted">Nº de processo {student.processNumber}</p>
            <div className="chips">
              <span className="chip">{student.grade}</span>
              <span className="chip">Turma {student.className}</span>
              <span className="chip">{student.schoolYear}</span>
            </div>
          </div>
          <div className="profile-actions">
            <button type="button" className="btn btn-secondary" onClick={onEdit}>
              Editar
            </button>
            <button type="button" className="btn btn-danger-outline" onClick={() => setConfirmDeleteStudent(true)}>
              Eliminar
            </button>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-group">
            <h2>Dados pessoais</h2>
            <dl>
              <div>
                <dt>Data de nascimento</dt>
                <dd>
                  {formatDate(student.birthDate)}
                  {age !== null && <span className="muted"> ({age} anos)</span>}
                </dd>
              </div>
              <div>
                <dt>Género</dt>
                <dd>{student.gender}</dd>
              </div>
            </dl>
          </div>
          <div className="info-group">
            <h2>Dados escolares</h2>
            <dl>
              <div>
                <dt>Classe e turma</dt>
                <dd>
                  {student.grade} · Turma {student.className}
                </dd>
              </div>
              <div>
                <dt>Ano lectivo</dt>
                <dd>{student.schoolYear}</dd>
              </div>
            </dl>
          </div>
          <div className="info-group">
            <h2>Encarregado de educação</h2>
            <dl>
              <div>
                <dt>Nome</dt>
                <dd>{student.guardianName}</dd>
              </div>
              <div>
                <dt>Contacto</dt>
                <dd>
                  <a href={`tel:${student.guardianContact.replace(/[\s-]/g, '')}`}>{student.guardianContact}</a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="section-header">
        <div>
          <h2>Histórico disciplinar</h2>
          <p className="muted">
            {history.length === 0
              ? 'Sem ocorrências registadas'
              : `${history.length} ${history.length === 1 ? 'ocorrência registada' : 'ocorrências registadas'} · mais recentes primeiro`}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setOccurrenceModal({ mode: 'form' })}>
          + Registar ocorrência
        </button>
      </div>

      {typeCounts.length > 0 && (
        <div className="type-summary" aria-label="Ocorrências por tipo">
          {typeCounts.map((t) => (
            <span key={t.value} className="type-summary-item">
              <TypeBadge type={t.value} /> <strong>{t.count}</strong>
            </span>
          ))}
        </div>
      )}

      {history.length === 0 ? (
        <EmptyState
          title="Nenhuma ocorrência registada"
          description="Este aluno não tem ocorrências disciplinares. Quando registar uma, ela aparecerá aqui."
        />
      ) : (
        <div className="occurrence-list">
          {history.map((o) => (
            <OccurrenceCard
              key={o.id}
              occurrence={o}
              onEdit={() => setOccurrenceModal({ mode: 'form', occurrence: o })}
              onDelete={() => setOccurrenceModal({ mode: 'delete', occurrence: o })}
            />
          ))}
        </div>
      )}

      {occurrenceModal?.mode === 'form' && (
        <OccurrenceForm
          student={student}
          occurrence={occurrenceModal.occurrence}
          onSubmit={(input) => saveOccurrence(input, occurrenceModal.occurrence)}
          onClose={() => setOccurrenceModal(null)}
        />
      )}

      {occurrenceModal?.mode === 'delete' && (
        <ConfirmDialog
          title="Eliminar ocorrência"
          message={
            <p>
              Tem a certeza de que pretende eliminar a ocorrência de{' '}
              <strong>{formatDate(occurrenceModal.occurrence.date)}</strong>? Esta acção não pode ser desfeita.
            </p>
          }
          confirmLabel="Eliminar ocorrência"
          onConfirm={() => deleteOccurrence(occurrenceModal.occurrence)}
          onCancel={() => setOccurrenceModal(null)}
        />
      )}

      {confirmDeleteStudent && (
        <ConfirmDialog
          title="Eliminar aluno"
          message={
            <>
              <p>
                Tem a certeza de que pretende eliminar <strong>{student.fullName}</strong>?
              </p>
              {history.length > 0 && (
                <p>
                  {history.length === 1
                    ? 'A ocorrência associada também será eliminada.'
                    : `As ${history.length} ocorrências associadas também serão eliminadas.`}
                </p>
              )}
              <p>Esta acção não pode ser desfeita.</p>
            </>
          }
          confirmLabel="Eliminar aluno"
          onConfirm={deleteStudent}
          onCancel={() => setConfirmDeleteStudent(false)}
        />
      )}
    </section>
  );
}
