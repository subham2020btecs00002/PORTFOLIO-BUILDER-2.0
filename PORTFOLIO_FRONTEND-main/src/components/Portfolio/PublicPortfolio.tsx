import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaShareAlt, FaCopy, FaQrcode, FaTimes, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../common/LoadingSpinner';
import QRCode from 'qrcode';
import { baseUrl } from '../url';
import type { Portfolio, ContactFormData } from '../../types';

// Import templates & template CSS
import { ClassicGreen } from './templates/ClassicGreen';
import { DarkPro } from './templates/DarkPro';
import { Creative } from './templates/Creative';
import { Minimalist } from './templates/Minimalist';
import { Cyberpunk } from './templates/Cyberpunk';
import { Neobrutalism } from './templates/Neobrutalism';
import { DevTerminal } from './templates/DevTerminal';
import { BentoGrid } from './templates/BentoGrid';
import { AcademicLaTeX } from './templates/AcademicLaTeX';
import { GamifiedRPG } from './templates/GamifiedRPG';
import { ResumePrint } from './templates/ResumePrint';
import './templates/templates.css';

interface PublicPortfolioProps {
  isResumeMode?: boolean;
}

const PublicPortfolio: React.FC<PublicPortfolioProps> = ({ isResumeMode = false }) => {
  const { username, userId } = useParams<{ username?: string; userId?: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    reason: '',
  });

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const url = username
          ? `${baseUrl}/api/portfolio/public/by-username/${username}`
          : `${baseUrl}/api/portfolio/public/${userId}`;
        const { data } = await axios.get<Portfolio>(url);
        setPortfolio(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Portfolio not found');
      } finally {
        setLoading(false);
      }
    };

    if (username || (userId && userId !== 'undefined' && userId !== 'null')) {
      void fetchPortfolio();
    } else {
      setLoading(false);
      setError('Invalid Portfolio Link');
    }
  }, [username, userId]);

  // Generate QR Code once portfolio is loaded
  useEffect(() => {
    if (portfolio) {
      QRCode.toDataURL(window.location.href, { width: 200, margin: 2 })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Error generating QR code:', err));
    }
  }, [portfolio]);

  // Auto-print effect when in resume view mode
  useEffect(() => {
    let timer: any;
    if (isResumeMode && !loading && portfolio) {
      timer = setTimeout(() => {
        window.print();
      }, 800);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isResumeMode, loading, portfolio]);

  const handleScrollTo = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolio) return;
    
    try {
      // Send contact message (owner user id is in portfolio.user._id)
      const response = await axios.post(`${baseUrl}/api/contact`, {
        ...contactForm,
        userId: portfolio.user._id || portfolio.user.id,
      });
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Email sent successfully');
        setContactForm({
          name: '',
          email: '',
          phone: '',
          reason: '',
        });
      }
    } catch (err) {
      toast.error('Error sending email');
      console.error(err);
    }
  };

  const copyPortfolioLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading public portfolio..." />;
  }

  if (error || !portfolio) {
    return (
      <div className="portfolio-not-found card-glass" style={{ margin: '80px auto', maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
        <h2>404 - Portfolio Not Found</h2>
        <p>The requested portfolio username does not exist or has been deleted.</p>
        <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
          Go to Homepage
        </button>
      </div>
    );
  }

  // Choose template component
  const renderTemplate = () => {
    const props = {
      portfolio,
      contactForm,
      handleInputChange,
      handleSubmit,
      handleScrollTo,
      theme,
    };

    switch (portfolio.templateId) {
      case 'dark-pro':
        return <DarkPro {...props} />;
      case 'creative':
        return <Creative {...props} />;
      case 'minimalist':
        return <Minimalist {...props} />;
      case 'cyberpunk':
        return <Cyberpunk {...props} />;
      case 'neobrutalism':
        return <Neobrutalism {...props} />;
      case 'cli':
        return <DevTerminal {...props} />;
      case 'bento':
        return <BentoGrid {...props} />;
      case 'latex':
        return <AcademicLaTeX {...props} />;
      case 'rpg':
        return <GamifiedRPG {...props} />;
      case 'classic-green':
      default:
        return <ClassicGreen {...props} />;
    }
  };

  const shareText = `Check out my professional developer portfolio built on PortfolioBuilder:`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;

  if (isResumeMode) {
    return portfolio ? <ResumePrint portfolio={portfolio} /> : null;
  }

  return (
    <div className="public-portfolio-wrapper">
      {renderTemplate()}

      {/* Floating Share Button (original style) */}
      <button className="floating-share-btn" onClick={() => setIsShareModalOpen(true)}>
        <FaShareAlt /> Share Portfolio
      </button>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="share-modal-overlay animated fade-in" onClick={() => setIsShareModalOpen(false)}>
          <div className="share-modal card-glass" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share Portfolio</h3>
              <button className="btn-close-modal" onClick={() => setIsShareModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="share-modal-body">
              <p>Share your professional page with recruiters and friends.</p>
              
              <div className="share-link-input-group">
                <input type="text" value={window.location.href} readOnly />
                <button onClick={copyPortfolioLink} title="Copy Link">
                  <FaCopy /> Copy
                </button>
              </div>

              <div className="share-social-grid">
                <a href={linkedinShareUrl} target="_blank" rel="noopener noreferrer" className="btn-share-social linkedin">
                  <FaLinkedin /> LinkedIn
                </a>
                <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" className="btn-share-social twitter">
                  <FaTwitter /> Twitter / X
                </a>
              </div>

              {qrCodeUrl && (
                <div className="qr-code-section">
                  <h4>QR Code Profile</h4>
                  <img src={qrCodeUrl} alt="QR Code Profile" />
                  <a href={qrCodeUrl} download={`${username || portfolio.user.username || 'portfolio'}-portfolio-qr.png`} className="btn-secondary" style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                    <FaQrcode /> Download QR Code
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default PublicPortfolio;
