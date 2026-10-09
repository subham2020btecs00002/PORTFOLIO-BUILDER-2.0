import React, { Suspense } from 'react';
import type { TemplateProps } from './common/types';

// Lazy loaders & preload registry
export const templatePreloaders: Record<string, () => Promise<any>> = {
  'dark-pro': () => import('./DarkPro'),
  'creative': () => import('./Creative'),
  'minimalist': () => import('./Minimalist'),
  'cyberpunk': () => import('./Cyberpunk'),
  'neobrutalism': () => import('./Neobrutalism'),
  'cli': () => import('./DevTerminal'),
  'bento': () => import('./BentoGrid'),
  'latex': () => import('./AcademicLaTeX'),
  'rpg': () => import('./GamifiedRPG'),
  'classic-green': () => import('./ClassicGreen'),
};

const ClassicGreen  = React.lazy(() => templatePreloaders['classic-green']().then(m => ({ default: m.ClassicGreen })));
const DarkPro       = React.lazy(() => templatePreloaders['dark-pro']().then(m => ({ default: m.DarkPro })));
const Creative      = React.lazy(() => templatePreloaders['creative']().then(m => ({ default: m.Creative })));
const Minimalist    = React.lazy(() => templatePreloaders['minimalist']().then(m => ({ default: m.Minimalist })));
const Cyberpunk     = React.lazy(() => templatePreloaders['cyberpunk']().then(m => ({ default: m.Cyberpunk })));
const Neobrutalism  = React.lazy(() => templatePreloaders['neobrutalism']().then(m => ({ default: m.Neobrutalism })));
const DevTerminal   = React.lazy(() => templatePreloaders['cli']().then(m => ({ default: m.DevTerminal })));
const BentoGrid     = React.lazy(() => templatePreloaders['bento']().then(m => ({ default: m.BentoGrid })));
const AcademicLaTeX = React.lazy(() => templatePreloaders['latex']().then(m => ({ default: m.AcademicLaTeX })));
const GamifiedRPG   = React.lazy(() => templatePreloaders['rpg']().then(m => ({ default: m.GamifiedRPG })));

interface TemplateRendererProps extends TemplateProps {
  templateId?: string;
}

const TemplateFallback: React.FC = () => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.5,
      transition: 'opacity 0.2s ease',
    }}
  >
    <div
      style={{
        width: '90%',
        maxWidth: '800px',
        height: '240px',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.04)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  </div>
);

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({ templateId, ...props }) => {
  const activeTemplateId = templateId || props.portfolio.templateId || 'classic-green';

  const renderComponent = () => {
    switch (activeTemplateId) {
      case 'dark-pro':      return <DarkPro {...props} />;
      case 'creative':      return <Creative {...props} />;
      case 'minimalist':    return <Minimalist {...props} />;
      case 'cyberpunk':     return <Cyberpunk {...props} />;
      case 'neobrutalism':  return <Neobrutalism {...props} />;
      case 'cli':           return <DevTerminal {...props} />;
      case 'bento':         return <BentoGrid {...props} />;
      case 'latex':         return <AcademicLaTeX {...props} />;
      case 'rpg':           return <GamifiedRPG {...props} />;
      case 'classic-green':
      default:              return <ClassicGreen {...props} />;
    }
  };

  return (
    <Suspense fallback={<TemplateFallback />}>
      {renderComponent()}
    </Suspense>
  );
};
export default TemplateRenderer;
