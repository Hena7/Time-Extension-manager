'use client';

/**
 * TableToolbar component.
 * Contains action buttons for Add Row, Import Excel, Export Excel, and Delete Selected.
 */

import React from 'react';
import { JustificationRecord, ProjectInfo } from '@/types/tableTypes';
import ExportExcelButton from './ExportExcelButton';
import ImportExcelButton from './ImportExcelButton';

interface TableToolbarProps {
  records: JustificationRecord[];
  projectInfo: ProjectInfo;
  onAddRow: () => void;
  onImport: (records: JustificationRecord[]) => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
}

export default function TableToolbar({
  records,
  projectInfo,
  onAddRow,
  onImport,
  onDeleteSelected,
  hasSelection,
}: TableToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* Add Row Button */}
      <button
        onClick={onAddRow}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Row
      </button>

      {/* Import Excel Button */}
      <ImportExcelButton onImport={onImport} />

      {/* Export Excel Button */}
      <ExportExcelButton records={records} projectInfo={projectInfo} />

      {/* Delete Selected Button - Only shows when rows are selected */}
      {hasSelection && (
        <button
          onClick={onDeleteSelected}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Selected
        </button>
      )}

      {/* Row Count Badge */}
      <div className="ml-auto">
        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
          {records.length} {records.length === 1 ? 'row' : 'rows'}
        </span>
      </div>
    </div>
  );
}
