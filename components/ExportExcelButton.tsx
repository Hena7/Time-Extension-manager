'use client';

/**
 * ExportExcelButton component.
 * Triggers the Excel export of all table data using ExcelJS.
 */

import React, { useState } from 'react';
import { JustificationRecord, ProjectInfo } from '@/types/tableTypes';
import { exportToExcel } from '@/lib/excelExport';

interface ExportExcelButtonProps {
  records: JustificationRecord[];
  projectInfo: ProjectInfo;
}

export default function ExportExcelButton({ records, projectInfo }: ExportExcelButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (records.length === 0) {
      alert('No data to export. Please add some rows first.');
      return;
    }

    setIsExporting(true);
    try {
      await exportToExcel(records, projectInfo);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export Excel file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {isExporting ? 'Exporting...' : 'Export Excel'}
    </button>
  );
}
