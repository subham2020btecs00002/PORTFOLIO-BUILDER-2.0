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
    const aIsCurrent = Boolean(
      a.isCurrentStudent && (!a.yearOfPassing || new Date(a.yearOfPassing).getTime() > Date.now())
    );
    const bIsCurrent = Boolean(
      b.isCurrentStudent && (!b.yearOfPassing || new Date(b.yearOfPassing).getTime() > Date.now())
    );

    // Current studies come first
    if (aIsCurrent && !bIsCurrent) return -1;
    if (!aIsCurrent && bIsCurrent) return 1;

    // If both are current, sort by joining date descending
    if (aIsCurrent && bIsCurrent) {
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

/**
 * Formats education date range nicely (e.g. "2020 - 2024", "2025 - Present", or "2024").
 */
export const formatEducationDateRange = (edu: Education, separator = ' - '): string => {
  const joinYear = edu.yearOfJoining ? new Date(edu.yearOfJoining).getFullYear() : null;
  const passYear = edu.yearOfPassing ? new Date(edu.yearOfPassing).getFullYear() : null;
  const isPastGraduation = passYear !== null && new Date(edu.yearOfPassing!).getTime() <= Date.now();

  const isCurrent = Boolean(edu.isCurrentStudent && !isPastGraduation);
  const endLabel = isCurrent ? 'Present' : (passYear ? String(passYear) : '');

  if (joinYear && endLabel) {
    return `${joinYear}${separator}${endLabel}`;
  }
  if (endLabel) {
    return endLabel;
  }
  if (joinYear) {
    return String(joinYear);
  }
  return 'N/A';
};
