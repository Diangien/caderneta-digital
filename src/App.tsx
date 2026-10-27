import { useCallback, useEffect, useRef, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Header, type Section } from './components/Header';
import { StudentDetail } from './components/StudentDetail';
import { StudentForm } from './components/StudentForm';
import { StudentList } from './components/StudentList';
import { Toasts, type Toast, type ToastKind } from './components/Toasts';
import { useCaderneta } from './logic/useCaderneta';
import type { Student, StudentInput } from './types';

type View = { name: 'dashboard' } | { name: 'students' } | { name: 'student'; id: string };

/** Formulário de aluno aberto: novo (sem aluno) ou edição. */
type StudentFormState = { student?: Student } | null;

export default function App() {
  const caderneta = useCaderneta();
  const [view, setView] = useState<View>({ name: 'dashboard' });
  const [query, setQuery] = useState('');
  const [studentForm, setStudentForm] = useState<StudentFormState>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextToastId = useRef(1);

  const dismissToast = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const notify = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextToastId.current++;
      setToasts((list) => [...list, { id, kind, message }]);
      window.setTimeout(() => dismissToast(id), 4000);
    },
    [dismissToast],
  );

  const navigate = (next: View) => {
    setView(next);
    window.scrollTo({ top: 0 });
  };

  // Se o aluno aberto deixar de existir, volta à lista.
  const selected = view.name === 'student' ? caderneta.students.find((s) => s.id === view.id) : undefined;
  useEffect(() => {
    if (view.name === 'student' && !selected) setView({ name: 'students' });
  }, [view, selected]);

  const saveStudent = (input: StudentInput) => {
    const editing = studentForm?.student;
    const result = editing ? caderneta.updateStudent(editing.id, input) : caderneta.addStudent(input);
    if (result.ok) {
      setStudentForm(null);
      if (editing) {
        notify('success', 'Dados do aluno actualizados com sucesso.');
      } else {
        notify('success', `${input.fullName.trim()} foi registado com sucesso.`);
        if (result.id) navigate({ name: 'student', id: result.id });
      }
    }
    return result;
  };

  const activeSection: Section = view.name === 'dashboard' ? 'dashboard' : 'students';

  return (
    <>
      <Header
        active={activeSection}
        onNavigate={(section) => navigate({ name: section })}
        onNewStudent={() => setStudentForm({})}
      />

      <main className="container main">
        {view.name === 'dashboard' && (
          <Dashboard
            caderneta={caderneta}
            onSearch={(q) => {
              setQuery(q);
              navigate({ name: 'students' });
            }}
            onSelectStudent={(id) => navigate({ name: 'student', id })}
            onNewStudent={() => setStudentForm({})}
          />
        )}

        {view.name === 'students' && (
          <StudentList
            students={caderneta.students}
            occurrenceCount={caderneta.occurrenceCountByStudent}
            query={query}
            onQueryChange={setQuery}
            onSelect={(id) => navigate({ name: 'student', id })}
            onNewStudent={() => setStudentForm({})}
          />
        )}

        {selected && (
          <StudentDetail
            key={selected.id}
            student={selected}
            caderneta={caderneta}
            notify={notify}
            onBack={() => navigate({ name: 'students' })}
            onEdit={() => setStudentForm({ student: selected })}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="container">Caderneta Digital · Os dados são guardados apenas neste navegador.</div>
      </footer>

      {studentForm && (
        <StudentForm
          student={studentForm.student}
          students={caderneta.students}
          onSubmit={saveStudent}
          onClose={() => setStudentForm(null)}
        />
      )}

      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
