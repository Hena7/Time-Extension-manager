"use client";

/**
 * DataTable component.
 * Uses AG Grid Community for an Excel-like editing experience.
 * Supports inline editing, sticky headers, sorting, filtering, and pagination.
 */

import React, { useCallback, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  ColDef,
  CellValueChangedEvent,
  SelectionChangedEvent,
  GridReadyEvent,
} from "ag-grid-community";
import { JustificationRecord } from "@/types/tableTypes";
import { recalculateAll } from "@/lib/calculations";

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface DataTableProps {
  records: JustificationRecord[];
  onRecordsChange: (records: JustificationRecord[]) => void;
  onSelectionChange: (selectedIds: string[]) => void;
}

export default function DataTable({
  records,
  onRecordsChange,
  onSelectionChange,
}: DataTableProps) {
  const gridRef = useRef<AgGridReact>(null);

  /** Handle grid ready event */
  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  }, []);

  /** Column definitions matching the required fixed headers */
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 50,
        pinned: "left" as const,
        sortable: false,
        filter: false,
        resizable: false,
        suppressHeaderMenuButton: true,
      },
      {
        field: "no",
        headerName: "No",
        width: 70,
        pinned: "left" as const,
        editable: false,
        sortable: true,
        filter: true,
        cellClass: "text-center font-medium",
      },
      {
        field: "generalCase",
        headerName: "General CASES And Their Description",
        minWidth: 200,
        editable: true,
        sortable: true,
        filter: true,
        cellEditor: "agLargeTextCellEditor",
        cellEditorPopup: true,
        cellEditorParams: { maxLength: 5000, cols: 50, rows: 6 },
        wrapText: true,
        autoHeight: true,
      },
      {
        field: "specificCase",
        headerName: "Specific CASES And Their Description",
        minWidth: 250,
        editable: true,
        sortable: true,
        filter: true,
        cellEditor: "agLargeTextCellEditor",
        cellEditorPopup: true,
        cellEditorParams: { maxLength: 5000, cols: 50, rows: 6 },
        wrapText: true,
        autoHeight: true,
      },
      {
        field: "contractorBylaw",
        headerName: "Bylaw - Current Agreement of the Contractor",
        minWidth: 180,
        editable: true,
        sortable: true,
        filter: true,
        wrapText: true,
        autoHeight: true,
      },
      {
        field: "fidicBylaw",
        headerName: "Bylaw - FIDIC (Harmonised edition)",
        minWidth: 170,
        editable: true,
        sortable: true,
        filter: true,
        wrapText: true,
        autoHeight: true,
      },
      {
        field: "civilCodeBylaw",
        headerName: "Bylaw - Ethiopian Civil Code",
        minWidth: 180,
        editable: true,
        sortable: true,
        filter: true,
        wrapText: true,
        autoHeight: true,
      },
      {
        field: "proclamationBylaw",
        headerName: "Bylaw - Ethiopian Proclamation (Negarit Gazette)",
        minWidth: 200,
        editable: true,
        sortable: true,
        filter: true,
        wrapText: true,
        autoHeight: true,
      },
      {
        field: "sbdWorkBylaw",
        headerName: "Bylaw - SBD Work (NCB by FPPA)",
        minWidth: 180,
        editable: true,
        sortable: true,
        filter: true,
        wrapText: true,
        autoHeight: true,
      },
      {
        field: "requestSubject",
        headerName: "Request Subject",
        minWidth: 160,
        editable: true,
        sortable: true,
        filter: true,
        wrapText: true,
        autoHeight: true,
      },
      {
        field: "letterReferenceNumber",
        headerName: "Letter Reference Number",
        minWidth: 160,
        editable: true,
        sortable: true,
        filter: true,
        wrapText: true,
        autoHeight: true,
      },
      {
        field: "letterDate",
        headerName: "Letter Date",
        width: 140,
        editable: true,
        sortable: true,
        filter: true,
        cellEditor: "agTextCellEditor",
      },
      {
        field: "intervalFrom",
        headerName: "Interval From",
        width: 140,
        editable: true,
        sortable: true,
        filter: true,
        cellEditor: "agTextCellEditor",
        cellEditorParams: { useFormatter: true },
      },
      {
        field: "intervalUpTo",
        headerName: "Interval Up To",
        width: 140,
        editable: true,
        sortable: true,
        filter: true,
        cellEditor: "agTextCellEditor",
        cellEditorParams: { useFormatter: true },
      },
      {
        field: "delayClaimedDate",
        headerName: "Delay (Claimed Date)",
        width: 130,
        editable: false,
        sortable: true,
        filter: true,
        cellClass: "text-center font-semibold bg-blue-50",
        headerClass: "bg-blue-100",
      },
      {
        field: "overlapClaimedDate",
        headerName: "Overlap Claimed Date",
        width: 140,
        editable: true,
        sortable: true,
        filter: true,
        cellEditor: "agNumberCellEditor",
        cellClass: "text-center",
      },
      {
        field: "claimedTime",
        headerName: "Claimed Time (in Date)",
        width: 140,
        editable: false,
        sortable: true,
        filter: true,
        cellClass: "text-center font-semibold bg-blue-50",
        headerClass: "bg-blue-100",
      },
      {
        field: "totalCumulativeTimeClaimed",
        headerName: "Total Cumulative Time Claimed",
        width: 160,
        editable: false,
        sortable: true,
        filter: true,
        cellClass: "text-center font-bold bg-green-50",
        headerClass: "bg-green-100",
      },
      {
        field: "remark",
        headerName: "Remark",
        minWidth: 160,
        editable: true,
        sortable: true,
        filter: true,
        cellEditor: "agLargeTextCellEditor",
        cellEditorPopup: true,
        cellEditorParams: { maxLength: 2000, cols: 40, rows: 4 },
        wrapText: true,
        autoHeight: true,
      },
      {
        field: "referenceForClaim",
        headerName: "Reference For Claim",
        minWidth: 160,
        editable: true,
        sortable: true,
        filter: true,
        wrapText: true,
        autoHeight: true,
      },
    ],
    [],
  );

  /** Default column settings */
  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      editable: true,
      suppressMovable: true,
      headerClass: "ag-header-cell-custom",
    }),
    [],
  );

  /** Handle cell value changes - recalculate auto fields */
  const onCellValueChanged = useCallback(
    (event: CellValueChangedEvent) => {
      const field = event.colDef.field;

      // If interval dates or overlap changed, recalculate
      if (
        field === "intervalFrom" ||
        field === "intervalUpTo" ||
        field === "overlapClaimedDate"
      ) {
        const updatedRecords = recalculateAll(
          records.map((r) =>
            r.id === event.data.id ? { ...r, [field]: event.newValue } : r,
          ),
        );
        onRecordsChange(updatedRecords);
      } else {
        // Just update the changed field
        const updatedRecords = records.map((r) =>
          r.id === event.data.id
            ? { ...r, [field as string]: event.newValue }
            : r,
        );
        onRecordsChange(updatedRecords);
      }
    },
    [records, onRecordsChange],
  );

  /** Handle row selection changes */
  const onSelectionChanged = useCallback(
    (event: SelectionChangedEvent) => {
      const selectedRows = event.api.getSelectedRows() as JustificationRecord[];
      onSelectionChange(selectedRows.map((r) => r.id));
    },
    [onSelectionChange],
  );

  /** Pagination settings */
  const paginationPageSize = 20;
  const paginationPageSizeSelector = [10, 20, 50, 100];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="ag-theme-alpine w-full" style={{ height: "600px" }}>
        <AgGridReact
          ref={gridRef}
          rowData={records}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onCellValueChanged={onCellValueChanged}
          onSelectionChanged={onSelectionChanged}
          rowSelection="multiple"
          pagination={true}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={paginationPageSizeSelector}
          animateRows={true}
          getRowId={(params) => params.data.id}
          suppressRowClickSelection={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          stopEditingWhenCellsLoseFocus={false}
          undoRedoCellEditing={true}
          undoRedoCellEditingLimit={20}
        />
      </div>
    </div>
  );
}
