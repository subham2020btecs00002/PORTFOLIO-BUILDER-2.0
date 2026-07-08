import React, { useState } from 'react';
import type { Portfolio, ContactFormData, Project } from '../../../types';
import { baseUrl } from '../../url';
import { getSortedHistory } from '../../../utils/portfolioUtils';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { useTimelineDraw } from '../../../hooks/useTimelineDraw';
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

export const GamifiedRPG: React.FC<TemplateProps> = ({
  portfolio,
  contactForm,
  handleInputChange,
  handleSubmit,
  isPreview = false,
  theme,
  toggleTheme,
}) => {
  useScrollReveal();
  
  // Custom timeline draw hook for retro SVG scroll connector path
  const svgPathRef = useTimelineDraw<SVGPathElement>();

  const [spotlightProject, setSpotlightProject] = useState<Project | null>(null);
  const [viewPdf, setViewPdf] = useState<boolean>(false);

  const fontClass = portfolio.fontFamily && portfolio.fontFamily !== 'default' ? `font-family-${portfolio.fontFamily}` : '';
  const colorClass = portfolio.themeColor && portfolio.themeColor !== 'default' ? `color-override-${portfolio.themeColor}` : '';

  // Calculate experience level (Level = 1 + years of experience)
  const sortedJobs = getSortedHistory(portfolio.professionalHistory);
  let totalYears = 1; // start at Level 1
  if (sortedJobs.length > 0) {
    const earliest = sortedJobs[sortedJobs.length - 1].yearOfJoining;
    if (earliest) {
      const startYear = new Date(earliest).getFullYear();
      const currentYear = new Date().getFullYear();
      totalYears = Math.max(1, currentYear - startYear + 1);
    }
  }

  return (
    <div className={`theme-container rpg-theme ${fontClass} ${colorClass}`}>
      {isPreview && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '80px',
          background: '#fde047',
          color: '#000000',
          padding: '6px 14px',
          border: '3px solid #000000',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          boxShadow: '4px 4px 0px #000000',
          zIndex: 1000,
          fontFamily: 'monospace'
        }}>
          PREVIEW MODE
        </div>
      )}

      <div className="rpg-wrapper">
        
        {/* Main Hero Header Board */}
        <header className="rpg-header reveal-on-scroll">
          <div className="rpg-header-left">
            <h1 className="rpg-char-name">{portfolio.user?.name}</h1>
            <div className="rpg-char-title">Class: {portfolio.title || 'Developer'}</div>
          </div>
          <div className="rpg-char-level-badge">
            <div className="badge-lv">LVL</div>
            <div className="badge-val">{totalYears}</div>
          </div>
        </header>

        {/* 2-Column Sheet Layout */}
        <div className="rpg-sheet-grid">
          
          {/* Left Column: Character Stats & Bio */}
          <div className="rpg-column-left">
            
            {/* Attributes Board */}
            <div className="rpg-panel reveal-on-scroll">
              <h2 className="rpg-panel-title">Character Stats</h2>
              <div className="rpg-bio-section">
                <p className="rpg-panel-desc">{portfolio.description || 'No description bio provided.'}</p>
              </div>
              <div className="rpg-stats-list">
                {portfolio.skills && portfolio.skills.length > 0 ? (
                  portfolio.skills.slice(0, 6).map((skill, idx) => {
                    let statAbbr = 'STR';
                    let progressClass = 'bar-red';
                    if (idx === 1) { statAbbr = 'AGI'; progressClass = 'bar-green'; }
                    else if (idx === 2) { statAbbr = 'INT'; progressClass = 'bar-blue'; }
                    else if (idx === 3) { statAbbr = 'VIT'; progressClass = 'bar-yellow'; }
                    else if (idx === 4) { statAbbr = 'DEX'; progressClass = 'bar-purple'; }
                    else if (idx === 5) { statAbbr = 'LUK'; progressClass = 'bar-teal'; }

                    const barPercent = skill.level === 'Expert' ? '95%' : skill.level === 'Intermediate' ? '70%' : '35%';

                    return (
                      <div key={idx} className="rpg-stat-row">
                        <span className="rpg-stat-abbr">{statAbbr}</span>
                        <div className="rpg-stat-details">
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span className="rpg-stat-name">{skill.name}</span>
                            <span>{skill.level}</span>
                          </div>
                          <div className="rpg-progress-track">
                            <div className={`rpg-progress-fill ${progressClass}`} style={{ width: barPercent }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>No attributes specified.</p>
                )}
              </div>
            </div>

            {/* Inventory / Social Links */}
            <div className="rpg-panel reveal-on-scroll delay-1">
              <h2 className="rpg-panel-title">Inventory (Links)</h2>
              <div className="rpg-inventory-grid">
                {portfolio.portfolioLinks?.github && (
                  <a href={portfolio.portfolioLinks.github} target="_blank" rel="noreferrer" className="rpg-item-slot">
                    <span className="slot-icon">🐱</span>
                    <span className="slot-name">GitHub</span>
                  </a>
                )}
                {portfolio.portfolioLinks?.linkedin && (
                  <a href={portfolio.portfolioLinks.linkedin} target="_blank" rel="noreferrer" className="rpg-item-slot">
                    <span className="slot-icon">🔗</span>
                    <span className="slot-name">LinkedIn</span>
                  </a>
                )}
                {portfolio.user?.email && (
                  <a href={`mailto:${portfolio.user.email}`} className="rpg-item-slot">
                    <span className="slot-icon">✉️</span>
                    <span className="slot-name">Email</span>
                  </a>
                )}
                {portfolio.pdf && (
                  <div onClick={() => setViewPdf(true)} className="rpg-item-slot" style={{ cursor: 'pointer' }}>
                    <span className="slot-icon">📜</span>
                    <span className="slot-name">Scroll PDF</span>
                  </div>
                )}
              </div>
              
              {toggleTheme && (
                <button onClick={toggleTheme} className="rpg-btn" style={{ width: '100%', marginTop: '20px' }}>
                  [Toggle Theme ({theme || 'default'})]
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Quest Log (Experience) & Quests Completed (Projects) */}
          <div className="rpg-column-right">
            
            {/* Quest Log Panel */}
            <div className="rpg-panel reveal-on-scroll delay-2" style={{ position: 'relative' }}>
              <h2 className="rpg-panel-title">Quest Log (Experience)</h2>
              
              {/* Dynamic SVG Timeline draw overlay */}
              <div className="rpg-svg-overlay">
                <svg width="20" height="100%" style={{ position: 'absolute', left: '16px', top: '40px', bottom: '20px', pointerEvents: 'none' }}>
                  <path
                    ref={svgPathRef}
                    d="M 10,0 L 10,1200"
                    stroke="#fde047"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                  />
                </svg>
              </div>

              <div className="rpg-timeline" style={{ paddingLeft: '30px' }}>
                {sortedJobs.length > 0 ? (
                  sortedJobs.map((job, idx) => (
                    <div key={idx} className="rpg-quest-node" style={{ marginBottom: '24px', position: 'relative' }}>
                      <div className="rpg-quest-bullet"></div>
                      <div className="rpg-quest-header">
                        <strong className="rpg-quest-company">{job.companyName}</strong>
                        <span className="rpg-quest-dates">
                          {job.yearOfJoining ? new Date(job.yearOfJoining).getFullYear() : 'N/A'} -{' '}
                          {job.isCurrentEmployee ? 'Present' : job.yearOfLeaving ? new Date(job.yearOfLeaving).getFullYear() : 'N/A'}
                        </span>
                      </div>
                      <div className="rpg-quest-title">Active Quest: {job.position}</div>
                      <ul className="rpg-quest-objectives">
                        {job.responsibility.split('\n').map((line, lidx) => (
                          <li key={lidx}>[x] {line}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p>Quest log is currently empty.</p>
                )}
              </div>
            </div>

            {/* Completed Quests (Projects) Panel */}
            <div className="rpg-panel reveal-on-scroll delay-3">
              <h2 className="rpg-panel-title">Completed Quests (Projects)</h2>
              <div className="rpg-projects-list">
                {portfolio.projects && portfolio.projects.length > 0 ? (
                  portfolio.projects.map((proj, idx) => (
                    <div key={idx} className="rpg-project-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="rpg-project-title">★ {proj.title}</h3>
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noreferrer" className="rpg-project-link">
                            [Launch]
                          </a>
                        )}
                      </div>
                      <p className="rpg-project-desc">{proj.description}</p>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="rpg-project-loot">
                          <span style={{ fontSize: '0.75rem', color: '#fde047', marginRight: '6px' }}>Loot Drop:</span>
                          {proj.technologies.map((tech) => (
                            <span key={tech} className="rpg-loot-item">{tech}</span>
                          ))}
                        </div>
                      )}
                      <button onClick={() => setSpotlightProject(proj)} className="rpg-btn" style={{ fontSize: '0.75rem', marginTop: '10px', padding: '4px 8px' }}>
                        Inspect Item
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No quests completed yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Contact Form Panel */}
        <div className="rpg-panel rpg-contact-panel reveal-on-scroll">
          <h2 className="rpg-panel-title">Send Message (Guild Invite)</h2>
          <form onSubmit={handleSubmit} className="rpg-contact-form">
            <div className="rpg-form-row">
              <div className="rpg-form-group">
                <label>Guild Member Name</label>
                <input type="text" name="name" value={contactForm.name} onChange={handleInputChange} required />
              </div>
              <div className="rpg-form-group">
                <label>Return Scroll Address (Email)</label>
                <input type="email" name="email" value={contactForm.email} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="rpg-form-group">
              <label>Phone Ring Frequency</label>
              <input type="tel" name="phone" value={contactForm.phone} onChange={handleInputChange} required />
            </div>
            <div className="rpg-form-group">
              <label>Message Content</label>
              <textarea name="reason" value={contactForm.reason} onChange={handleInputChange} rows={4} required />
            </div>
            <button type="submit" className="rpg-btn rpg-btn-primary" style={{ width: '100%' }}>
              DISPATCH MESSENGER
            </button>
          </form>
        </div>

        {/* Footer */}
        <footer className="rpg-footer">
          <p>© {new Date().getFullYear()} {portfolio.user?.name}. Powered by RPGBuilder.</p>
        </footer>

      </div>

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
