interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const pageCount = Math.ceil(total / pageSize);
  if (pageCount <= 1) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav className="pagination" aria-label="Paginação da lista de alunos">
      <span className="pagination-info">
        {first}–{last} de {total}
      </span>
      <div className="pagination-pages">
        <button type="button" className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          ← Anterior
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            className={`page-btn page-num${n === page ? ' active' : ''}`}
            aria-current={n === page ? 'page' : undefined}
            aria-label={`Página ${n}`}
            onClick={() => onPageChange(n)}
          >
            {n}
          </button>
        ))}
        <button type="button" className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page === pageCount}>
          Seguinte →
        </button>
      </div>
    </nav>
  );
}
