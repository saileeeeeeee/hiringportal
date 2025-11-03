// src/pages/ApplicantsTable.tsx
import { useMemo, useState, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  flexRender,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Download } from 'lucide-react';
import ScheduleInterviewModal from '@/components/ScheduleInterviewModal';
import Papa from 'papaparse';

console.log("ApplicantsTable.tsx: LOADED");

interface ApplicantWithScore {
  application_id: number;
  job_id: number | null;
  applicant_id: number | null;
  applied_date: string | null;
  source: string | null;
  skills_matching_score: number | null;
  jd_matching_score: number | null;
  resume_overall_score: number | null;
  application_status: string | null;

  first_name: string | null;
  last_name: string | null;
  email: string | null;
  experience_years: number | null;
  current_role: string | null;
  skills: string | null;
  location: string | null;
}

interface Props {
  applicants: ApplicantWithScore[];
  onRefresh: () => void;
}

export default function ApplicantsTable({ applicants, onRefresh }: Props) {
  console.log("RENDERING", applicants.length, "applicants");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // SEARCH: Filter by name OR email
  const filteredData = useMemo(() => {
    if (!globalFilter.trim()) return applicants;
    const lower = globalFilter.toLowerCase();
    return applicants.filter(a => {
      const name = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
      const email = (a.email || '').toLowerCase();
      return name.includes(lower) || email.includes(lower);
    });
  }, [applicants, globalFilter]);

  const columns = useMemo<ColumnDef<ApplicantWithScore>[]>(() => [
    // 1. Select
    {
      id: 'select',
      header: ({ table }) => {
        const ref = useRef<HTMLInputElement>(null);
        useEffect(() => {
          if (ref.current) ref.current.indeterminate = table.getIsSomeRowsSelected();
        }, [table.getIsSomeRowsSelected()]);
        return (
          <input
            ref={ref}
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="w-4 h-4 rounded border-border cursor-pointer"
          />
        );
      },
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="w-4 h-4 rounded border-border cursor-pointer"
        />
      ),
    },

    // 2. Applicant (Sortable + Searchable)
    {
      accessorFn: (row) => `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      id: 'applicant',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 font-medium"
        >
          Applicant
          {column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : column.getIsSorted() === 'desc' ? <ChevronDown className="w-4 h-4" /> : null}
        </button>
      ),
      cell: ({ row }) => (
        <div className="min-w-[200px]">
          <p className="font-medium text-foreground">
            {(row.original.first_name || '').trim() || 'Unknown'} {(row.original.last_name || '').trim() || 'Applicant'}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
            {row.original.email || 'N/A'}
          </p>
        </div>
      ),
    },

    // 3. Job ID (Sortable)
    {
      accessorKey: 'job_id',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 font-medium"
        >
          Job ID
          {column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : column.getIsSorted() === 'desc' ? <ChevronDown className="w-4 h-4" /> : null}
        </button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.original.job_id ?? '—'}</span>,
    },

    // 4. Applied On (Sortable)
    {
      accessorKey: 'applied_date',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 font-medium"
        >
          Applied On
          {column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : column.getIsSorted() === 'desc' ? <ChevronDown className="w-4 h-4" /> : null}
        </button>
      ),
      cell: ({ row }) => {
        const date = row.original.applied_date;
        if (!date) return '—';
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
      },
    },

    // 5. Source (Sortable)
    {
      accessorKey: 'source',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 font-medium"
        >
          Source
          {column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : column.getIsSorted() === 'desc' ? <ChevronDown className="w-4 h-4" /> : null}
        </button>
      ),
      cell: ({ row }) => {
        const s = row.original.source;
        return s && s !== 'string' ? s : '—';
      },
    },

    // 6. Skills Score (Sortable)
    {
      accessorKey: 'skills_matching_score',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 font-medium"
        >
          Skills Score
          {column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : column.getIsSorted() === 'desc' ? <ChevronDown className="w-4 h-4" /> : null}
        </button>
      ),
      cell: ({ row }) => {
        const s = row.original.skills_matching_score;
        return s !== null ? `${(s * 100).toFixed(0)}%` : '—';
      },
    },

    // 7. JD Score (Sortable)
    {
      accessorKey: 'jd_matching_score',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 font-medium"
        >
          JD Score
          {column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : column.getIsSorted() === 'desc' ? <ChevronDown className="w-4 h-4" /> : null}
        </button>
      ),
      cell: ({ row }) => {
        const s = row.original.jd_matching_score;
        return s !== null ? `${(s * 100).toFixed(0)}%` : '—';
      },
    },

    // 8. Resume Score (Sortable)
    {
      accessorKey: 'resume_overall_score',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 font-medium"
        >
          Resume Score
          {column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : column.getIsSorted() === 'desc' ? <ChevronDown className="w-4 h-4" /> : null}
        </button>
      ),
      cell: ({ row }) => {
        const s = row.original.resume_overall_score;
        if (s === null) return '—';
        const score = (s * 100).toFixed(0);
        const color = s >= 0.85 ? 'text-green-600' : s >= 0.70 ? 'text-blue-600' : s >= 0.60 ? 'text-yellow-600' : 'text-red-600';
        return <span className={`font-bold ${color}`}>{score}%</span>;
      },
    },

    // 9. Experience (Sortable + FULL WIDTH)
    {
      accessorKey: 'experience_years',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 font-medium"
        >
          Experience
          {column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : column.getIsSorted() === 'desc' ? <ChevronDown className="w-4 h-4" /> : null}
        </button>
      ),
      cell: ({ row }) => `${row.original.experience_years ?? 0} years`,
    },

    // 10. Current Role (Sortable)
    {
      accessorKey: 'current_role',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 font-medium"
        >
          Current Role
          {column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : column.getIsSorted() === 'desc' ? <ChevronDown className="w-4 h-4" /> : null}
        </button>
      ),
      cell: ({ row }) => {
        const r = row.original.current_role;
        return r && r !== 'string' ? r : '—';
      },
    },

    // 11. Skills (Sortable)
    {
      accessorKey: 'skills',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 font-medium"
        >
          Skills
          {column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : column.getIsSorted() === 'desc' ? <ChevronDown className="w-4 h-4" /> : null}
        </button>
      ),
      cell: ({ row }) => {
        const raw = row.original.skills;
        if (!raw || raw === 'string') return '—';
        const skills = raw.split(',').map(s => s.trim()).filter(Boolean);
        if (skills.length === 0) return '—';
        return (
          <div className="flex flex-wrap gap-1 max-w-[140px]">
            {skills.slice(0, 2).map((s, i) => (
              <span key={i} className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs whitespace-nowrap">
                {s}
              </span>
            ))}
            {skills.length > 2 && <span className="text-xs text-muted-foreground">+{skills.length - 2}</span>}
          </div>
        );
      },
    },

    // 12. Status (Sortable)
    {
      accessorKey: 'application_status',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 font-medium"
        >
          Status
          {column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : column.getIsSorted() === 'desc' ? <ChevronDown className="w-4 h-4" /> : null}
        </button>
      ),
      cell: ({ row }) => {
        const status = row.original.application_status || 'pending';
        const clean = status === 'string' ? 'applied' : status;
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
            {clean}
          </span>
        );
      },
    },

    // 13. Location (Sortable)
    {
      accessorKey: 'location',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 font-medium"
        >
          Location
          {column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : column.getIsSorted() === 'desc' ? <ChevronDown className="w-4 h-4" /> : null}
        </button>
      ),
      cell: ({ row }) => {
        const l = row.original.location;
        return l && l !== 'string' ? l : '—';
      },
    },
  ], []);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selected = table.getFilteredSelectedRowModel().rows;

  const exportCSV = () => {
    const csv = Papa.unparse(
      filteredData.map(a => ({
        'Name': `${(a.first_name || '').trim()} ${(a.last_name || '').trim()}`.trim() || 'Unknown Applicant',
        'Email': a.email || '',
        'Job ID': a.job_id,
        'Applied On': a.applied_date ? new Date(a.applied_date).toLocaleDateString() : '',
        'Source': (a.source && a.source !== 'string') ? a.source : '',
        'Skills Score': a.skills_matching_score !== null ? `${(a.skills_matching_score * 100).toFixed(0)}%` : '',
        'JD Score': a.jd_matching_score !== null ? `${(a.jd_matching_score * 100).toFixed(0)}%` : '',
        'Resume Score': a.resume_overall_score !== null ? `${(a.resume_overall_score * 100).toFixed(0)}%` : '',
        'Experience': `${a.experience_years ?? 0} years`,
        'Current Role': (a.current_role && a.current_role !== 'string') ? a.current_role : '',
        'Skills': (a.skills && a.skills !== 'string') ? a.skills : '',
        'Status': a.application_status && a.application_status !== 'string' ? a.application_status : 'applied',
        'Location': (a.location && a.location !== 'string') ? a.location : '',
      }))
    );
    const link = document.createElement('a');
    link.href = `data:text/csv,${encodeURIComponent(csv)}`;
    link.download = `applicants-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-card border rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <input
          placeholder="Search by name or email..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="flex-1 min-w-[300px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-secondary rounded-lg flex items-center gap-2 hover:bg-secondary/80 transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
        {selected.length > 0 && (
          <button
            onClick={() => setScheduleModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium"
          >
            Schedule Interview ({selected.length})
          </button>
        )}
      </div>

      {/* Scrollable Table */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1500px]">
            <thead className="bg-secondary/50 border-b">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider whitespace-nowrap"
                      style={{
                        minWidth:
                          header.id === 'applicant' ? '220px' :
                          header.id === 'experience_years' ? '130px' :
                          header.id === 'current_role' ? '140px' :
                          header.id === 'skills' ? '160px' :
                          '110px'
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-foreground align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 text-xs border rounded disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Previous
            </button>
            <span>
              Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of <strong>{table.getPageCount()}</strong>
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 text-xs border rounded disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Next
            </button>
          </div>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="px-3 py-1 text-xs border rounded bg-background"
          >
            {[10, 20, 50].map(size => (
              <option key={size} value={size}>Show {size}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal */}
      <ScheduleInterviewModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSuccess={() => {
          setScheduleModalOpen(false);
          setRowSelection({});
          onRefresh();
        }}
        applicationIds={selected.map(r => r.original.application_id)}
      />
    </div>
  );
}