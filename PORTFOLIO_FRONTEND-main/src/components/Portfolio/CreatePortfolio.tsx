import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import PortfolioFormShell from './PortfolioFormShell';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Smart wrapper: redirects to /portfolio/edit if a portfolio already exists,
 * otherwise renders the creation form shell.
 */
const CreatePortfolio: React.FC = () => {
  const [portfolioExists, setPortfolioExists] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const checkPortfolioExists = async (): Promise<void> => {
      try {
        const { data } = await api.get<{ exists: boolean }>('/api/portfolio/exists');
        if (!isMounted) return;
        setPortfolioExists(data.exists);
        if (data.exists) {
          navigate('/portfolio/edit', { replace: true });
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setPortfolioExists(false);
        if (err instanceof Error) console.error(err.message);
      }
    };

    void checkPortfolioExists();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (portfolioExists === null) {
    return <LoadingSpinner fullPage message="Initializing portfolio wizard..." />;
  }

  return portfolioExists ? null : (
    <div className="portfolio-page-wrapper builder-page-wrapper">
      <PortfolioFormShell mode="create" />
    </div>
  );
};

export default CreatePortfolio;
