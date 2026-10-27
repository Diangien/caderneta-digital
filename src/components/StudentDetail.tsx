import { useState } from 'react';
import { sortByMostRecent, type Caderneta } from '../logic/useCaderneta';
import { OCCURRENCE_TYPES, type Occurrence, type OccurrenceInput, type Student } from '../types';
import { ageFrom, formatDate } from '../utils/format';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';
import { OccurrenceCard, TypeTag } from './OccurrenceCard';
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
      notify('success', existing ? 'Ocorrência actualizada.' : 'Ocorrência registada.');
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
      notify('success', `${student.fullName} foi eliminado da caderneta.`);
      onBack();
    } else {
      notify('error', result.error);
    }
  };

  return (
    <section>
      <button type="button" className="back-link" onClick={onBack}>
        ← Alunos
      </button>

      <div className="profile-layout">
        {/* Secção 1 — Informações do aluno */}
        <aside className="profile-info" aria-labelledby="info-title">
          <p className="eyebrow" id="info-title">
            Informações do aluno
          </p>
          <h1 className="profile-name">{student.fullName}</h1>
          <p className="profile-id">
            <span className="mono">Nº {student.processNumber}</span>
            <span className="profile-class">
              {student.grade} · Turma {student.className}
            </span>
          </p>

          <div className="info-block">
            <h2>Dados pessoais</h2>
            <dl>
              <div>
                <dt>Data de nascimento</dt>
                <dd>
                  {formatDate(student.birthDate)}
                  {age !== null && <span className="dd-sub">{age} anos</span>}
                </dd>
              </div>
              <div>
                <dt>Género</dt>
                <dd>{student.gender}</dd>
              </div>
            </dl>
          </div>

          <div className="info-block">
            <h2>Dados escolares</h2>
            <dl>
              <div>
                <dt>Classe</dt>
                <dd>{student.grade}</dd>
              </div>
              <div>
                <dt>Turma</dt>
                <dd>{student.className}</dd>
              </div>
              <div>
                <dt>Ano lectivo</dt>
                <dd>{student.schoolYear}</dd>
              </div>
            </dl>
          </div>

          <div className="info-block">
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

          <div className="profile-actions">
            <button type="button" className="btn btn-secondary" onClick={onEdit}>
              Editar dados
            </button>
            <button type="button" className="text-btn danger" onClick={() => setConfirmDeleteStudent(true)}>
              Eliminar aluno
            </button>
          </div>
        </aside>

        {/* Secção 2 — Histórico disciplinar */}
        <div className="profile-history" aria-labelledby="history-title">
          <div className="history-head">
            <div>
              <p className="eyebrow" id="history-title">
                Histórico disciplinar
              </p>
              <p className="history-total">
                <span className="history-total-num">{history.length}</span>
                {history.length === 1 ? 'ocorrência' : 'ocorrências'}
              </p>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => setOccurrenceModal({ mode: 'form' })}>
              Registar ocorrência
            </button>
          </div>

          {typeCounts.length > 0 && (
            <ul className="type-counts" aria-label="Ocorrências por tipo">
              {typeCounts.map((t) => (
                <li key={t.value}>
                  <TypeTag type={t.value} />
                  <strong>{t.count}</strong>
                </li>
              ))}
            </ul>
          )}

          {history.length === 0 ? (
            <EmptyState
              title="Sem ocorrências"
              description="Este aluno não tem ocorrências disciplinares registadas."
            />
          ) : (
            <ol className="timeline" aria-label="Ocorrências, da mais recente para a mais antiga">
              {history.map((o) => (
                <OccurrenceCard
                  key={o.id}
                  occurrence={o}
                  onEdit={() => setOccurrenceModal({ mode: 'form', occurrence: o })}
                  onDelete={() => setOccurrenceModal({ mode: 'delete', occurrence: o })}
                />
              ))}
            </ol>
          )}
        </div>
      </div>

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
              Eliminar a ocorrência de <strong>{formatDate(occurrenceModal.occurrence.date)}</strong>? Esta acção não pode
              ser desfeita.
            </p>
          }
          confirmLabel="Eliminar"
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
                Eliminar <strong>{student.fullName}</strong> da caderneta?
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
