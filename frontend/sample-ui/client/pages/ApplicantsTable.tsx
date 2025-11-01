import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Download, Trash2 } from 'lucide-react';
import { Applicant } from '@shared/api';
import ScheduleInterviewModal from '@/components/ScheduleInterviewModal';
import Papa from 'papaparse';

interface ApplicantWithScore extends Applicant {
  application_id?: number;
  application_status?: string;
  skills_matching_score?: number;
  jd_matching_score?: number;
  resume_overall_score?: number;
  applied_date?: string;
  job_title?: string;
}

interface ApplicantsTableProps {
  applicants: ApplicantWithScore[];
  onRefresh: () => void;
}

export default function ApplicantsTable({ applicants, onRefresh }: ApplicantsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const columns = useMemo<ColumnDef<ApplicantWithScore>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="w-4 h-4 rounded border-border cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 rounded border-border cursor-pointer"
          />
        ),
      },
      {
        accessorKey: 'first_name',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
          >
            Applicant
            {column.getIsSorted() && (
              column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">
              {row.original.first_name} {row.original.last_name}
            </p>
            <p className="text-sm text-muted-foreground">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: 'experience_years',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
          >
            Experience
            {column.getIsSorted() && (
              column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
            )}
          </button>
        ),
        cell: ({ row }) => `${row.original.experience_years || 0} years`,
      },
      {
        accessorKey: 'current_role',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
          >
            Current Role
            {column.getIsSorted() && (
              column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
            )}
          </button>
        ),
        cell: ({ row }) => row.original.current_role || '—',
      },
      {
        accessorKey: 'skills',
        header: 'Skills',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.skills
              ?.split(',')
              .slice(0, 2)
              .map((skill, idx) => (
                <span key={idx} className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                  {skill.trim()}
                </span>
              ))}
            {row.original.skills && row.original.skills.split(',').length > 2 && (
              <span className="text-xs text-muted-foreground pt-1">
                +{row.original.skills.split(',').length - 2} more
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'resume_overall_score',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
          >
            Resume Score
            {column.getIsSorted() && (
              column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const score = row.original.resume_overall_score || 0;
          const getColor = (s: number) => {
            if (s >= 85) return 'text-accent';
            if (s >= 70) return 'text-blue-600';
            if (s >= 60) return 'text-yellow-600';
            return 'text-red-600';
          };
          return <span className={`font-bold ${getColor(score)}`}>{score}</span>;
        },
      },
      {
        accessorKey: 'application_status',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
          >
            Status
            {column.getIsSorted() && (
              column.getIsSorted() === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
            {row.original.application_status || 'pending'}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: applicants,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleExportCSV = () => {
    const data = table.getFilteredRowModel().rows.map((row) => ({
      'First Name': row.original.first_name,
      'Last Name': row.original.last_name,
      Email: row.original.email,
      Phone: row.original.phone || '',
      'Experience (Years)': row.original.experience_years || '',
      'Current Role': row.original.current_role || '',
      'Current Company': row.original.current_company || '',
      Skills: row.original.skills || '',
      Location: row.original.location || '',
      Status: row.original.application_status || '',
      'Resume Score': row.original.resume_overall_score || '',
    }));

    const csv = Papa.unparse(data);
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = `applicants-${new Date().getTime()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search applicants..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          {selectedRows.length > 0 && (
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Schedule Interview ({selectedRows.length})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-sm font-semibold text-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border border-border rounded-lg disabled:opacity-50 hover:bg-secondary transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border border-border rounded-lg disabled:opacity-50 hover:bg-secondary transition-colors"
            >
              Next
            </button>
          </div>

          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-3 py-1 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ScheduleInterviewModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSuccess={() => {
          setScheduleModalOpen(false);
          setRowSelection({});
          onRefresh();
        }}
        applicationIds={selectedRows.map((row) => row.original.application_id || 0)}
      />
    </div>
  );
}
