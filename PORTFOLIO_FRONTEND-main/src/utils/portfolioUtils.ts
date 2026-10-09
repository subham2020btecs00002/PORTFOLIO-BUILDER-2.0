import type { ProfessionalHistory, Education } from '../types';

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

/**
 * Sorts academic education in reverse chronological order:
 * 1. Current programs (presently studying) always come first, sorted by joining date descending.
 * 2. Completed programs come next, sorted by graduation/passing date descending.
 * 3. Fallback to sorting by joining date descending.
 */
export const getSortedEducation = (education: Education[]): Education[] => {
  return [...(education || [])].sort((a, b) => {
    // Current studies come first
    if (a.isCurrentStudent && !b.isCurrentStudent) return -1;
    if (!a.isCurrentStudent && b.isCurrentStudent) return 1;

    // If both are current, sort by joining date descending
    if (a.isCurrentStudent && b.isCurrentStudent) {
      const aJoin = a.yearOfJoining ? new Date(a.yearOfJoining).getTime() : 0;
      const bJoin = b.yearOfJoining ? new Date(b.yearOfJoining).getTime() : 0;
      return bJoin - aJoin;
    }

    // If both are completed, sort by passing date descending
    const aPass = a.yearOfPassing ? new Date(a.yearOfPassing).getTime() : 0;
    const bPass = b.yearOfPassing ? new Date(b.yearOfPassing).getTime() : 0;
    if (aPass !== bPass) {
      return bPass - aPass;
    }

    // Fallback to joining date descending
    const aJoin = a.yearOfJoining ? new Date(a.yearOfJoining).getTime() : 0;
    const bJoin = b.yearOfJoining ? new Date(b.yearOfJoining).getTime() : 0;
    return bJoin - aJoin;
  });
};
