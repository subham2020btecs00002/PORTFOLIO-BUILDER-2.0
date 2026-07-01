import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import { FaSpinner } from 'react-icons/fa';
import api from '../api';
import PortfolioFormShell from './PortfolioFormShell';

/**
 * Smart wrapper: redirects to /portfolio/edit if a portfolio already exists,
 * otherwise renders the creation form shell.
 */
const CreatePortfolio: React.FC = () => {
  const [portfolioExists, setPortfolioExists] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPortfolioExists = debounce(async (): Promise<void> => {
      try {
        const { data } = await api.get<{ exists: boolean }>('/api/portfolio/exists');
        setPortfolioExists(data.exists);
        if (data.exists) {
          navigate('/portfolio/edit');
        }
      } catch (err: unknown) {
        setPortfolioExists(false);
        if (err instanceof Error) console.error(err.message);
      }
    }, 300);

    void checkPortfolioExists();
    return () => checkPortfolioExists.cancel();
  }, [navigate]);

  if (portfolioExists === null) {
    return (
      <div className="spinner-container">
        <FaSpinner className="spinner-icon" />
      </div>
    );
  }

  return portfolioExists ? null : (
    <div className="portfolio-page-wrapper">
      <PortfolioFormShell mode="create" />
    </div>
  );
};

export default CreatePortfolio;
