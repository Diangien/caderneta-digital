import { useState, type FormEvent } from 'react';
import { sortByMostRecent, type Caderneta } from '../logic/useCaderneta';
import { OCCURRENCE_TYPES } from '../types';
import { formatDate, todayISO } from '../utils/format';
import { EmptyState } from './EmptyState';
import { TypeBadge } from './OccurrenceCard';
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
  const recent = sortByMostRecent(occurrences).slice(0, 5);
  const studentById = new Map(students.map((s) => [s.id, s]));
  const byType = OCCURRENCE_TYPES.map((t) => ({
    ...t,
    count: occurrences.filter((o) => o.type === t.value).length,
  }));
  const maxType = Math.max(1, ...byType.map((t) => t.count));

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const stats = [
    { label: 'Alunos registados', value: students.length },
    { label: 'Ocorrências registadas', value: occurrences.length },
    { label: 'Ocorrências nos últimos 30 dias', value: last30 },
    { label: 'Alunos com ocorrências', value: studentsWithOccurrences },
  ];

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Painel</h1>
          <p className="muted">Resumo da caderneta disciplinar da escola.</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="card stat-card">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
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
          <form className="card quick-search" onSubmit={submitSearch} role="search">
            <h2>Localizar aluno</h2>
            <div className="quick-search-row">
              <SearchBox value={query} onChange={setQuery} />
              <button type="submit" className="btn btn-primary">
                Pesquisar
              </button>
            </div>
          </form>

          <div className="dashboard-grid">
            <div className="card">
              <h2>Ocorrências recentes</h2>
              {recent.length === 0 ? (
                <p className="muted">Ainda não foram registadas ocorrências.</p>
              ) : (
                <ul className="recent-list">
                  {recent.map((o) => {
                    const student = studentById.get(o.studentId);
                    return (
                      <li key={o.id}>
                        <button type="button" className="recent-item" onClick={() => onSelectStudent(o.studentId)}>
                          <span className="recent-top">
                            <strong>{student?.fullName ?? 'Aluno desconhecido'}</strong>
                            <time dateTime={o.date}>{formatDate(o.date)}</time>
                          </span>
                          <span className="recent-bottom">
                            <TypeBadge type={o.type} />
                            {student && (
                              <span className="muted">
                                {student.grade} · Turma {student.className}
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="card">
              <h2>Ocorrências por tipo</h2>
              <ul className="type-bars">
                {byType.map((t) => (
                  <li key={t.value}>
                    <span className="type-bar-label">{t.label}</span>
                    <span className="type-bar-track">
                      <span className={`type-bar-fill type-${t.value}`} style={{ width: `${(t.count / maxType) * 100}%` }} />
                    </span>
                    <span className="type-bar-count">{t.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
