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

console.log("ApplicantsTable.tsx: File loaded");

// FULL DATA TYPE FROM BACKEND
interface ApplicantWithScore {
  // Application Fields
  application_id: number;
  job_id: number | null;
  applicant_id: number | null;
  applied_date: string | null;
  source: string | null;
  skills_matching_score: number | null;
  jd_matching_score: number | null;
  resume_overall_score: number | null;
  application_status: string | null;
  assigned_hr: string | null;
  assigned_manager: string | null;
  comments: string | null;
  updated_at: string | null;

  // Applicant Profile
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  resume_url: string | null;
  experience_years: number | null;
  education: string | null;
  current_company: string | null;
  current_role: string | null;
  expected_ctc: number | null;
  notice_period_days: number | null;
  skills: string | null;
  location: string | null;
  created_at: string | null;
  applicant_updated_at: string | null;
}

interface Props {
  applicants: ApplicantWithScore[];
  onRefresh: () => void;
}

export default function ApplicantsTable({ applicants, onRefresh }: Props) {
  console.log("ApplicantsTable.tsx: Rendered with", applicants.length, "applicants");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const columns = useMemo<ColumnDef<ApplicantWithScore>[]>(() => [
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

    // 1. Applicant
    {
      accessorFn: (row) => `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      id: 'applicant_name',
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Applicant
          {column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.first_name || '—'} {row.original.last_name || ''}
          </p>
          <p className="text-sm text-muted-foreground">{row.original.email || '—'}</p>
        </div>
      ),
    },

    // 2. Job ID
    {
      accessorKey: 'job_id',
      header: 'Job ID',
      cell: ({ row }) => row.original.job_id || '—',
    },

    // 3. Applied Date
    {
      accessorKey: 'applied_date',
      header: 'Applied On',
      cell: ({ row }) => {
        const date = row.original.applied_date;
        return date ? new Date(date).toLocaleDateString() : '—';
      },
    },

    // 4. Source
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) => row.original.source || '—',
    },

    // 5. Skills Score
    {
      accessorKey: 'skills_matching_score',
      header: 'Skills Score',
      cell: ({ row }) => {
        const score = row.original.skills_matching_score;
        return score !== null ? `${(score * 100).toFixed(0)}%` : '—';
      },
    },

    // 6. JD Score
    {
      accessorKey: 'jd_matching_score',
      header: 'JD Score',
      cell: ({ row }) => {
        const score = row.original.jd_matching_score;
        return score !== null ? `${(score * 100).toFixed(0)}%` : '—';
      },
    },

    // 7. Resume Score
    {
      accessorKey: 'resume_overall_score',
      header: 'Resume Score',
      cell: ({ row }) => {
        const s = row.original.resume_overall_score;
        if (s === null) return '—';
        const score = (s * 100).toFixed(0);
        const color = s >= 0.85 ? 'text-green-600' : s >= 0.70 ? 'text-blue-600' : s >= 0.60 ? 'text-yellow-600' : 'text-red-600';
        return <span className={`font-bold ${color}`}>{score}%</span>;
      },
    },

    // 8. Experience
    {
      accessorKey: 'experience_years',
      header: 'Experience',
      cell: ({ row }) => `${row.original.experience_years ?? 0} years`,
    },

    // 9. Current Role
    {
      accessorKey: 'current_role',
      header: 'Current Role',
      cell: ({ row }) => row.original.current_role || '—',
    },

    // 10. Skills Tags
    {
      accessorKey: 'skills',
      header: 'Skills',
      cell: ({ row }) => {
        const skills = row.original.skills?.split(',').map(s => s.trim()).filter(Boolean) || [];
        return (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 2).map((s, i) => (
              <span key={i} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">{s}</span>
            ))}
            {skills.length > 2 && <span className="text-xs text-muted-foreground">+{skills.length - 2}</span>}
          </div>
        );
      },
    },

    // 11. Status
    {
      accessorKey: 'application_status',
      header: 'Status',
      cell: ({ row }) => (
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
          {row.original.application_status || 'pending'}
        </span>
      ),
    },

    // 12. Location
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => row.original.location || '—',
    },
  ], []);

  const table = useReactTable({
    data: applicants,
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
      applicants.map(a => ({
        'Application ID': a.application_id,
        'Job ID': a.job_id,
        'Applicant ID': a.applicant_id,
        'Name': `${a.first_name || ''} ${a.last_name || ''}`.trim(),
        Email: a.email,
        Phone: a.phone,
        'Applied Date': a.applied_date,
        Source: a.source,
        'Skills Score': a.skills_matching_score !== null ? (a.skills_matching_score * 100).toFixed(0) + '%' : '',
        'JD Score': a.jd_matching_score !== null ? (a.jd_matching_score * 100).toFixed(0) + '%' : '',
        'Resume Score': a.resume_overall_score !== null ? (a.resume_overall_score * 100).toFixed(0) + '%' : '',
        Experience: a.experience_years,
        'Current Role': a.current_role,
        Skills: a.skills,
        Status: a.application_status,
        Location: a.location,
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
      <div className="bg-card border rounded-xl p-4 flex flex-wrap gap-2">
        <input
          placeholder="Search all fields..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-secondary rounded-lg flex items-center gap-2 hover:opacity-90"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
        {selected.length > 0 && (
          <button
            onClick={() => setScheduleModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Schedule Interview ({selected.length})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-secondary border-b">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-4 py-3 text-left text-sm font-medium">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="px-3 py-1 border rounded text-sm"
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