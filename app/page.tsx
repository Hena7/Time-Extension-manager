'use client';

/**
 * Root page - renders the dashboard directly.
 * This is the main entry point of the application.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { JustificationRecord, ProjectInfo, createEmptyRecord, createDefaultProjectInfo } from '@/types/tableTypes';
import { loadRecords, saveRecords, loadProjectInfo, saveProjectInfo } from '@/lib/localStorage';
import { recalculateAll } from '@/lib/calculations';
import ProjectInfoHeader from '@/components/ProjectInfoHeader';
import TableToolbar from '@/components/TableToolbar';
import DataTable from '@/components/DataTable';

export default function Home() {
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

  const handleAddRow = useCallback(() => {
    const newNo = records.length > 0 ? Math.max(...records.map((r) => r.no)) + 1 : 1;
    const newRecord = createEmptyRecord(newNo, uuidv4());
    setRecords((prev) => [...prev, newRecord]);
  }, [records]);

  const handleRecordsChange = useCallback((updatedRecords: JustificationRecord[]) => {
    const recalculated = recalculateAll(updatedRecords);
    setRecords(recalculated);
  }, []);

  const handleImport = useCallback((importedRecords: JustificationRecord[]) => {
    const shouldReplace = records.length === 0 || window.confirm(
      'Do you want to replace existing data? Click OK to replace, or Cancel to append.'
    );

    if (shouldReplace) {
      const renumbered = importedRecords.map((r, i) => ({ ...r, no: i + 1 }));
      const recalculated = recalculateAll(renumbered);
      setRecords(recalculated);
    } else {
      const startNo = records.length > 0 ? Math.max(...records.map((r) => r.no)) + 1 : 1;
      const renumbered = importedRecords.map((r, i) => ({ ...r, no: startNo + i, id: uuidv4() }));
      const combined = [...records, ...renumbered];
      const recalculated = recalculateAll(combined);
      setRecords(recalculated);
    }
  }, [records]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} selected row(s)?`
    );
    if (!confirmed) return;
    const remaining = records.filter((r) => !selectedIds.includes(r.id));
    const renumbered = remaining.map((r, i) => ({ ...r, no: i + 1 }));
    const recalculated = recalculateAll(renumbered);
    setRecords(recalculated);
    setSelectedIds([]);
  }, [records, selectedIds]);

  const handleProjectInfoChange = useCallback((info: ProjectInfo) => {
    setProjectInfo(info);
  }, []);

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 text-lg">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProjectInfoHeader
        projectInfo={projectInfo}
        onChange={handleProjectInfoChange}
      />
      <TableToolbar
        records={records}
        projectInfo={projectInfo}
        onAddRow={handleAddRow}
        onImport={handleImport}
        onDeleteSelected={handleDeleteSelected}
        hasSelection={selectedIds.length > 0}
      />
      <DataTable
        records={records}
        onRecordsChange={handleRecordsChange}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
}
