import { filterStudents, EMPTY_FILTERS, type StudentFilters } from '../logic/useCaderneta';
import type { Student } from '../types';
import { compareGrades } from '../utils/format';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';
import { SearchBox } from './SearchBox';

export const PAGE_SIZE = 10;

interface StudentListProps {
  students: Student[];
  occurrenceCount: Map<string, number>;
  filters: StudentFilters;
  onFiltersChange: (filters: StudentFilters) => void;
  page: number;
  onPageChange: (page: number) => void;
  onSelect: (id: string) => void;
  onNewStudent: () => void;
}

/** Contagem com marcas de registo (até 5) — dá uma leitura rápida da gravidade. */
function Tally({ count }: { count: number }) {
  return (
    <span className={`tally${count === 0 ? ' zero' : ''}`} aria-label={`${count} ${count === 1 ? 'ocorrência' : 'ocorrências'}`}>
      <span className="tally-num">{count}</span>
      <span className="tally-marks" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < count ? 'on' : ''} />
        ))}
      </span>
    </span>
  );
}

export function StudentList({
  students,
  occurrenceCount,
  filters,
  onFiltersChange,
  page,
  onPageChange,
  onSelect,
  onNewStudent,
}: StudentListProps) {
  const results = filterStudents(students, filters);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const filtering = filters.query.trim() !== '' || filters.grade !== '' || filters.className !== '';

  // Opções dos filtros a partir dos dados existentes; as turmas dependem da classe escolhida.
  const gradeOptions = [...new Set(students.map((s) => s.grade))].sort(compareGrades);
  const classOptions = [
    ...new Set(students.filter((s) => !filters.grade || s.grade === filters.grade).map((s) => s.className)),
  ].sort((a, b) => a.localeCompare(b, 'pt'));

  // Qualquer alteração aos filtros volta à primeira página.
  const update = (patch: Partial<StudentFilters>) => {
    onFiltersChange({ ...filters, ...patch });
    onPageChange(1);
  };

  const changeGrade = (grade: string) => {
    const stillValid = students.some((s) => (!grade || s.grade === grade) && s.className === filters.className);
    update({ grade, className: stillValid ? filters.className : '' });
  };

  const describeFilters = () => {
    const parts: string[] = [];
    if (filters.query.trim()) parts.push(`“${filters.query.trim()}”`);
    if (filters.grade) parts.push(filters.grade);
    if (filters.className) parts.push(`turma ${filters.className}`);
    return parts.join(', ');
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Registo de alunos</p>
          <h1>Alunos</h1>
        </div>
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
          <div className="filter-bar" role="search">
            <SearchBox
              value={filters.query}
              onChange={(query) => update({ query })}
              placeholder="Nome, nº, classe ou turma"
              autoFocus={filters.query !== ''}
            />
            <label className="filter">
              <span>Classe</span>
              <select value={filters.grade} onChange={(e) => changeGrade(e.target.value)}>
                <option value="">Todas</option>
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <label className="filter">
              <span>Turma</span>
              <select value={filters.className} onChange={(e) => update({ className: e.target.value })}>
                <option value="">Todas</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="results-line" aria-live="polite">
            <span>
              {filtering ? (
                <>
                  <strong>{results.length}</strong> de {students.length} alunos
                </>
              ) : (
                <>
                  <strong>{students.length}</strong> {students.length === 1 ? 'aluno registado' : 'alunos registados'}
                </>
              )}
            </span>
            {filtering && (
              <button type="button" className="text-btn" onClick={() => update(EMPTY_FILTERS)}>
                Limpar filtros
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <EmptyState
              title="Nenhum aluno encontrado"
              description={`Não há alunos que correspondam a ${describeFilters()}. Verifique a ortografia ou alargue os filtros.`}
              action={
                <button type="button" className="btn btn-secondary" onClick={() => update(EMPTY_FILTERS)}>
                  Limpar filtros
                </button>
              }
            />
          ) : (
            <>
              <table className="roster">
                <thead>
                  <tr>
                    <th scope="col">Nome completo</th>
                    <th scope="col">Nº processo</th>
                    <th scope="col">Classe</th>
                    <th scope="col">Turma</th>
                    <th scope="col" className="col-count">
                      Ocorrências
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((s) => (
                    <tr key={s.id} onClick={() => onSelect(s.id)}>
                      <td className="col-name">
                        <button
                          type="button"
                          className="row-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(s.id);
                          }}
                        >
                          {s.fullName}
                        </button>
                      </td>
                      <td className="col-process mono">{s.processNumber}</td>
                      <td className="col-grade">{s.grade}</td>
                      <td className="col-class">
                        <span className="mobile-only">Turma </span>
                        {s.className}
                      </td>
                      <td className="col-count">
                        <Tally count={occurrenceCount.get(s.id) ?? 0} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                page={currentPage}
                pageSize={PAGE_SIZE}
                total={results.length}
                onPageChange={(p) => {
                  onPageChange(p);
                  window.scrollTo({ top: 0 });
                }}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}
