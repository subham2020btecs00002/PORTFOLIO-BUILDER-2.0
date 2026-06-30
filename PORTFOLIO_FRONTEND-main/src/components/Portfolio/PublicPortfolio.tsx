import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './PublicPortfolio.css';
import { baseUrl } from '../url';
import { TailSpin } from 'react-loader-spinner';
import type { Portfolio, ContactFormData, ProfessionalHistory } from '../../types';

// Static icon imports
import githubIcon from '../images/github.png';
import linkIcon from '../images/linkImage.png';
import leetcodeIcon from '../images/leetcode.png';
import gfgIcon from '../images/icons8-geeksforgeeks-96.png';

/** Parameters extracted from the /portfolio/public/:userId route. */
interface PublicPortfolioParams {
  userId: string;
}

/**
 * Public-facing portfolio page.
 * Fetches portfolio data for the given userId and renders the full profile.
 */
const PublicPortfolio: React.FC = () => {
  const { userId } = useParams<keyof PublicPortfolioParams>() as PublicPortfolioParams;

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    reason: '',
  });

  useEffect(() => {
    const fetchPortfolio = async (): Promise<void> => {
      try {
        const { data } = await axios.get<Portfolio>(
          `${baseUrl}/api/portfolio/public/${userId}`,
        );
        setPortfolio(data);
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data?.message ?? 'Error fetching portfolio');
      } finally {
        setLoading(false);
      }
    };

    void fetchPortfolio();
  }, [userId]);

  const handleScrollTo = (section: string): void => {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
    setIsSidebarOpen(false);
  };

  const handleInputChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    setContactForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseUrl}/api/contact`, contactForm);
      if (response.status === 200) {
        toast.success('Email sent successfully');
        setContactForm({ name: '', email: '', phone: '', reason: '' });
      }
    } catch (err) {
      toast.error('Error sending email');
      console.error('Error sending email:', err);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <TailSpin height="80" width="80" color="#007bff" ariaLabel="loading" />
      </div>
    );
  }

  if (error || !portfolio) {
    return <div className="error">No Portfolio Found !!!</div>;
  }

  const currentJob: ProfessionalHistory | undefined = portfolio.professionalHistory.find(
    (job) => job.isCurrentEmployee,
  );

  return (
    <div className="public-portfolio">
      <div className="welcome-message">
        <h1>Hi, welcome to my personal portfolio!</h1>
      </div>

      <header className="header">
        <nav>
          <div className="nav-left">
            <button
              className="toggle-button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            >
              ☰
            </button>
          </div>
          <ul className="nav-right">
            <li onClick={() => handleScrollTo('about')}>About</li>
            <li onClick={() => handleScrollTo('resume')}>My Resume</li>
            <li onClick={() => handleScrollTo('project')}>My Projects</li>
            <li onClick={() => handleScrollTo('contact')}>Contact Me</li>
          </ul>
        </nav>
      </header>

      {isSidebarOpen && (
        <div className="sidebar">
          <button className="close-button" onClick={() => setIsSidebarOpen(false)}>
            ✖
          </button>
          <ul>
            <li onClick={() => handleScrollTo('about')}>About</li>
            <li onClick={() => handleScrollTo('resume')}>My Resume</li>
            <li onClick={() => handleScrollTo('project')}>My Projects</li>
            <li onClick={() => handleScrollTo('contact')}>Contact Me</li>
          </ul>
        </div>
      )}

      <div className="portfolio-header">
        <h1>{portfolio.user.name}</h1>
        <p>
          Hi, I am {currentJob ? currentJob.position : 'a professional'} at{' '}
          {currentJob ? currentJob.companyName : 'my current company'}
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* About / Professional History / Education                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="portfolio-content" id="about">
        <h2>About Me</h2>
        <p className="about-me">{portfolio.description || 'No description available'}</p>

        <h2>Professional History</h2>
        {portfolio.professionalHistory.length > 0 ? (
          portfolio.professionalHistory.map((hist, index) => (
            <div key={index} className="professional-history">
              <div className="company-duration">
                <h3 className="company-name">{hist.companyName}</h3>
                <p className="duration">
                  {new Date(hist.yearOfJoining).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'short',
                  })}{' '}
                  to{' '}
                  {hist.isCurrentEmployee
                    ? 'Present'
                    : hist.yearOfLeaving
                    ? new Date(hist.yearOfLeaving).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'short',
                      })
                    : '—'}
                </p>
              </div>
              <p className="position">
                <span className="label">Position:</span> {hist.position}
              </p>
              <div className="responsibility">
                <span className="responsibility-label">Responsibility:</span>
                <div className="responsibility-list">
                  {hist.responsibility.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No professional history available</p>
        )}

        <h2>Education</h2>
        {portfolio.education.length > 0 ? (
          portfolio.education.map((edu, index) => (
            <div key={index} className="professional-history">
              <div className="company-duration">
                <h3 className="company-name">{edu.collegeName}</h3>
                <p className="duration">
                  {new Date(edu.yearOfJoining).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'short',
                  })}{' '}
                  to{' '}
                  {new Date(edu.yearOfPassing).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
              <p className="degree">
                {edu.degree} in {edu.branch}
              </p>
              <p className="cgpa">CGPA: {edu.cgpaOrPercentage}</p>
            </div>
          ))
        ) : (
          <p>No education details available</p>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Projects & Portfolio Links                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="portfolio-content" id="project">
        <h2>Projects</h2>
        {portfolio.projects.length > 0 ? (
          portfolio.projects.map((project, index) => (
            <div key={index} className="project">
              <h3>{project.title}</h3>
              <p className="responsibility">
                <span className="responsibility-label">Project Description:</span>
                <div className="responsibility-list">
                  {project.description.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </p>
              {project.link && (
                <button
                  onClick={() => window.open(project.link, '_blank')}
                  className="project-link"
                >
                  View Project
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No projects available</p>
        )}

        <div className="portfolio-content" id="links">
          <h2>Portfolio Links</h2>
          <div className="portfolio-links">
            <div className="link-item">
              <img src={githubIcon as string} alt="GitHub" className="portfolio-icon" />
              <a
                href={portfolio.portfolioLinks.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={linkIcon as string} alt="Link" className="link-icon" />
              </a>
            </div>
            <div className="link-item">
              <img
                src={leetcodeIcon as string}
                alt="LeetCode"
                className="portfolio-icon"
              />
              <a
                href={portfolio.portfolioLinks.leetcode}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={linkIcon as string} alt="Link" className="link-icon" />
              </a>
            </div>
            <div className="link-item">
              <img
                src={gfgIcon as string}
                alt="GeeksforGeeks"
                className="portfolio-icon"
              />
              <a
                href={portfolio.portfolioLinks.gfg}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={linkIcon as string} alt="Link" className="link-icon" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Resume                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="portfolio-content" id="resume">
        <h2>Resume</h2>
        {portfolio._id ? (
          <a
            href={`${baseUrl}/api/portfolio/download/${portfolio._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="resume-download-link"
          >
            <button className="download-button">Download Resume</button>
          </a>
        ) : (
          <p>No resume available to download</p>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Contact Form                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="portfolio-content" id="contact">
        <h2>Contact</h2>
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={contactForm.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={contactForm.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={contactForm.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reason">Reason of Contact</label>
            <textarea
              id="reason"
              name="reason"
              value={contactForm.reason}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit">Send</button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};

export default PublicPortfolio;
