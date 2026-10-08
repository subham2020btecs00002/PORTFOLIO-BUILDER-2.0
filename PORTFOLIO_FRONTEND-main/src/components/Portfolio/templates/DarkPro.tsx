import React from 'react';
import { SectionalThemeTemplate } from './common/SectionalThemeTemplate';
import type { TemplateProps } from './common/types';

export const DarkPro: React.FC<TemplateProps> = (props) => (
  <SectionalThemeTemplate
    {...props}
    themeClass="dark-pro-theme"
    backgroundDecoration={
      <div className="dark-pro-bg">
        <div className="dark-sphere ds-1"></div>
        <div className="dark-sphere ds-2"></div>
      </div>
    }
  />
);
