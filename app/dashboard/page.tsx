'use client';

/**
 * Dashboard Page.
 * Main page of the application containing the project info header,
 * toolbar with action buttons, and the AG Grid data table.
 * All data is persisted to LocalStorage.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { JustificationRecord, ProjectInfo, createEmptyRecord, createDefaultProjectInfo } from '@/types/tableTypes';
import { loadRecords, saveRecords, loadProjectInfo, saveProjectInfo } from '@/lib/localStorage';
import { recalculateAll } from '@/lib/calculations';
import ProjectInfoHeader from '@/components/ProjectInfoHeader';
import TableToolbar from '@/components/TableToolbar';
import DataTable from '@/components/DataTable';

export default function DashboardPage() {
  const [records, setRecords] = useState<JustificationRecord[]>([]);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(createDefaultProjectInfo());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved data from LocalStorage on mount
  useEffect(() => {
    const savedRecords = loadRecords();
    const savedProjectInfo = loadProjectInfo();
    setRecords(savedRecords);
    setProjectInfo(savedProjectInfo);
    setIsLoaded(true);
  }, []);

  // Save records to LocalStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveRecords(records);
    }
  }, [records, isLoaded]);

  // Save project info to LocalStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      saveProjectInfo(projectInfo);
    }
  }, [projectInfo, isLoaded]);

  /** Add a new empty row at the end of the table */
  const handleAddRow = useCallback(() => {
    const newNo = records.length > 0 ? Math.max(...records.map((r) => r.no)) + 1 : 1;
    const newRecord = createEmptyRecord(newNo, uuidv4());
    setRecords((prev) => [...prev, newRecord]);
  }, [records]);

  /** Update records and recalculate auto fields */
  const handleRecordsChange = useCallback((updatedRecords: JustificationRecord[]) => {
    const recalculated = recalculateAll(updatedRecords);
    setRecords(recalculated);
  }, []);

  /** Handle imported records - replace or append */
  const handleImport = useCallback((importedRecords: JustificationRecord[]) => {
    const shouldReplace = records.length === 0 || window.confirm(
      'Do you want to replace existing data? Click OK to replace, or Cancel to append.'
    );

    if (shouldReplace) {
      // Renumber all imported records
      const renumbered = importedRecords.map((r, i) => ({ ...r, no: i + 1 }));
      const recalculated = recalculateAll(renumbered);
      setRecords(recalculated);
    } else {
      // Append imported records after existing ones
      const startNo = records.length > 0 ? Math.max(...records.map((r) => r.no)) + 1 : 1;
      const renumbered = importedRecords.map((r, i) => ({ ...r, no: startNo + i, id: uuidv4() }));
      const combined = [...records, ...renumbered];
      const recalculated = recalculateAll(combined);
      setRecords(recalculated);
    }
  }, [records]);

  /** Delete selected rows */
  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} selected row(s)?`
    );
    if (!confirmed) return;

    const remaining = records.filter((r) => !selectedIds.includes(r.id));
    // Renumber remaining rows
    const renumbered = remaining.map((r, i) => ({ ...r, no: i + 1 }));
    const recalculated = recalculateAll(renumbered);
    setRecords(recalculated);
    setSelectedIds([]);
  }, [records, selectedIds]);

  /** Handle project info changes */
  const handleProjectInfoChange = useCallback((info: ProjectInfo) => {
    setProjectInfo(info);
  }, []);

  /** Handle selection changes from the grid */
  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  // Show loading state while data is being loaded from LocalStorage
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 text-lg">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Project Information Header */}
      <ProjectInfoHeader
        projectInfo={projectInfo}
        onChange={handleProjectInfoChange}
      />

      {/* Action Toolbar */}
      <TableToolbar
        records={records}
        projectInfo={projectInfo}
        onAddRow={handleAddRow}
        onImport={handleImport}
        onDeleteSelected={handleDeleteSelected}
        hasSelection={selectedIds.length > 0}
      />

      {/* AG Grid Data Table */}
      <DataTable
        records={records}
        onRecordsChange={handleRecordsChange}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
}
