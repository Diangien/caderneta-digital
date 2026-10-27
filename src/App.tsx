import { useCallback, useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Dashboard } from './components/Dashboard';
import { Header, type Section } from './components/Header';
import { TypeTag } from './components/OccurrenceCard';
import { OccurrenceDetail } from './components/OccurrenceDetail';
import { OccurrenceForm } from './components/OccurrenceForm';
import { OccurrenceList } from './components/OccurrenceList';
import { StudentDetail } from './components/StudentDetail';
import { StudentForm } from './components/StudentForm';
import { StudentList } from './components/StudentList';
import { Toasts, type Toast, type ToastKind } from './components/Toasts';
import { EMPTY_FILTERS, useCaderneta, type StudentFilters } from './logic/useCaderneta';
import { occurrenceTypeLabel, type OccurrenceInput, type Student, type StudentInput } from './types';
import { formatDate } from './utils/format';

type View = { name: 'dashboard' } | { name: 'students' } | { name: 'occurrences' } | { name: 'student'; id: string };

/** Formulário de aluno aberto: novo (sem aluno) ou edição. */
type StudentFormState = { student?: Student } | null;

/**
 * Janela de ocorrência aberta. `back` indica que a janela foi aberta a partir dos detalhes
 * e que, ao cancelar ou guardar, se deve voltar a eles.
 */
type OccurrenceModal =
  | { mode: 'form'; occurrenceId?: string; studentId?: string; back?: boolean }
  | { mode: 'view'; occurrenceId: string }
  | { mode: 'delete'; occurrenceId: string; back?: boolean }
  | null;

export default function App() {
  const caderneta = useCaderneta();
  const [view, setView] = useState<View>({ name: 'dashboard' });
  const [filters, setFilters] = useState<StudentFilters>(EMPTY_FILTERS);
  const [studentPage, setStudentPage] = useState(1);
  const [occurrencePage, setOccurrencePage] = useState(1);
  const [studentForm, setStudentForm] = useState<StudentFormState>(null);
  const [occurrenceModal, setOccurrenceModal] = useState<OccurrenceModal>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextToastId = useRef(1);

  const dismissToast = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const notify = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextToastId.current++;
      setToasts((list) => [...list, { id, kind, message }]);
      window.setTimeout(() => dismissToast(id), 5000);
    },
    [dismissToast],
  );

  const navigate = (next: View) => {
    setView(next);
    window.scrollTo({ top: 0 });
  };

  const studentById = (id: string) => caderneta.students.find((s) => s.id === id);

  // Se o aluno aberto deixar de existir, volta à lista.
  const selected = view.name === 'student' ? studentById(view.id) : undefined;
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

  // ---------- Ocorrências ----------

  const activeOccurrence =
    occurrenceModal && 'occurrenceId' in occurrenceModal && occurrenceModal.occurrenceId
      ? caderneta.occurrences.find((o) => o.id === occurrenceModal.occurrenceId)
      : undefined;

  const saveOccurrence = (input: OccurrenceInput) => {
    const editing = occurrenceModal?.mode === 'form' ? activeOccurrence : undefined;
    const result = editing ? caderneta.updateOccurrence(editing.id, input) : caderneta.addOccurrence(input);
    if (result.ok) {
      const name = studentById(input.studentId)?.fullName ?? 'aluno';
      const when = formatDate(input.date);
      if (editing) {
        notify('success', `Alterações guardadas na ocorrência de ${name} (${when}).`);
        const back = occurrenceModal?.mode === 'form' && occurrenceModal.back;
        setOccurrenceModal(back ? { mode: 'view', occurrenceId: editing.id } : null);
      } else {
        notify('success', `Ocorrência registada: ${occurrenceTypeLabel(input.type)} — ${name}, ${when}.`);
        setOccurrenceModal(null);
      }
    }
    return result;
  };

  const deleteOccurrence = () => {
    if (!activeOccurrence) return;
    const name = studentById(activeOccurrence.studentId)?.fullName ?? 'aluno';
    const result = caderneta.deleteOccurrence(activeOccurrence.id);
    setOccurrenceModal(null);
    notify(
      result.ok ? 'success' : 'error',
      result.ok
        ? `Ocorrência de ${formatDate(activeOccurrence.date)} eliminada do registo de ${name}.`
        : result.error,
    );
  };

  const occurrenceActions = {
    onRegisterOccurrence: (studentId?: string) => setOccurrenceModal({ mode: 'form', studentId }),
    onViewOccurrence: (occurrenceId: string) => setOccurrenceModal({ mode: 'view', occurrenceId }),
    onEditOccurrence: (occurrenceId: string) => setOccurrenceModal({ mode: 'form', occurrenceId }),
    onDeleteOccurrence: (occurrenceId: string) => setOccurrenceModal({ mode: 'delete', occurrenceId }),
  };

  const activeSection: Section =
    view.name === 'dashboard' ? 'dashboard' : view.name === 'occurrences' ? 'occurrences' : 'students';

  const occurrenceStudent = activeOccurrence ? studentById(activeOccurrence.studentId) : undefined;

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
            onSearch={(query) => {
              setFilters({ ...EMPTY_FILTERS, query });
              setStudentPage(1);
              navigate({ name: 'students' });
            }}
            onViewOccurrence={occurrenceActions.onViewOccurrence}
            onOpenStudent={(id) => navigate({ name: 'student', id })}
            onShowAllOccurrences={() => navigate({ name: 'occurrences' })}
            onNewStudent={() => setStudentForm({})}
          />
        )}

        {view.name === 'students' && (
          <StudentList
            students={caderneta.students}
            occurrenceCount={caderneta.occurrenceCountByStudent}
            filters={filters}
            onFiltersChange={setFilters}
            page={studentPage}
            onPageChange={setStudentPage}
            onSelect={(id) => navigate({ name: 'student', id })}
            onNewStudent={() => setStudentForm({})}
          />
        )}

        {view.name === 'occurrences' && (
          <OccurrenceList
            occurrences={caderneta.occurrences}
            students={caderneta.students}
            page={occurrencePage}
            onPageChange={setOccurrencePage}
            onView={occurrenceActions.onViewOccurrence}
            onNew={() => occurrenceActions.onRegisterOccurrence()}
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
            onRegisterOccurrence={() => occurrenceActions.onRegisterOccurrence(selected.id)}
            onEditOccurrence={occurrenceActions.onEditOccurrence}
            onDeleteOccurrence={occurrenceActions.onDeleteOccurrence}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="container">
          <span>Caderneta Digital</span>
          <span>Os dados ficam guardados apenas neste navegador.</span>
        </div>
      </footer>

      {studentForm && (
        <StudentForm
          student={studentForm.student}
          students={caderneta.students}
          onSubmit={saveStudent}
          onClose={() => setStudentForm(null)}
        />
      )}

      {occurrenceModal?.mode === 'form' && (!occurrenceModal.occurrenceId || activeOccurrence) && (
        <OccurrenceForm
          students={caderneta.students}
          occurrence={activeOccurrence}
          defaultStudentId={occurrenceModal.studentId}
          onSubmit={saveOccurrence}
          onClose={() =>
            setOccurrenceModal(
              occurrenceModal.back && activeOccurrence ? { mode: 'view', occurrenceId: activeOccurrence.id } : null,
            )
          }
        />
      )}

      {occurrenceModal?.mode === 'view' && activeOccurrence && (
        <OccurrenceDetail
          occurrence={activeOccurrence}
          student={occurrenceStudent}
          onClose={() => setOccurrenceModal(null)}
          onEdit={() => setOccurrenceModal({ mode: 'form', occurrenceId: activeOccurrence.id, back: true })}
          onDelete={() => setOccurrenceModal({ mode: 'delete', occurrenceId: activeOccurrence.id, back: true })}
          onOpenStudent={() => {
            setOccurrenceModal(null);
            navigate({ name: 'student', id: activeOccurrence.studentId });
          }}
        />
      )}

      {occurrenceModal?.mode === 'delete' && activeOccurrence && (
        <ConfirmDialog
          title="Eliminar ocorrência?"
          message={
            <>
              <div className="confirm-summary">
                <TypeTag type={activeOccurrence.type} />
                <span>
                  <strong>{occurrenceStudent?.fullName ?? 'Aluno desconhecido'}</strong> ·{' '}
                  {formatDate(activeOccurrence.date)}
                </span>
                <span className="confirm-excerpt">{activeOccurrence.description}</span>
              </div>
              <p>A ocorrência será removida do histórico do aluno. Esta acção não pode ser desfeita.</p>
            </>
          }
          confirmLabel="Eliminar ocorrência"
          onConfirm={deleteOccurrence}
          onCancel={() =>
            setOccurrenceModal(occurrenceModal.back ? { mode: 'view', occurrenceId: activeOccurrence.id } : null)
          }
        />
      )}

      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
