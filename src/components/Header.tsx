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
          <svg className="brand-logo" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="currentColor" />
            <path d="M9 8h10a4 4 0 0 1 4 4v12H13a4 4 0 0 1-4-4z" fill="#fff" />
            <path d="M13 13h6M13 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>
            <span className="brand-name">Caderneta Digital</span>
            <span className="brand-tagline">Alunos e ocorrências disciplinares</span>
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
          <button type="button" className="btn btn-primary btn-sm" onClick={onNewStudent}>
            + Novo aluno
          </button>
        </nav>
      </div>
    </header>
  );
}
