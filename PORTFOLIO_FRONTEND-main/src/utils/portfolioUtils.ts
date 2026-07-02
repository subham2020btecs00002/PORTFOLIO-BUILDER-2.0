import type { ProfessionalHistory } from '../types';

/**
 * Sorts professional history in reverse chronological order:
 * 1. Current employments (present) always come first, sorted by joining date descending.
 * 2. Past employments come next, sorted by leaving date descending.
 * 3. Fallback to sorting by joining date descending.
 */
export const getSortedHistory = (history: ProfessionalHistory[]): ProfessionalHistory[] => {
  return [...(history || [])].sort((a, b) => {
    // Present employments come first
    if (a.isCurrentEmployee && !b.isCurrentEmployee) return -1;
    if (!a.isCurrentEmployee && b.isCurrentEmployee) return 1;

    // If both are present, sort by joining date descending
    if (a.isCurrentEmployee && b.isCurrentEmployee) {
      return new Date(b.yearOfJoining).getTime() - new Date(a.yearOfJoining).getTime();
    }

    // If both are past, sort by leaving date descending
    const aLeave = a.yearOfLeaving ? new Date(a.yearOfLeaving).getTime() : 0;
    const bLeave = b.yearOfLeaving ? new Date(b.yearOfLeaving).getTime() : 0;
    if (aLeave !== bLeave) {
      return bLeave - aLeave;
    }

    // Fallback to joining date descending
    return new Date(b.yearOfJoining).getTime() - new Date(a.yearOfJoining).getTime();
  });
};
