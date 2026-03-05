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

  /** Column definitions with grouped headers matching the reference document layout */
  const columnDefs = useMemo<ColDef[]>(
    () => [
      // Checkbox selection column
      {
        headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 50,
        pinned: "left" as const,
        sortable: false,
        filter: false,
        resizable: false,
        suppressHeaderMenuButton: true,
        lockPosition: true,
      },
      // No column — editable, user sets row number, grid sorts by it
      {
        field: "no",
        headerName: "No",
        width: 70,
        pinned: "left" as const,
        editable: true,
        sortable: true,
        sort: "asc",
        filter: true,
        cellEditor: "agNumberCellEditor",
        cellClass: "text-center font-medium",
      },
      // General & Specific cases (standalone)
      {
        field: "generalCase",
        headerName: "General CASES And Their Description",
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
      // ── GROUP: Bylaw of ──────────────────────────────────────────
      {
        headerName: "Bylaw of",
        headerClass: "ag-header-group-bylaw",
        children: [
          {
            field: "contractorBylaw",
            headerName: "Current Agreement of the Contractor",
            minWidth: 250,
            editable: true,
            sortable: true,
            filter: true,
            wrapText: true,
            autoHeight: true,
            columnGroupShow: "open",
          },
          {
            field: "fidicBylaw",
            headerName: "FIDIC (Harmonised edition)",
            minWidth: 250,
            editable: true,
            sortable: true,
            filter: true,
            wrapText: true,
            autoHeight: true,
            columnGroupShow: "open",
          },
          {
            field: "civilCodeBylaw",
            headerName: "Ethiopian Civil Code (Amharic)",
            minWidth: 250,
            editable: true,
            sortable: true,
            filter: true,
            wrapText: true,
            autoHeight: true,
            columnGroupShow: "open",
          },
          {
            field: "proclamationBylaw",
            headerName: "Ethiopian Proclamation (Negarit Gazette)",
            minWidth: 250,
            editable: true,
            sortable: true,
            filter: true,
            wrapText: true,
            autoHeight: true,
            columnGroupShow: "open",
          },
          {
            field: "sbdWorkBylaw",
            headerName: "SBD Work (NCB by FPPA)",
            minWidth: 250,
            editable: true,
            sortable: true,
            filter: true,
            wrapText: true,
            autoHeight: true,
            columnGroupShow: "open",
          },
        ],
      },
      // ── GROUP: Request & Response ─────────────────────────────────
      {
        headerName: "REQUEST, & RESPONSE",
        headerClass: "ag-header-group-request",
        children: [
          {
            field: "requestSubject",
            headerName: "Subject",
            minWidth: 250,
            editable: true,
            sortable: true,
            filter: true,
            wrapText: true,
            autoHeight: true,
          },
          {
            field: "letterReferenceNumber",
            headerName: "Letter Ref. No",
            minWidth: 250,
            editable: true,
            sortable: true,
            filter: true,
            wrapText: true,
            autoHeight: true,
          },
          {
            field: "letterDate",
            headerName: "Date",
            width: 130,
            editable: true,
            sortable: true,
            filter: true,
            cellEditor: "agTextCellEditor",
          },
        ],
      },
      // ── GROUP: Interval CASES of intermission or delay of date ────
      {
        headerName: "Interval CASES of Intermission or Delay of Date",
        headerClass: "ag-header-group-interval",
        children: [
          {
            field: "intervalFrom",
            headerName: "From",
            width: 130,
            editable: true,
            sortable: true,
            filter: true,
            cellEditor: "agTextCellEditor",
            cellEditorParams: { useFormatter: true },
          },
          {
            field: "intervalUpTo",
            headerName: "Up To",
            width: 130,
            editable: true,
            sortable: true,
            filter: true,
            cellEditor: "agTextCellEditor",
            cellEditorParams: { useFormatter: true },
          },
        ],
      },
      // ── GROUP: Number of DELAY (countered in no day) ──────────────
      {
        headerName: "Number of DELAY (countered in no day)",
        headerClass: "ag-header-group-delay",
        children: [
          {
            field: "delayClaimedDate",
            headerName: "DELAY (Claimed Date)",
            width: 130,
            editable: false,
            sortable: true,
            filter: true,
            cellClass: "text-center font-semibold bg-blue-50",
          },
          {
            field: "overlapClaimedDate",
            headerName: "OVERLAP Claimed Date",
            width: 140,
            editable: true,
            sortable: true,
            filter: true,
            cellEditor: "agNumberCellEditor",
            cellClass: "text-center",
          },
          {
            field: "claimedTime",
            headerName: "CLAIMED TIME (in Date)",
            width: 140,
            editable: false,
            sortable: true,
            filter: true,
            cellClass: "text-center font-semibold bg-blue-50",
          },
        ],
      },
      // Total cumulative time (standalone)
      {
        field: "totalCumulativeTimeClaimed",
        headerName: "Total Cumulative TIME CLAIM (Time Extension)",
        width: 250,
        editable: false,
        sortable: true,
        filter: true,
        cellClass: "text-center font-bold bg-green-50",
        headerClass: "bg-green-100",
      },
      // Remark (standalone)
      {
        field: "remark",
        headerName: "REMARK (Reference for Claim)",
        minWidth: 300,
        editable: true,
        sortable: true,
        filter: true,
        cellEditor: "agLargeTextCellEditor",
        cellEditorPopup: true,
        cellEditorParams: { maxLength: 2000, cols: 40, rows: 4 },
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
          singleClickEdit={true}
          stopEditingWhenCellsLoseFocus={false}
          undoRedoCellEditing={true}
          undoRedoCellEditingLimit={20}
        />
      </div>
    </div>
  );
}
