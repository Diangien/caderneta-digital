import type { ReactNode } from 'react';
import { occurrenceTypeLabel, type Occurrence, type OccurrenceType } from '../types';
import { dateParts } from '../utils/format';

/** Ícone próprio de cada tipo, para que a identificação não dependa só da cor. */
const TYPE_ICONS: Record<OccurrenceType, ReactNode> = {
  // triângulo de aviso
  indisciplina: <path d="M6 1.2 11.2 10.4H.8Z M6 4.6v2.6 M6 8.6v.1" />,
  // relógio
  atraso: <path d="M6 1.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Z M6 3.6V6l1.8 1.2" />,
  // balão de fala
  falta_respeito: <path d="M1.5 2h9v6.2H5.2L2.6 10.4V8.2H1.5Z" />,
  // dois traços cruzados
  conflito: <path d="M2 2l8 8 M10 2 2 10" />,
  // folha com regras
  incumprimento: <path d="M2.5 1.2h7v9.6h-7Z M4.4 4h3.2 M4.4 6h3.2 M4.4 8h2" />,
  // três pontos
  outros: <path d="M2.5 6h.1 M6 6h.1 M9.5 6h.1" />,
};

/** Etiqueta discreta do tipo de ocorrência: ícone + nome, com a cor como reforço. */
export function TypeTag({ type }: { type: OccurrenceType }) {
  return (
    <span className={`type-tag t-${type}`}>
      <svg className="type-icon" viewBox="0 0 12 12" aria-hidden="true">
        {TYPE_ICONS[type]}
      </svg>
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
