import React from 'react';
import { SectionalThemeTemplate } from './common/SectionalThemeTemplate';
import type { TemplateProps } from './common/types';

export const Neobrutalism: React.FC<TemplateProps> = (props) => (
  <SectionalThemeTemplate {...props} themeClass="neobrutalism-theme" />
);
