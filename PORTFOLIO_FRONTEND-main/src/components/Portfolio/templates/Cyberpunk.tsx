import React from 'react';
import { SectionalThemeTemplate } from './common/SectionalThemeTemplate';
import type { TemplateProps } from './common/types';

export const Cyberpunk: React.FC<TemplateProps> = (props) => (
  <SectionalThemeTemplate {...props} themeClass="cyberpunk-theme" variant="cyberpunk" />
);
