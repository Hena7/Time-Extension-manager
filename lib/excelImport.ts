/**
 * Excel import functionality using SheetJS (xlsx).
 * Reads uploaded Excel files and converts rows into JustificationRecord objects.
 */

import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";
import { JustificationRecord } from "@/types/tableTypes";
import { recalculateAll } from "./calculations";

/**
 * Header-to-field mapping for importing Excel columns.
 * Maps known header text to the JustificationRecord field name.
 */
const HEADER_MAP: Record<string, keyof JustificationRecord> = {
  no: "no",
  "general cases and their description": "generalCase",
  "specific cases and their description": "specificCase",
  "bylaw - current agreement of the contractor": "contractorBylaw",
  "current agreement of the contractor": "contractorBylaw",
  "bylaw - fidic (harmonised edition)": "fidicBylaw",
  "fidic (harmonised edition)": "fidicBylaw",
  fidic: "fidicBylaw",
  "bylaw - ethiopian civil code": "civilCodeBylaw",
  "ethiopian civil code": "civilCodeBylaw",
  "bylaw - ethiopian proclamation (negarit gazette)": "proclamationBylaw",
  "ethiopian proclamation": "proclamationBylaw",
  "bylaw - sbd work (ncb by fppa)": "sbdWorkBylaw",
  "sbd work": "sbdWorkBylaw",
  "request subject": "requestSubject",
  subject: "requestSubject",
  "letter reference number": "letterReferenceNumber",
  "letter ref.no": "letterReferenceNumber",
  "letter date": "letterDate",
  date: "letterDate",
  "interval from": "intervalFrom",
  from: "intervalFrom",
  "interval up to": "intervalUpTo",
  "up to": "intervalUpTo",
  "delay (claimed date)": "delayClaimedDate",
  delay: "delayClaimedDate",
  "overlap claimed date": "overlapClaimedDate",
  overlap: "overlapClaimedDate",
  "claimed time (in date)": "claimedTime",
  "claimed time": "claimedTime",
  "total cumulative time claimed": "totalCumulativeTimeClaimed",
  remark: "remark",
  "reference for claim": "referenceForClaim",
};

/**
 * Parse an uploaded Excel file and return an array of JustificationRecord objects.
 * Enhanced to find the header row dynamically (skipping logos/project info)
 * and filter out empty rows.
 */
export function importFromExcel(file: File): Promise<JustificationRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert worksheet to raw 2D array of values to find the header row
        const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, {
          header: 1,
        });

        if (rawData.length === 0) {
          resolve([]);
          return;
        }

        // 1. Find the header row by looking for key terms
        let headerRowIndex = -1;
        const keyTerms = [
          "no",
          "general",
          "specific",
          "bylaw",
          "request",
          "interval",
          "delay",
        ];

        for (let i = 0; i < Math.min(rawData.length, 20); i++) {
          const row = rawData[i];
          if (!row || !Array.isArray(row)) continue;

          // Check if this row contains at least 3 of our key terms (loose check)
          const matches = row.filter((cell) => {
            if (typeof cell !== "string") return false;
            const normalized = cell.toLowerCase().trim();
            return keyTerms.some((term) => normalized.includes(term));
          });

          if (matches.length >= 3) {
            headerRowIndex = i;
            break;
          }
        }

        // Default to 0 if no header found, but usually it's further down
        const effectiveHeaderRow = headerRowIndex === -1 ? 0 : headerRowIndex;

        // 2. Re-read the sheet starting from the detected header row
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
          worksheet,
          {
            range: effectiveHeaderRow,
            defval: "",
          },
        );

        // 3. Detect column mapping from the found headers
        const firstRow = jsonData.length > 0 ? jsonData[0] : {};
        const columnMap: Record<string, keyof JustificationRecord> = {};

        Object.keys(firstRow).forEach((header) => {
          const normalizedHeader = header
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

          // Try exact match first
          if (HEADER_MAP[normalizedHeader]) {
            columnMap[header] = HEADER_MAP[normalizedHeader];
          } else {
            // Fuzzy match for nested/complex headers
            const matchedKey = Object.keys(HEADER_MAP).find(
              (key) =>
                normalizedHeader.includes(key) ||
                key.includes(normalizedHeader),
            );
            if (matchedKey) {
              columnMap[header] = HEADER_MAP[matchedKey];
            }
          }
        });

        // 4. Convert rows to records and filter empties
        const records: JustificationRecord[] = jsonData
          .map((row, index) => {
            const record: JustificationRecord = {
              id: uuidv4(),
              no: 0,
              generalCase: "",
              specificCase: "",
              contractorBylaw: "",
              fidicBylaw: "",
              civilCodeBylaw: "",
              proclamationBylaw: "",
              sbdWorkBylaw: "",
              requestSubject: "",
              letterReferenceNumber: "",
              letterDate: "",
              intervalFrom: "",
              intervalUpTo: "",
              delayClaimedDate: 0,
              overlapClaimedDate: 0,
              claimedTime: 0,
              totalCumulativeTimeClaimed: 0,
              remark: "",
              referenceForClaim: "",
            };

            let hasContent = false;

            Object.entries(columnMap).forEach(([header, field]) => {
              const value = row[header];
              if (value !== undefined && value !== null && value !== "") {
                if (
                  field === "no" ||
                  field === "delayClaimedDate" ||
                  field === "overlapClaimedDate" ||
                  field === "claimedTime" ||
                  field === "totalCumulativeTimeClaimed"
                ) {
                  (record[field] as number) = Number(value) || 0;
                } else {
                  (record[field] as string) = String(value);
                  // If we have text in essential fields, mark as not empty
                  if (
                    field === "generalCase" ||
                    field === "specificCase" ||
                    field === "requestSubject"
                  ) {
                    hasContent = true;
                  }
                }
              }
            });

            // Use index if no number was provided in the Excel
            if (!record.no) {
              record.no = index + 1;
            }

            return { record, hasContent };
          })
          // Filter out rows that are completely empty in the main description fields
          .filter((item) => item.hasContent)
          .map((item) => item.record);

        // 5. Recalculate auto fields
        const calculatedRecords = recalculateAll(records);
        resolve(calculatedRecords);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
}
