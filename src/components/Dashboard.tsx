import { useState, type FormEvent } from 'react';
import { sortByMostRecent, type Caderneta } from '../logic/useCaderneta';
import { OCCURRENCE_TYPES } from '../types';
import { formatDate, longToday, todayISO } from '../utils/format';
import { EmptyState } from './EmptyState';
import { TypeTag } from './OccurrenceCard';
import { SearchBox } from './SearchBox';

interface DashboardProps {
  caderneta: Caderneta;
  onSearch: (query: string) => void;
  onSelectStudent: (id: string) => void;
  onNewStudent: () => void;
}

function daysAgoISO(days: number): string {
  const [y, m, d] = todayISO().split('-').map(Number);
  const date = new Date(y, m - 1, d - days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function Dashboard({ caderneta, onSearch, onSelectStudent, onNewStudent }: DashboardProps) {
  const [query, setQuery] = useState('');
  const { students, occurrences, occurrenceCountByStudent } = caderneta;

  const since = daysAgoISO(30);
  const last30 = occurrences.filter((o) => o.date >= since).length;
  const studentsWithOccurrences = students.filter((s) => occurrenceCountByStudent.has(s.id)).length;
  const recent = sortByMostRecent(occurrences).slice(0, 6);
  const studentById = new Map(students.map((s) => [s.id, s]));
  const byType = OCCURRENCE_TYPES.map((t) => ({
    ...t,
    count: occurrences.filter((o) => o.type === t.value).length,
  }));

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const stats = [
    { label: 'alunos registados', value: students.length },
    { label: 'ocorrências no total', value: occurrences.length },
    { label: 'nos últimos 30 dias', value: last30 },
    { label: 'alunos com ocorrências', value: studentsWithOccurrences },
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
        {stats.map((s) => (
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
        <div className="dashboard-grid">
          <div className="panel">
            <h2 className="panel-title">Últimas ocorrências</h2>
            {recent.length === 0 ? (
              <p className="muted">Ainda não foram registadas ocorrências.</p>
            ) : (
              <ul className="recent-list">
                {recent.map((o) => {
                  const student = studentById.get(o.studentId);
                  return (
                    <li key={o.id}>
                      <button type="button" className="recent-item" onClick={() => onSelectStudent(o.studentId)}>
                        <time className="recent-date mono" dateTime={o.date}>
                          {formatDate(o.date)}
                        </time>
                        <span className="recent-who">
                          <span className="recent-name">{student?.fullName ?? 'Aluno desconhecido'}</span>
                          {student && (
                            <span className="muted">
                              {student.grade} · Turma {student.className}
                            </span>
                          )}
                        </span>
                        <TypeTag type={o.type} />
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
      )}
    </section>
  );
}
