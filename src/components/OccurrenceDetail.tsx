import type { Occurrence, Student } from '../types';
import { formatDate } from '../utils/format';
import { Modal } from './Modal';
import { TypeTag } from './OccurrenceCard';

interface OccurrenceDetailProps {
  occurrence: Occurrence;
  student?: Student;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenStudent: () => void;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Detalhes completos de uma ocorrência. */
export function OccurrenceDetail({ occurrence, student, onClose, onEdit, onDelete, onOpenStudent }: OccurrenceDetailProps) {
  const created = formatTimestamp(occurrence.createdAt);
  const updated = occurrence.updatedAt !== occurrence.createdAt ? formatTimestamp(occurrence.updatedAt) : '';

  return (
    <Modal
      title="Detalhes da ocorrência"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="text-btn danger footer-start" onClick={onDelete}>
            Eliminar
          </button>
          <button type="button" className="btn btn-secondary" onClick={onEdit}>
            Editar
          </button>
          {student && (
            <button type="button" className="btn btn-primary" onClick={onOpenStudent}>
              Ver perfil do aluno
            </button>
          )}
        </>
      }
    >
      <div className="detail-head">
        <TypeTag type={occurrence.type} />
        <time className="detail-date" dateTime={occurrence.date}>
          {formatDate(occurrence.date)}
        </time>
      </div>

      <dl className="detail-grid">
        <div>
          <dt>Aluno</dt>
          <dd>
            {student ? (
              <>
                {student.fullName}
                <span className="dd-sub">Nº {student.processNumber}</span>
              </>
            ) : (
              'Aluno desconhecido'
            )}
          </dd>
        </div>
        {student && (
          <div>
            <dt>Classe e turma</dt>
            <dd>
              {student.grade} · Turma {student.className}
              <span className="dd-sub">{student.schoolYear}</span>
            </dd>
          </div>
        )}
        <div className="detail-wide">
          <dt>Descrição</dt>
          <dd className="detail-text">{occurrence.description}</dd>
        </div>
        <div className="detail-wide">
          <dt>Medida disciplinar ou providência</dt>
          <dd className="detail-text">{occurrence.measure || <span className="muted">Nenhuma medida registada.</span>}</dd>
        </div>
        <div>
          <dt>Responsável pelo registo</dt>
          <dd>{occurrence.recordedBy}</dd>
        </div>
        {created && (
          <div>
            <dt>Registada em</dt>
            <dd>
              {created}
              {updated && <span className="dd-sub">Alterada em {updated}</span>}
            </dd>
          </div>
        )}
      </dl>
    </Modal>
  );
}
