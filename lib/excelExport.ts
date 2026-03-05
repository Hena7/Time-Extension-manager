/**
 * Excel export functionality using ExcelJS.
 * Generates a professionally formatted .xlsx file with all table data.
 */

import ExcelJS from 'exceljs';
import { JustificationRecord, ProjectInfo } from '@/types/tableTypes';

/** Column header definitions matching the required table headers */
const HEADERS = [
  'No',
  'General CASES And Their Description',
  'Specific CASES And Their Description',
  'Bylaw - Current Agreement of the Contractor',
  'Bylaw - FIDIC (Harmonised edition)',
  'Bylaw - Ethiopian Civil Code',
  'Bylaw - Ethiopian Proclamation (Negarit Gazette)',
  'Bylaw - SBD Work (NCB by FPPA)',
  'Request Subject',
  'Letter Reference Number',
  'Letter Date',
  'Interval From',
  'Interval Up To',
  'Delay (Claimed Date)',
  'Overlap Claimed Date',
  'Claimed Time (in Date)',
  'Total Cumulative Time Claimed',
  'Remark',
  'Reference For Claim',
];

/**
 * Export justification records and project info to an Excel file.
 * The file is automatically downloaded by the browser.
 */
export async function exportToExcel(
  records: JustificationRecord[],
  projectInfo: ProjectInfo
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Time Extension Justification Manager';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Justifications', {
    views: [{ state: 'frozen', xSplit: 1, ySplit: 9 }],
  });

  // === Project Info Section ===
  const titleRow = worksheet.addRow(['JUSTIFICATIONS ON TIME EXTENSION REQUEST']);
  titleRow.font = { bold: true, size: 14 };
  worksheet.mergeCells(1, 1, 1, 10);

  worksheet.addRow([]);

  const infoFields = [
    [`Client: ${projectInfo.client}`, '', '', '', `Project Contract Time (in terms of Date): ${projectInfo.projectContractTime}`],
    [`Name of Project: ${projectInfo.nameOfProject}`, '', '', '', `Project Signed Date: ${projectInfo.projectSignedDate}`],
    [`Project Location: ${projectInfo.projectLocation}`, '', '', '', `Actual Project Started Date: ${projectInfo.actualProjectStartedDate}`],
    [`Main Contractor: ${projectInfo.mainContractor}`, '', '', '', `Project Started Date according to Contract: ${projectInfo.projectStartedDateAccordingToContract}`],
    [`Consultant: ${projectInfo.consultant}`, '', '', '', `Site Acceptance Date: ${projectInfo.siteAcceptanceDate}`],
  ];

  infoFields.forEach((fields) => {
    const row = worksheet.addRow(fields);
    row.font = { size: 11 };
  });

  worksheet.addRow([]);

  // === Table Headers ===
  const headerRow = worksheet.addRow(HEADERS);
  headerRow.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E79' },
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  headerRow.height = 40;

  // Set column widths
  const colWidths = [6, 25, 35, 20, 20, 20, 25, 20, 20, 20, 14, 14, 14, 14, 14, 14, 18, 20, 20];
  colWidths.forEach((w, i) => {
    worksheet.getColumn(i + 1).width = w;
  });

  // === Data Rows ===
  records.forEach((record) => {
    const row = worksheet.addRow([
      record.no,
      record.generalCase,
      record.specificCase,
      record.contractorBylaw,
      record.fidicBylaw,
      record.civilCodeBylaw,
      record.proclamationBylaw,
      record.sbdWorkBylaw,
      record.requestSubject,
      record.letterReferenceNumber,
      record.letterDate,
      record.intervalFrom,
      record.intervalUpTo,
      record.delayClaimedDate,
      record.overlapClaimedDate,
      record.claimedTime,
      record.totalCumulativeTimeClaimed,
      record.remark,
      record.referenceForClaim,
    ]);
    row.alignment = { vertical: 'middle', wrapText: true };
    row.height = 30;
  });

  // Add borders to all data cells
  const startRow = 9; // header row number
  const endRow = startRow + records.length;
  for (let r = startRow; r <= endRow; r++) {
    const row = worksheet.getRow(r);
    for (let c = 1; c <= HEADERS.length; c++) {
      const cell = row.getCell(c);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
  }

  // === Generate and Download ===
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'justification_time_extension.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
