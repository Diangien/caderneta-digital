import { searchStudents } from '../logic/useCaderneta';
import type { Student } from '../types';
import { initials } from '../utils/format';
import { EmptyState } from './EmptyState';
import { SearchBox } from './SearchBox';

interface StudentListProps {
  students: Student[];
  occurrenceCount: Map<string, number>;
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (id: string) => void;
  onNewStudent: () => void;
}

export function StudentList({ students, occurrenceCount, query, onQueryChange, onSelect, onNewStudent }: StudentListProps) {
  const results = searchStudents(students, query);
  const searching = query.trim() !== '';

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Alunos</h1>
          <p className="muted">
            {searching
              ? `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'} de ${students.length} alunos`
              : `${students.length} ${students.length === 1 ? 'aluno registado' : 'alunos registados'}`}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onNewStudent}>
          + Novo aluno
        </button>
      </div>

      {students.length === 0 ? (
        <EmptyState
          title="Ainda não existem alunos registados"
          description="Registe o primeiro aluno para começar a acompanhar o seu percurso disciplinar."
          action={
            <button type="button" className="btn btn-primary" onClick={onNewStudent}>
              Registar aluno
            </button>
          }
        />
      ) : (
        <>
          <SearchBox value={query} onChange={onQueryChange} autoFocus={searching} />
          {results.length === 0 ? (
            <EmptyState
              title="Nenhum aluno encontrado"
              description={`Não existe nenhum aluno com nome ou número de processo correspondente a "${query.trim()}".`}
              action={
                <button type="button" className="btn btn-secondary" onClick={() => onQueryChange('')}>
                  Limpar pesquisa
                </button>
              }
            />
          ) : (
            <ul className="student-list">
              {results.map((s) => {
                const count = occurrenceCount.get(s.id) ?? 0;
                return (
                  <li key={s.id}>
                    <button type="button" className="student-row" onClick={() => onSelect(s.id)}>
                      <span className="avatar" aria-hidden="true">
                        {initials(s.fullName)}
                      </span>
                      <span className="student-main">
                        <span className="student-name">{s.fullName}</span>
                        <span className="muted">Nº {s.processNumber}</span>
                      </span>
                      <span className="student-class">
                        {s.grade} · Turma {s.className}
                        <span className="muted"> · {s.schoolYear}</span>
                      </span>
                      <span className={`count-badge${count > 0 ? ' has-items' : ''}`}>
                        {count} {count === 1 ? 'ocorrência' : 'ocorrências'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
