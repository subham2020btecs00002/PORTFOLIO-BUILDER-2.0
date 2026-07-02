import React, { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';
import api from '../api';
import type { Portfolio, PortfolioFormData } from '../../types';
import PortfolioFormShell from './PortfolioFormShell';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Fetches the user's existing portfolio, formats the date values,
 * and passes the data to the shared form shell.
 */
const EditPortfolio: React.FC = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioFormData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPortfolio = debounce(async (): Promise<void> => {
      try {
        const { data } = await api.get<Portfolio>('/api/portfolio');

        const transformed: PortfolioFormData = {
          title: data.title || '',
          description: data.description || '',
          templateId: data.templateId || 'classic-green',
          sectionOrder: data.sectionOrder || ['about', 'skills', 'experience', 'projects', 'contact'],
          themeColor: data.themeColor || 'default',
          fontFamily: data.fontFamily || 'default',
          borderRadius: data.borderRadius || 'default',
          pdf: null,
          portfolioLinks: {
            github: data.portfolioLinks?.github || '',
            leetcode: data.portfolioLinks?.leetcode || '',
            gfg: data.portfolioLinks?.gfg || '',
            linkedin: data.portfolioLinks?.linkedin || '',
          },
          skills: data.skills?.length
            ? data.skills.map((s) => ({
                name: s.name || '',
                level: s.level || 'Intermediate',
                category: s.category || '',
              }))
            : [{ name: '', level: 'Intermediate', category: '' }],
          projects: data.projects?.length
            ? data.projects.map((p) => ({
                title: p.title || '',
                description: p.description || '',
                link: p.link || '',
              }))
            : [],
          education: data.education?.length
            ? data.education.map((edu) => ({
                collegeName: edu.collegeName || '',
                degree: edu.degree || '',
                branch: edu.branch || '',
                cgpaOrPercentage: String(edu.cgpaOrPercentage || ''),
                yearOfJoining: edu.yearOfJoining
                  ? new Date(edu.yearOfJoining).toISOString().substring(0, 10)
                  : '',
                yearOfPassing: edu.yearOfPassing
                  ? new Date(edu.yearOfPassing).toISOString().substring(0, 10)
                  : '',
              }))
            : [],
          professionalHistory: data.professionalHistory?.length
            ? data.professionalHistory.map((hist) => ({
                companyName: hist.companyName || '',
                position: hist.position || '',
                responsibility: hist.responsibility || '',
                isCurrentEmployee: !!hist.isCurrentEmployee,
                yearOfJoining: hist.yearOfJoining
                  ? new Date(hist.yearOfJoining).toISOString().substring(0, 10)
                  : '',
                yearOfLeaving: hist.yearOfLeaving && !hist.isCurrentEmployee
                  ? new Date(hist.yearOfLeaving).toISOString().substring(0, 10)
                  : '',
              }))
            : [],
        };

        setPortfolioData(transformed);
      } catch (err: unknown) {
        if (err instanceof Error) console.error(err.message);
      } finally {
        setLoading(false);
      }
    }, 300);

    void fetchPortfolio();
    return () => fetchPortfolio.cancel();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage message="Fetching your portfolio configurations..." />;
  }

  return (
    <div className="portfolio-page-wrapper">
      {portfolioData ? (
        <PortfolioFormShell mode="edit" initialData={portfolioData} />
      ) : (
        <div className="portfolio-not-found card-glass">
          <h2>No Portfolio Found</h2>
          <p>Please go back to the home page and create your portfolio first.</p>
        </div>
      )}
    </div>
  );
};

export default EditPortfolio;
