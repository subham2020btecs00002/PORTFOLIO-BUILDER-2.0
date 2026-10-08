import { useState } from 'react';
import type { Project } from '../../../../types';

export interface TemplateModalsState {
  spotlightProject: Project | null;
  setSpotlightProject: (project: Project | null) => void;
  viewPdf: boolean;
  setViewPdf: (view: boolean) => void;
  zoomAvatar: boolean;
  setZoomAvatar: (zoom: boolean) => void;
}

export const useTemplateModals = (): TemplateModalsState => {
  const [spotlightProject, setSpotlightProject] = useState<Project | null>(null);
  const [viewPdf, setViewPdf] = useState<boolean>(false);
  const [zoomAvatar, setZoomAvatar] = useState<boolean>(false);

  return {
    spotlightProject,
    setSpotlightProject,
    viewPdf,
    setViewPdf,
    zoomAvatar,
    setZoomAvatar,
  };
};
