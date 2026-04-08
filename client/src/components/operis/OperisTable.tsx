import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export interface OperisTableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

interface OperisTableProps<T> {
  columns: OperisTableColumn<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  striped?: boolean;
  compact?: boolean;
}

type SortDirection = "asc" | "desc" | null;

export default function OperisTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  loading = false,
  emptyMessage = "Nenhum registro encontrado.",
  onRowClick,
  striped = false,
  compact = false,
}: OperisTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [hoveredRow, setHoveredRow] = useState<string | number | null>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === "asc" ? "desc" : prev === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const av = a[sortKey];
    const bv = b[sortKey];
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    const cmp = String(av).localeCompare(String(bv), "pt-BR", { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  const cellPad = compact ? "0.5rem 0.75rem" : "0.75rem 1rem";
  const fontSize = compact ? "0.8125rem" : "0.875rem";

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        borderRadius: "0.5rem",
        border: "1px solid #2D3748",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <thead>
          <tr style={{ background: "#111827", borderBottom: "1px solid #1E293B" }}>
            {columns.map(col => {
              const isSorted = sortKey === String(col.key);
              return (
                <th
                  key={String(col.key)}
                  style={{
                    padding: cellPad,
                    textAlign: col.align ?? "left",
                    width: col.width,
                    color: "#94A3B8",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    cursor: col.sortable ? "pointer" : "default",
                    userSelect: "none",
                    borderBottom: "1px solid #1E293B",
                    transition: "color 0.12s",
                  }}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                  onMouseEnter={e => {
                    if (col.sortable) (e.currentTarget as HTMLTableCellElement).style.color = "#E2E8F0";
                  }}
                  onMouseLeave={e => {
                    if (col.sortable) (e.currentTarget as HTMLTableCellElement).style.color = "#94A3B8";
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                    {col.label}
                    {col.sortable && (
                      <span style={{ display: "inline-flex", opacity: isSorted ? 1 : 0.4 }}>
                        {isSorted && sortDir === "asc"  ? <ChevronUp size={12} /> :
                         isSorted && sortDir === "desc" ? <ChevronDown size={12} /> :
                         <ChevronsUpDown size={12} />}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* ─── Body ────────────────────────────────────────────────────────── */}
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: "2rem", textAlign: "center", color: "#475569" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: 16, height: 16,
                      border: "2px solid #334155",
                      borderTopColor: "#2563EB",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Carregando...
                </div>
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: "2.5rem", textAlign: "center", color: "#475569", fontStyle: "italic" }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => {
              const rowKey = String(row[keyField]);
              const isHovered = hoveredRow === rowKey;
              const isAlt = striped && rowIndex % 2 === 1;
              return (
                <tr
                  key={rowKey}
                  style={{
                    background: isHovered
                      ? "#1A2332"
                      : isAlt
                      ? "#0F172A"
                      : "transparent",
                    borderBottom: "1px solid #1E293B",
                    cursor: onRowClick ? "pointer" : "default",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={() => setHoveredRow(rowKey)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => {
                    const value = row[String(col.key)];
                    return (
                      <td
                        key={String(col.key)}
                        style={{
                          padding: cellPad,
                          textAlign: col.align ?? "left",
                          color: "#E2E8F0",
                          verticalAlign: "middle",
                        }}
                      >
                        {col.render ? col.render(value, row, rowIndex) : String(value ?? "")}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
