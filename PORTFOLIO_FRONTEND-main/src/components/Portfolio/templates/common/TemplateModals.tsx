import React from 'react';
import type { Portfolio } from '../../../../types';
import { baseUrl } from '../../../url';
import { ProjectSpotlightModal } from '../../ProjectSpotlightModal';
import { PdfViewerModal } from '../../PdfViewerModal';
import { AvatarZoomModal } from '../../AvatarZoomModal';
import type { TemplateModalsState } from './useTemplateModals';

export interface TemplateModalsProps extends TemplateModalsState {
  portfolio: Portfolio;
}

export const TemplateModals: React.FC<TemplateModalsProps> = ({
  portfolio,
  spotlightProject,
  setSpotlightProject,
  viewPdf,
  setViewPdf,
  zoomAvatar,
  setZoomAvatar,
}) => {
  const hasAvatar = Boolean(portfolio.avatarUrl || (portfolio.avatar && portfolio.avatar.contentType));
  const avatarUrl = portfolio.avatarUrl || `${baseUrl}/api/portfolio/avatar/${portfolio._id}`;
  const userName = portfolio.fullName || portfolio.user?.name || 'User';

  return (
    <>
      {spotlightProject && (
        <ProjectSpotlightModal
          project={spotlightProject}
          onClose={() => setSpotlightProject(null)}
        />
      )}
      {viewPdf && portfolio.pdf && (
        <PdfViewerModal
          pdfUrl={`${baseUrl}/api/portfolio/download/${portfolio._id}`}
          onClose={() => setViewPdf(false)}
        />
      )}
      {zoomAvatar && hasAvatar && (
        <AvatarZoomModal
          avatarUrl={avatarUrl}
          userName={userName}
          onClose={() => setZoomAvatar(false)}
        />
      )}
    </>
  );
};
