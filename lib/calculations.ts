/**
 * Auto-calculation utilities for the justification table.
 * Handles delay computation and cumulative time calculations.
 */

import { JustificationRecord } from '@/types/tableTypes';

/**
 * Calculate the delay (in days) between two date strings.
 * Returns 0 if either date is missing or invalid.
 */
export function calculateDelay(intervalFrom: string, intervalUpTo: string): number {
  if (!intervalFrom || !intervalUpTo) return 0;

  try {
    const from = new Date(intervalFrom);
    const to = new Date(intervalUpTo);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) return 0;

    const diffMs = to.getTime() - from.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  } catch {
    return 0;
  }
}

/**
 * Recalculate all auto-computed fields for the given records.
 * - delayClaimedDate: difference between intervalFrom and intervalUpTo
 * - claimedTime: delayClaimedDate minus overlapClaimedDate
 * - totalCumulativeTimeClaimed: running sum of claimedTime values
 */
export function recalculateAll(records: JustificationRecord[]): JustificationRecord[] {
  let cumulativeTotal = 0;

  return records.map((record) => {
    // Calculate delay from interval dates
    const delay = calculateDelay(record.intervalFrom, record.intervalUpTo);

    // Claimed time = delay - overlap
    const overlap = typeof record.overlapClaimedDate === 'number' ? record.overlapClaimedDate : 0;
    const claimed = Math.max(delay - overlap, 0);

    // Running cumulative total
    cumulativeTotal += claimed;

    return {
      ...record,
      delayClaimedDate: delay,
      claimedTime: claimed,
      totalCumulativeTimeClaimed: cumulativeTotal,
    };
  });
}
