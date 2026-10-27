import { useMemo, useState, type FormEvent } from 'react';
import { computeIndicators, countByType } from '../logic/statistics';
import { sortByMostRecent, type Caderneta } from '../logic/useCaderneta';
import { formatDate, longToday } from '../utils/format';
import { ClassStatistics } from './ClassStatistics';
import { EmptyState } from './EmptyState';
import { TypeTag } from './OccurrenceCard';
import { SearchBox } from './SearchBox';

interface DashboardProps {
  caderneta: Caderneta;
  onSearch: (query: string) => void;
  onViewOccurrence: (occurrenceId: string) => void;
  onOpenStudent: (studentId: string) => void;
  onShowAllOccurrences: () => void;
  onNewStudent: () => void;
}

export function Dashboard({
  caderneta,
  onSearch,
  onViewOccurrence,
  onOpenStudent,
  onShowAllOccurrences,
  onNewStudent,
}: DashboardProps) {
  const [query, setQuery] = useState('');
  const { students, occurrences } = caderneta;

  const indicators = useMemo(() => computeIndicators(students, occurrences), [students, occurrences]);
  const recent = sortByMostRecent(occurrences).slice(0, 6);
  const studentById = new Map(students.map((s) => [s.id, s]));
  const byType = countByType(occurrences);
  const monthName = new Date().toLocaleDateString('pt-PT', { month: 'long' });

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const ledger = [
    { label: 'alunos registados', value: indicators.students },
    { label: 'ocorrências disciplinares', value: indicators.occurrences },
    { label: 'alunos com pelo menos uma ocorrência', value: indicators.studentsWithOccurrences },
    { label: `ocorrências em ${monthName}`, value: indicators.occurrencesThisMonth },
  ];

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">{longToday()}</p>
          <h1>Painel</h1>
        </div>
        {students.length > 0 && (
          <form className="hero-search" onSubmit={submitSearch} role="search">
            <SearchBox value={query} onChange={setQuery} />
            <button type="submit" className="btn btn-primary">
              Procurar
            </button>
          </form>
        )}
      </div>

      <div className="ledger">
        {ledger.map((s) => (
          <p key={s.label} className="ledger-item">
            <span className="ledger-value">{s.value}</span>
            <span className="ledger-label">{s.label}</span>
          </p>
        ))}
      </div>

      {students.length === 0 ? (
        <EmptyState
          title="A caderneta está vazia"
          description="Comece por registar os alunos da instituição."
          action={
            <button type="button" className="btn btn-primary" onClick={onNewStudent}>
              Registar aluno
            </button>
          }
        />
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="panel">
              <div className="panel-title panel-title-row">
                <h2>Ocorrências mais recentes</h2>
                {occurrences.length > 0 && (
                  <button type="button" className="text-btn" onClick={onShowAllOccurrences}>
                    Ver todas →
                  </button>
                )}
              </div>
              {recent.length === 0 ? (
                <p className="muted panel-empty">Ainda não foram registadas ocorrências.</p>
              ) : (
                <ul className="recent-list">
                  {recent.map((o) => {
                    const student = studentById.get(o.studentId);
                    return (
                      <li key={o.id} className="recent-row">
                        <time className="recent-date mono" dateTime={o.date}>
                          {formatDate(o.date)}
                        </time>
                        <span className="recent-who">
                          {student ? (
                            <button
                              type="button"
                              className="recent-name"
                              onClick={() => onOpenStudent(student.id)}
                              title="Abrir o perfil do aluno"
                            >
                              {student.fullName}
                            </button>
                          ) : (
                            <span className="recent-name">Aluno desconhecido</span>
                          )}
                          <span className="recent-meta">
                            <TypeTag type={o.type} />
                            {student && (
                              <span className="muted">
                                {student.grade} · Turma {student.className}
                              </span>
                            )}
                          </span>
                        </span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onViewOccurrence(o.id)}
                          aria-label={`Ver detalhes da ocorrência de ${formatDate(o.date)}`}
                        >
                          Detalhes
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="panel">
              <h2 className="panel-title">Distribuição por tipo</h2>
              {occurrences.length > 0 && (
                <div className="stack-bar" aria-hidden="true">
                  {byType
                    .filter((t) => t.count > 0)
                    .map((t) => (
                      <span key={t.value} className={`t-${t.value}`} style={{ flexGrow: t.count }} />
                    ))}
                </div>
              )}
              <ul className="type-legend">
                {byType.map((t) => (
                  <li key={t.value} className={t.count === 0 ? 'zero' : ''}>
                    <TypeTag type={t.value} />
                    <span className="legend-count">{t.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ClassStatistics students={students} occurrences={occurrences} />
        </>
      )}
    </section>
  );
}
