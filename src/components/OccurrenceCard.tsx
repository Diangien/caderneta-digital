import { occurrenceTypeLabel, type Occurrence, type OccurrenceType } from '../types';
import { formatDate } from '../utils/format';

export function TypeBadge({ type }: { type: OccurrenceType }) {
  return <span className={`type-badge type-${type}`}>{occurrenceTypeLabel(type)}</span>;
}

interface OccurrenceCardProps {
  occurrence: Occurrence;
  onEdit: () => void;
  onDelete: () => void;
}

export function OccurrenceCard({ occurrence, onEdit, onDelete }: OccurrenceCardProps) {
  return (
    <article className={`occurrence-card type-border-${occurrence.type}`}>
      <header className="occurrence-header">
        <div className="occurrence-meta">
          <TypeBadge type={occurrence.type} />
          <time dateTime={occurrence.date}>{formatDate(occurrence.date)}</time>
        </div>
        <div className="occurrence-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onEdit}>
            Editar
          </button>
          <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={onDelete}>
            Eliminar
          </button>
        </div>
      </header>
      <p className="occurrence-description">{occurrence.description}</p>
      <dl className="occurrence-details">
        <div>
          <dt>Medida / providência</dt>
          <dd>{occurrence.measure || <span className="muted">Nenhuma medida registada</span>}</dd>
        </div>
        <div>
          <dt>Registado por</dt>
          <dd>{occurrence.recordedBy}</dd>
        </div>
      </dl>
    </article>
  );
}
