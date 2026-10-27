import { occurrenceTypeLabel, type Occurrence, type OccurrenceType } from '../types';
import { dateParts } from '../utils/format';

/** Etiqueta do tipo de ocorrência: marca de cor + nome. */
export function TypeTag({ type }: { type: OccurrenceType }) {
  return (
    <span className={`type-tag t-${type}`}>
      <span className="type-swatch" aria-hidden="true" />
      {occurrenceTypeLabel(type)}
    </span>
  );
}

interface OccurrenceCardProps {
  occurrence: Occurrence;
  onEdit: () => void;
  onDelete: () => void;
}

/** Entrada da cronologia disciplinar: data à esquerda, conteúdo à direita. */
export function OccurrenceCard({ occurrence, onEdit, onDelete }: OccurrenceCardProps) {
  const { day, month, year } = dateParts(occurrence.date);
  return (
    <li className={`entry t-${occurrence.type}`}>
      <time className="entry-date" dateTime={occurrence.date}>
        <span className="entry-day">{day}</span>
        <span className="entry-month">
          {month} {year}
        </span>
      </time>
      <span className="entry-dot" aria-hidden="true" />
      <article className="entry-body">
        <TypeTag type={occurrence.type} />
        <p className="entry-description">{occurrence.description}</p>
        {occurrence.measure && (
          <p className="entry-measure">
            <span className="entry-label">Medida aplicada</span>
            {occurrence.measure}
          </p>
        )}
        <footer className="entry-footer">
          <span>Registado por {occurrence.recordedBy}</span>
          <span className="entry-actions">
            <button type="button" className="text-btn" onClick={onEdit}>
              Editar
            </button>
            <button type="button" className="text-btn danger" onClick={onDelete}>
              Eliminar
            </button>
          </span>
        </footer>
      </article>
    </li>
  );
}
