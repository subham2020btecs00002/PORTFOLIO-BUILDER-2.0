import React, { useState } from 'react';
import type { Portfolio, ContactFormData, Project } from '../../../types';
import { baseUrl } from '../../url';
import { getSortedHistory } from '../../../utils/portfolioUtils';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { ProjectSpotlightModal } from '../ProjectSpotlightModal';
import { PdfViewerModal } from '../PdfViewerModal';

interface TemplateProps {
  portfolio: Portfolio;
  contactForm: ContactFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleScrollTo: (sectionId: string) => void;
  isPreview?: boolean;
  theme?: string;
  toggleTheme?: () => void;
}

export const AcademicLaTeX: React.FC<TemplateProps> = ({
  portfolio,
  contactForm,
  handleInputChange,
  handleSubmit,
  isPreview = false,
  theme,
  toggleTheme,
}) => {
  useScrollReveal();

  const [spotlightProject, setSpotlightProject] = useState<Project | null>(null);
  const [viewPdf, setViewPdf] = useState<boolean>(false);

  const fontClass = portfolio.fontFamily && portfolio.fontFamily !== 'default' ? `font-family-${portfolio.fontFamily}` : '';
  const colorClass = portfolio.themeColor && portfolio.themeColor !== 'default' ? `color-override-${portfolio.themeColor}` : '';

  return (
    <div className={`theme-container latex-theme ${fontClass} ${colorClass}`}>
      {isPreview && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '80px',
          background: 'var(--primary-color, #1a1a1a)',
          color: '#ffffff',
          padding: '6px 14px',
          borderRadius: '4px',
          fontSize: '0.8rem',
          fontWeight: 700,
          border: '1px solid #ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 1000,
          fontFamily: 'serif'
        }}>
          Preview Mode
        </div>
      )}

      {/* Main Document Paper */}
      <div className="latex-document reveal-on-scroll">
        
        {/* Header Section */}
        <header className="latex-header">
          <h1 className="latex-name">{portfolio.user?.name}</h1>
          <p className="latex-title">{portfolio.title}</p>
          
          <div className="latex-contact-info">
            {portfolio.user?.email && (
              <span>Email: <a href={`mailto:${portfolio.user.email}`}>{portfolio.user.email}</a></span>
            )}
            {portfolio.portfolioLinks?.github && (
              <span>GitHub: <a href={portfolio.portfolioLinks.github} target="_blank" rel="noreferrer">{portfolio.portfolioLinks.github.replace(/^https?:\/\//, '')}</a></span>
            )}
            {portfolio.portfolioLinks?.linkedin && (
              <span>LinkedIn: <a href={portfolio.portfolioLinks.linkedin} target="_blank" rel="noreferrer">{portfolio.portfolioLinks.linkedin.replace(/^https?:\/\//, '')}</a></span>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px' }} className="no-print">
            {portfolio.pdf && (
              <button onClick={() => setViewPdf(true)} className="latex-action-btn">
                [View Resume PDF]
              </button>
            )}
            {toggleTheme && (
              <button onClick={toggleTheme} className="latex-action-btn">
                [Toggle Color Theme ({theme || 'dark'})]
              </button>
            )}
          </div>
        </header>

        {/* Divider */}
        <div className="latex-section-divider"></div>

        {/* Biography Section */}
        <section className="latex-section">
          <h2 className="latex-section-title">I. Summary & Statement</h2>
          <div className="latex-section-content">
            <p className="latex-bio-text">{portfolio.description || 'No description summary provided.'}</p>
          </div>
        </section>

        {/* Education Section */}
        <section className="latex-section">
          <h2 className="latex-section-title">II. Academic Education</h2>
          <div className="latex-section-content">
            {portfolio.education && portfolio.education.length > 0 ? (
              portfolio.education.map((edu, idx) => (
                <div key={idx} className="latex-entry">
                  <div className="latex-entry-header">
                    <strong>{edu.collegeName}</strong>
                    <span>
                      {edu.yearOfJoining ? new Date(edu.yearOfJoining).getFullYear() : ''} -- {edu.yearOfPassing ? new Date(edu.yearOfPassing).getFullYear() : 'Present'}
                    </span>
                  </div>
                  <div className="latex-entry-sub">
                    <em>{edu.degree} in {edu.branch}</em>
                    <span>CGPA/Percentage: {edu.cgpaOrPercentage}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No education details listed.</p>
            )}
          </div>
        </section>

        {/* Experience Section */}
        <section className="latex-section">
          <h2 className="latex-section-title">III. Professional Experience</h2>
          <div className="latex-section-content">
            {portfolio.professionalHistory && portfolio.professionalHistory.length > 0 ? (
              getSortedHistory(portfolio.professionalHistory).map((job, idx) => (
                <div key={idx} className="latex-entry" style={{ marginBottom: '15px' }}>
                  <div className="latex-entry-header">
                    <strong>{job.companyName}</strong>
                    <span>
                      {job.yearOfJoining ? new Date(job.yearOfJoining).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} --{' '}
                      {job.isCurrentEmployee ? 'Present' : job.yearOfLeaving ? new Date(job.yearOfLeaving).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </div>
                  <div className="latex-entry-sub" style={{ fontWeight: 600 }}>
                    {job.position}
                  </div>
                  <ul className="latex-bullets">
                    {job.responsibility.split('\n').map((line, lidx) => (
                      <li key={lidx}>{line}</li>
                    ))}
                  </ul>
                  {job.technologies && job.technologies.length > 0 && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                      <em>Core stack:</em> {job.technologies.join(', ')}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p>No professional history listed.</p>
            )}
          </div>
        </section>

        {/* Projects Section */}
        <section className="latex-section">
          <h2 className="latex-section-title">IV. Publications & Technical Projects</h2>
          <div className="latex-section-content">
            {portfolio.projects && portfolio.projects.length > 0 ? (
              portfolio.projects.map((proj, idx) => (
                <div key={idx} className="latex-entry" style={{ marginBottom: '15px' }}>
                  <div className="latex-entry-header">
                    <strong>{proj.title}</strong>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="latex-link no-print">
                        [Link]
                      </a>
                    )}
                  </div>
                  <p className="latex-project-desc">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                      <em>Technologies:</em> {proj.technologies.join(', ')}
                    </p>
                  )}
                  <button onClick={() => setSpotlightProject(proj)} className="latex-link no-print" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontStyle: 'italic', marginTop: '6px' }}>
                    [Spotlight Details]
                  </button>
                </div>
              ))
            ) : (
              <p>No technical projects listed.</p>
            )}
          </div>
        </section>

        {/* Skills Section */}
        <section className="latex-section">
          <h2 className="latex-section-title">V. Technical Skills & Core Competencies</h2>
          <div className="latex-section-content">
            <div className="latex-skills-grid">
              {portfolio.skills && portfolio.skills.length > 0 ? (
                portfolio.skills.map((skill, idx) => (
                  <div key={idx} className="latex-skill-row">
                    <span className="latex-skill-name"><strong>{skill.name}</strong></span>
                    <span className="latex-skill-dots">....................................................................................................</span>
                    <span className="latex-skill-level">{skill.level}</span>
                  </div>
                ))
              ) : (
                <p>No skills specified.</p>
              )}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="latex-section no-print">
          <h2 className="latex-section-title">VI. Inquiry & Correspondence</h2>
          <div className="latex-section-content">
            <p style={{ marginBottom: '15px' }}>To send correspondence, please fill out the form below:</p>
            <form onSubmit={handleSubmit} className="latex-form">
              <div className="latex-form-row">
                <div className="latex-form-group">
                  <label>Full Name:</label>
                  <input type="text" name="name" value={contactForm.name} onChange={handleInputChange} required />
                </div>
                <div className="latex-form-group">
                  <label>Email Address:</label>
                  <input type="email" name="email" value={contactForm.email} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="latex-form-group">
                <label>Telephone Line:</label>
                <input type="tel" name="phone" value={contactForm.phone} onChange={handleInputChange} required />
              </div>
              <div className="latex-form-group">
                <label>Nature of Correspondence:</label>
                <textarea name="reason" value={contactForm.reason} onChange={handleInputChange} rows={4} required />
              </div>
              <button type="submit" className="latex-btn-submit">
                [Submit Message]
              </button>
            </form>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="latex-footer no-print">
        <p>Document compiled in LaTeX format. Printed version optimized for standard A4 paper size.</p>
      </footer>

      {/* Modals */}
      {spotlightProject && (
        <ProjectSpotlightModal project={spotlightProject} onClose={() => setSpotlightProject(null)} />
      )}

      {viewPdf && portfolio.pdf && (
        <PdfViewerModal
          pdfUrl={`${baseUrl}/api/portfolio/pdf/${portfolio._id}`}
          onClose={() => setViewPdf(false)}
        />
      )}
    </div>
  );
};
