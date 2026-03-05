'use client';

/**
 * ImportExcelButton component.
 * Allows users to upload an Excel file and import rows into the table.
 * Uses SheetJS (xlsx) for parsing.
 */

import React, { useRef, useState } from 'react';
import { JustificationRecord } from '@/types/tableTypes';
import { importFromExcel } from '@/lib/excelImport';

interface ImportExcelButtonProps {
  onImport: (records: JustificationRecord[]) => void;
}

export default function ImportExcelButton({ onImport }: ImportExcelButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '.xlsx',
      '.xls',
    ];
    const isValidType = validTypes.some(
      (type) => file.type === type || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );

    if (!isValidType) {
      alert('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    setIsImporting(true);
    try {
      const records = await importFromExcel(file);
      if (records.length === 0) {
        alert('No data found in the uploaded file. Please check the file format.');
      } else {
        onImport(records);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import Excel file. Please check the file format and try again.');
    } finally {
      setIsImporting(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Import Excel file"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {isImporting ? 'Importing...' : 'Import Excel'}
      </button>
    </>
  );
}
