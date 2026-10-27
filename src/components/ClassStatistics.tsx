import { statsByClass, statsByGrade } from '../logic/statistics';
import type { Occurrence, Student } from '../types';

interface ClassStatisticsProps {
  students: Student[];
  occurrences: Occurrence[];
}

/** Número com barra proporcional ao maior valor da coluna. */
function BarValue({ value, max, tone }: { value: number; max: number; tone: 'students' | 'occurrences' }) {
  return (
    <span className="bar-value">
      <span className="bar-track" aria-hidden="true">
        <span className={`bar-fill ${tone}`} style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
      </span>
      <span className="bar-num">{value}</span>
    </span>
  );
}

export function ClassStatistics({ students, occurrences }: ClassStatisticsProps) {
  const byGrade = statsByGrade(students, occurrences);
  const byClass = statsByClass(students);
  const maxStudents = Math.max(0, ...byGrade.map((g) => g.students));
  const maxOccurrences = Math.max(0, ...byGrade.map((g) => g.occurrences));
  const maxClass = Math.max(0, ...byClass.map((c) => c.students));
  const totalOccurrences = byGrade.reduce((sum, g) => sum + g.occurrences, 0);

  return (
    <section className="stats-section" aria-labelledby="stats-title">
      <div className="section-head">
        <p className="eyebrow">Estatísticas</p>
        <h2 id="stats-title">Por classe e turma</h2>
      </div>

      <div className="stats-grid">
        <div className="panel">
          <h3 className="panel-title">Alunos e ocorrências por classe</h3>
          <table className="stat-table">
            <thead>
              <tr>
                <th scope="col">Classe</th>
                <th scope="col">Alunos</th>
                <th scope="col">Ocorrências</th>
              </tr>
            </thead>
            <tbody>
              {byGrade.map((g) => (
                <tr key={g.grade}>
                  <th scope="row">{g.grade}</th>
                  <td>
                    <BarValue value={g.students} max={maxStudents} tone="students" />
                  </td>
                  <td>
                    <BarValue value={g.occurrences} max={maxOccurrences} tone="occurrences" />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td>{students.length}</td>
                <td>{totalOccurrences}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="panel">
          <h3 className="panel-title">Alunos por turma</h3>
          <table className="stat-table">
            <thead>
              <tr>
                <th scope="col">Classe</th>
                <th scope="col">Turma</th>
                <th scope="col">Alunos</th>
              </tr>
            </thead>
            <tbody>
              {byClass.map((c) => (
                <tr key={`${c.grade}|${c.className}`}>
                  <td className="muted">{c.grade}</td>
                  <th scope="row">{c.className}</th>
                  <td>
                    <BarValue value={c.students} max={maxClass} tone="students" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
