/**
 * Excel import functionality using SheetJS (xlsx).
 * Reads uploaded Excel files and converts rows into JustificationRecord objects.
 */

import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { JustificationRecord } from '@/types/tableTypes';
import { recalculateAll } from './calculations';

/**
 * Header-to-field mapping for importing Excel columns.
 * Maps known header text to the JustificationRecord field name.
 */
const HEADER_MAP: Record<string, keyof JustificationRecord> = {
  'no': 'no',
  'general cases and their description': 'generalCase',
  'specific cases and their description': 'specificCase',
  'bylaw - current agreement of the contractor': 'contractorBylaw',
  'current agreement of the contractor': 'contractorBylaw',
  'bylaw - fidic (harmonised edition)': 'fidicBylaw',
  'fidic (harmonised edition)': 'fidicBylaw',
  'fidic': 'fidicBylaw',
  'bylaw - ethiopian civil code': 'civilCodeBylaw',
  'ethiopian civil code': 'civilCodeBylaw',
  'bylaw - ethiopian proclamation (negarit gazette)': 'proclamationBylaw',
  'ethiopian proclamation': 'proclamationBylaw',
  'bylaw - sbd work (ncb by fppa)': 'sbdWorkBylaw',
  'sbd work': 'sbdWorkBylaw',
  'request subject': 'requestSubject',
  'subject': 'requestSubject',
  'letter reference number': 'letterReferenceNumber',
  'letter ref.no': 'letterReferenceNumber',
  'letter date': 'letterDate',
  'date': 'letterDate',
  'interval from': 'intervalFrom',
  'from': 'intervalFrom',
  'interval up to': 'intervalUpTo',
  'up to': 'intervalUpTo',
  'delay (claimed date)': 'delayClaimedDate',
  'delay': 'delayClaimedDate',
  'overlap claimed date': 'overlapClaimedDate',
  'overlap': 'overlapClaimedDate',
  'claimed time (in date)': 'claimedTime',
  'claimed time': 'claimedTime',
  'total cumulative time claimed': 'totalCumulativeTimeClaimed',
  'remark': 'remark',
  'reference for claim': 'referenceForClaim',
};

/**
 * Parse an uploaded Excel file and return an array of JustificationRecord objects.
 * Automatically detects header row and maps columns to fields.
 */
export function importFromExcel(file: File): Promise<JustificationRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Use the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON with header detection
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: '',
        });

        if (jsonData.length === 0) {
          resolve([]);
          return;
        }

        // Detect column mapping from headers
        const firstRow = jsonData[0];
        const columnMap: Record<string, keyof JustificationRecord> = {};

        Object.keys(firstRow).forEach((header) => {
          const normalizedHeader = header.toLowerCase().trim();
          if (HEADER_MAP[normalizedHeader]) {
            columnMap[header] = HEADER_MAP[normalizedHeader];
          }
        });

        // Convert each row to a JustificationRecord
        const records: JustificationRecord[] = jsonData.map((row, index) => {
          const record: JustificationRecord = {
            id: uuidv4(),
            no: index + 1,
            generalCase: '',
            specificCase: '',
            contractorBylaw: '',
            fidicBylaw: '',
            civilCodeBylaw: '',
            proclamationBylaw: '',
            sbdWorkBylaw: '',
            requestSubject: '',
            letterReferenceNumber: '',
            letterDate: '',
            intervalFrom: '',
            intervalUpTo: '',
            delayClaimedDate: 0,
            overlapClaimedDate: 0,
            claimedTime: 0,
            totalCumulativeTimeClaimed: 0,
            remark: '',
            referenceForClaim: '',
          };

          // Map each column's value to the corresponding field
          Object.entries(columnMap).forEach(([header, field]) => {
            const value = row[header];
            if (value !== undefined && value !== null) {
              if (field === 'no' || field === 'delayClaimedDate' || field === 'overlapClaimedDate' || field === 'claimedTime' || field === 'totalCumulativeTimeClaimed') {
                (record[field] as number) = Number(value) || 0;
              } else {
                (record[field] as string) = String(value);
              }
            }
          });

          // Use explicit No column value or default to index
          if (!record.no || record.no === 0) {
            record.no = index + 1;
          }

          return record;
        });

        // Recalculate auto fields
        const calculatedRecords = recalculateAll(records);
        resolve(calculatedRecords);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}
