interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBox({ value, onChange, placeholder = 'Nome ou nº de processo', autoFocus }: SearchBoxProps) {
  return (
    <div className="search-box">
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m13 13 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Pesquisar alunos"
        autoFocus={autoFocus}
      />
      {value && (
        <button type="button" className="search-clear" onClick={() => onChange('')} aria-label="Limpar pesquisa">
          ×
        </button>
      )}
    </div>
  );
}
