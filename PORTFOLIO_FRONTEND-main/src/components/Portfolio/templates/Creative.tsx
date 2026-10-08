import React from 'react';
import { SectionalThemeTemplate } from './common/SectionalThemeTemplate';
import type { TemplateProps } from './common/types';

export const Creative: React.FC<TemplateProps> = (props) => (
  <SectionalThemeTemplate
    {...props}
    themeClass="creative-theme"
    backgroundDecoration={<div className="creative-gradient-bg"></div>}
  />
);
