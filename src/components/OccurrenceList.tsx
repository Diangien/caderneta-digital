import { sortByMostRecent } from '../logic/useCaderneta';
import type { Occurrence, Student } from '../types';
import { formatDate } from '../utils/format';
import { EmptyState } from './EmptyState';
import { TypeTag } from './OccurrenceCard';
import { Pagination } from './Pagination';

const PAGE_SIZE = 10;

interface OccurrenceListProps {
  occurrences: Occurrence[];
  students: Student[];
  page: number;
  onPageChange: (page: number) => void;
  onView: (occurrenceId: string) => void;
  onNew: () => void;
}

export function OccurrenceList({ occurrences, students, page, onPageChange, onView, onNew }: OccurrenceListProps) {
  const studentById = new Map(students.map((s) => [s.id, s]));
  const sorted = sortByMostRecent(occurrences);
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Registo disciplinar</p>
          <h1>Ocorrências</h1>
        </div>
        {students.length > 0 && (
          <button type="button" className="btn btn-primary" onClick={onNew}>
            Registar ocorrência
          </button>
        )}
      </div>

      {occurrences.length === 0 ? (
        <EmptyState
          title="Ainda não há ocorrências registadas"
          description={
            students.length === 0
              ? 'Registe primeiro um aluno; depois poderá associar-lhe ocorrências disciplinares.'
              : 'Quando registar uma ocorrência, ela aparecerá aqui, da mais recente para a mais antiga.'
          }
          action={
            students.length > 0 && (
              <button type="button" className="btn btn-primary" onClick={onNew}>
                Registar ocorrência
              </button>
            )
          }
        />
      ) : (
        <>
          <p className="results-line">
            <span>
              <strong>{occurrences.length}</strong> {occurrences.length === 1 ? 'ocorrência' : 'ocorrências'} · mais
              recentes primeiro
            </span>
          </p>
          <ul className="occ-list">
            {visible.map((o) => {
              const student = studentById.get(o.studentId);
              return (
                <li key={o.id} className="occ-row">
                  <time className="occ-date mono" dateTime={o.date}>
                    {formatDate(o.date)}
                  </time>
                  <div className="occ-main">
                    <p className="occ-who">
                      <span className="occ-name">{student?.fullName ?? 'Aluno desconhecido'}</span>
                      {student && (
                        <span className="muted">
                          {student.grade} · Turma {student.className}
                        </span>
                      )}
                    </p>
                    <TypeTag type={o.type} />
                    <p className="occ-summary">{o.description}</p>
                    {o.measure && (
                      <p className="occ-measure">
                        <span className="entry-label">Medida</span>
                        {o.measure}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm occ-open"
                    onClick={() => onView(o.id)}
                    aria-label={`Ver detalhes da ocorrência de ${formatDate(o.date)}${student ? ` — ${student.fullName}` : ''}`}
                  >
                    Ver detalhes
                  </button>
                </li>
              );
            })}
          </ul>
          <Pagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            total={sorted.length}
            onPageChange={(p) => {
              onPageChange(p);
              window.scrollTo({ top: 0 });
            }}
            label="Paginação das ocorrências"
          />
        </>
      )}
    </section>
  );
}
