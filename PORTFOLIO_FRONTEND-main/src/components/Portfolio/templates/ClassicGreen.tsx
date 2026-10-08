import React from 'react';
import { SectionalThemeTemplate } from './common/SectionalThemeTemplate';
import type { TemplateProps } from './common/types';

export const ClassicGreen: React.FC<TemplateProps> = (props) => (
  <SectionalThemeTemplate {...props} themeClass="classic-green-theme" />
);
