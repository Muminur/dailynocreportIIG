'use client';

/**
 * Editable Report Table Component
 * Minimal implementation with TanStack Table
 */

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import type { ReportEntry, Category, EntryType } from '@/types';

interface EditableTableProps {
  data: ReportEntry[];
  onChange: (data: ReportEntry[]) => void;
}

const CATEGORIES: Category[] = ['Backhaul', 'Upstreams', 'IPT Client', 'ISP Client', 'Uncategorized'];
const TYPES: EntryType[] = ['Service', 'Complain'];

export default function EditableTable({ data, onChange }: EditableTableProps) {
  const updateEntry = (rowIndex: number, field: keyof ReportEntry, value: string | Date | Category | EntryType | boolean) => {
    const newData = [...data];
    const entry = newData[rowIndex];
    if (entry) {
      newData[rowIndex] = {
        ...entry,
        [field]: value,
        isEdited: true,
      };
      onChange(newData);
    }
  };

  const addRow = () => {
    const newEntry: ReportEntry = {
      id: `temp-${Date.now()}`,
      category: 'Uncategorized',
      dateTime: new Date(),
      clientVendor: '',
      cause: '',
      downtime: '',
      type: 'Complain',
      remarks: '',
      isManuallyAdded: true,
      isEdited: false,
    };
    onChange([...data, newEntry]);
  };

  const deleteRow = (rowIndex: number) => {
    if (confirm('Delete this entry?')) {
      onChange(data.filter((_, i) => i !== rowIndex));
    }
  };

  const moveRow = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= data.length) return;

    const newData = [...data];
    const fromItem = newData[fromIndex];
    const toItem = newData[toIndex];
    if (fromItem && toItem) {
      [newData[fromIndex], newData[toIndex]] = [toItem, fromItem];
      onChange(newData);
    }
  };

  const columns = useMemo<ColumnDef<ReportEntry>[]>(
    () => [
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row, getValue }) => {
          const value = getValue() as Category;
          return (
            <select
              value={value}
              onChange={(e) => updateEntry(row.index, 'category', e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          );
        },
      },
      {
        accessorKey: 'dateTime',
        header: 'Date/Time',
        cell: ({ row, getValue }) => {
          const value = getValue() as Date;
          return (
            <input
              type="datetime-local"
              value={new Date(value).toISOString().slice(0, 16)}
              onChange={(e) => updateEntry(row.index, 'dateTime', new Date(e.target.value))}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          );
        },
      },
      {
        accessorKey: 'clientVendor',
        header: 'Client/Vendor',
        cell: ({ row, getValue }) => (
          <input
            type="text"
            value={getValue() as string}
            onChange={(e) => updateEntry(row.index, 'clientVendor', e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
          />
        ),
      },
      {
        accessorKey: 'cause',
        header: 'Cause',
        cell: ({ row, getValue }) => (
          <input
            type="text"
            value={getValue() as string}
            onChange={(e) => updateEntry(row.index, 'cause', e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
          />
        ),
      },
      {
        accessorKey: 'downtime',
        header: 'Downtime',
        cell: ({ row, getValue }) => (
          <input
            type="text"
            value={getValue() as string}
            onChange={(e) => updateEntry(row.index, 'downtime', e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
          />
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row, getValue }) => {
          const value = getValue() as EntryType;
          return (
            <select
              value={value}
              onChange={(e) => updateEntry(row.index, 'type', e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              {TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          );
        },
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: ({ row, getValue }) => (
          <input
            type="text"
            value={getValue() as string}
            onChange={(e) => updateEntry(row.index, 'remarks', e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
          />
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <button
              onClick={() => moveRow(row.index, 'up')}
              disabled={row.index === 0}
              className="px-2 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
              title="Move up"
            >
              ↑
            </button>
            <button
              onClick={() => moveRow(row.index, 'down')}
              disabled={row.index === data.length - 1}
              className="px-2 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
              title="Move down"
            >
              ↓
            </button>
            <button
              onClick={() => deleteRow(row.index)}
              className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded"
              title="Delete"
            >
              ✕
            </button>
          </div>
        ),
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Report Entries</h3>
        <button
          onClick={addRow}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Entry
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-gray-50">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2 border-b">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No entries. Click "Add Entry" to create one.
        </div>
      )}
    </div>
  );
}

