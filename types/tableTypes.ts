/**
 * Type definitions for the Construction Time Extension Justification Manager.
 * These types define the structure of table rows and project metadata.
 */

/** Represents a single justification row in the table */
export interface JustificationRecord {
  id: string;
  no: number;
  generalCase: string;
  specificCase: string;
  contractorBylaw: string;
  fidicBylaw: string;
  civilCodeBylaw: string;
  proclamationBylaw: string;
  sbdWorkBylaw: string;
  requestSubject: string;
  letterReferenceNumber: string;
  letterDate: string;
  intervalFrom: string;
  intervalUpTo: string;
  delayClaimedDate: number;
  overlapClaimedDate: number;
  claimedTime: number;
  totalCumulativeTimeClaimed: number;
  remark: string;
  referenceForClaim: string;
}

/** Project metadata displayed above the table */
export interface ProjectInfo {
  client: string;
  nameOfProject: string;
  projectLocation: string;
  mainContractor: string;
  consultant: string;
  projectContractTime: string;
  projectSignedDate: string;
  actualProjectStartedDate: string;
  projectStartedDateAccordingToContract: string;
  siteAcceptanceDate: string;
}

/** Column definition for the AG Grid table */
export interface ColumnConfig {
  field: keyof JustificationRecord;
  headerName: string;
  width?: number;
  minWidth?: number;
  editable?: boolean;
  type?: 'text' | 'number' | 'date' | 'textarea';
  pinned?: 'left' | 'right' | null;
  cellEditor?: string;
  cellEditorParams?: Record<string, unknown>;
  valueFormatter?: string;
  sortable?: boolean;
  filter?: boolean;
  resizable?: boolean;
}

/** LocalStorage keys used by the application */
export const STORAGE_KEYS = {
  RECORDS: 'construction_time_extension_records',
  PROJECT_INFO: 'construction_time_extension_project_info',
} as const;

/** Default empty record factory */
export function createEmptyRecord(no: number, id: string): JustificationRecord {
  return {
    id,
    no,
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
}

/** Default empty project info */
export function createDefaultProjectInfo(): ProjectInfo {
  return {
    client: '',
    nameOfProject: '',
    projectLocation: '',
    mainContractor: '',
    consultant: '',
    projectContractTime: '',
    projectSignedDate: '',
    actualProjectStartedDate: '',
    projectStartedDateAccordingToContract: '',
    siteAcceptanceDate: '',
  };
}
