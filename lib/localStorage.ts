/**
 * LocalStorage utility functions for persisting and retrieving data.
 * All table data and project info are stored in the browser's LocalStorage.
 */

import { JustificationRecord, ProjectInfo, STORAGE_KEYS, createDefaultProjectInfo } from '@/types/tableTypes';

/**
 * Save justification records to LocalStorage.
 */
export function saveRecords(records: JustificationRecord[]): void {
  try {
    const serialized = JSON.stringify(records);
    localStorage.setItem(STORAGE_KEYS.RECORDS, serialized);
  } catch (error) {
    console.error('Failed to save records to LocalStorage:', error);
  }
}

/**
 * Load justification records from LocalStorage.
 * Returns an empty array if no data is found.
 */
export function loadRecords(): JustificationRecord[] {
  try {
    const serialized = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!serialized) return [];
    return JSON.parse(serialized) as JustificationRecord[];
  } catch (error) {
    console.error('Failed to load records from LocalStorage:', error);
    return [];
  }
}

/**
 * Save project info to LocalStorage.
 */
export function saveProjectInfo(info: ProjectInfo): void {
  try {
    const serialized = JSON.stringify(info);
    localStorage.setItem(STORAGE_KEYS.PROJECT_INFO, serialized);
  } catch (error) {
    console.error('Failed to save project info to LocalStorage:', error);
  }
}

/**
 * Load project info from LocalStorage.
 * Returns default empty project info if no data is found.
 */
export function loadProjectInfo(): ProjectInfo {
  try {
    const serialized = localStorage.getItem(STORAGE_KEYS.PROJECT_INFO);
    if (!serialized) return createDefaultProjectInfo();
    return JSON.parse(serialized) as ProjectInfo;
  } catch (error) {
    console.error('Failed to load project info from LocalStorage:', error);
    return createDefaultProjectInfo();
  }
}

/**
 * Clear all application data from LocalStorage.
 */
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.RECORDS);
  localStorage.removeItem(STORAGE_KEYS.PROJECT_INFO);
}
