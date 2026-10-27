export type Section = 'dashboard' | 'students';

interface HeaderProps {
  active: Section;
  onNavigate: (section: Section) => void;
  onNewStudent: () => void;
}

const LINKS: { id: Section; label: string }[] = [
  { id: 'dashboard', label: 'Painel' },
  { id: 'students', label: 'Alunos' },
];

export function Header({ active, onNavigate, onNewStudent }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="container header-inner">
        <button type="button" className="brand" onClick={() => onNavigate('dashboard')}>
          <span className="brand-mark" aria-hidden="true">
            Cd
          </span>
          <span className="brand-text">
            <span className="brand-name">Caderneta</span>
            <span className="brand-sub">digital · registo disciplinar</span>
          </span>
        </button>
        <nav className="main-nav" aria-label="Navegação principal">
          {LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              className={`nav-link${active === link.id ? ' active' : ''}`}
              aria-current={active === link.id ? 'page' : undefined}
              onClick={() => onNavigate(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <button type="button" className="btn btn-marker" onClick={onNewStudent}>
          Novo aluno
        </button>
      </div>
    </header>
  );
}
