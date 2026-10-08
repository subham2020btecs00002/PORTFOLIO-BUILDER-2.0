import type { Portfolio } from '../../../../types';

export const getThemeOverrideClasses = (portfolio: Portfolio): string => {
  const fontClass = portfolio.fontFamily && portfolio.fontFamily !== 'default' ? `font-family-${portfolio.fontFamily}` : '';
  const radiusClass = portfolio.borderRadius && portfolio.borderRadius !== 'default' ? `radius-override-${portfolio.borderRadius}` : '';
  const colorClass = portfolio.themeColor && portfolio.themeColor !== 'default' ? `color-override-${portfolio.themeColor}` : '';

  return `${fontClass} ${radiusClass} ${colorClass}`.trim();
};
