interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export function SearchBox({ value, onChange, autoFocus }: SearchBoxProps) {
  return (
    <div className="search-box">
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m14 14 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nome ou nº de processo"
        aria-label="Pesquisar alunos por nome ou número de processo"
        autoFocus={autoFocus}
      />
    </div>
  );
}
