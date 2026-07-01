import React from 'react';
import { FaGithub, FaCode, FaAward, FaLinkedin, FaDownload, FaEnvelope } from 'react-icons/fa';
import type { Portfolio, ContactFormData } from '../../../types';
import { baseUrl } from '../../url';

interface TemplateProps {
  portfolio: Portfolio;
  contactForm: ContactFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleScrollTo: (sectionId: string) => void;
}

export const Creative: React.FC<TemplateProps> = ({
  portfolio,
  contactForm,
  handleInputChange,
  handleSubmit,
  handleScrollTo,
}) => {
  const currentJob = portfolio.professionalHistory?.find((job) => job.isCurrentEmployee);

  return (
    <div className="theme-container creative-theme">
      {/* Background overlay */}
      <div className="creative-gradient-bg"></div>

      <div className="theme-content-wrapper">
        
        {/* Navigation */}
        <nav className="theme-nav">
          <ul className="theme-nav-links">
            <li onClick={() => handleScrollTo('about')}>About</li>
            <li onClick={() => handleScrollTo('skills')}>Skills</li>
            <li onClick={() => handleScrollTo('experience')}>Experience</li>
            <li onClick={() => handleScrollTo('projects')}>Projects</li>
            <li onClick={() => handleScrollTo('contact')}>Contact</li>
          </ul>
        </nav>

        {/* Hero */}
        <header className="theme-hero">
          <h1>{portfolio.user.name}</h1>
          <p className="theme-hero-subtitle">
            {currentJob ? `${currentJob.position} @ ${currentJob.companyName}` : portfolio.title}
          </p>
          <div className="social-links-row">
            {portfolio.portfolioLinks?.github && (
              <a href={portfolio.portfolioLinks.github} target="_blank" rel="noopener noreferrer" className="social-link-icon-btn">
                <FaGithub />
              </a>
            )}
            {portfolio.portfolioLinks?.leetcode && (
              <a href={portfolio.portfolioLinks.leetcode} target="_blank" rel="noopener noreferrer" className="social-link-icon-btn">
                <FaCode />
              </a>
            )}
            {portfolio.portfolioLinks?.gfg && (
              <a href={portfolio.portfolioLinks.gfg} target="_blank" rel="noopener noreferrer" className="social-link-icon-btn">
                <FaAward />
              </a>
            )}
            {portfolio.portfolioLinks?.linkedin && (
              <a href={portfolio.portfolioLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link-icon-btn">
                <FaLinkedin />
              </a>
            )}
          </div>
        </header>

        {/* About & Education */}
        <section id="about" className="theme-section">
          <h2>About Me</h2>
          <div className="grid-2col">
            <div className="theme-card">
              <p className="theme-bio">{portfolio.description || 'No bio description provided.'}</p>
            </div>
            
            <div className="theme-education-col">
              <h3>Education</h3>
              <div style={{ marginTop: '16px' }}>
                {portfolio.education?.map((edu, idx) => (
                  <div key={idx} className="theme-card">
                    <h4 className="theme-card-subtitle">{edu.collegeName}</h4>
                    <p className="theme-card-meta">{edu.degree} in {edu.branch}</p>
                    <p className="theme-card-meta" style={{ fontWeight: 600 }}>CGPA/Percentage: {edu.cgpaOrPercentage}</p>
                    <p className="theme-card-meta" style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                      {new Date(edu.yearOfJoining).getFullYear()} - {new Date(edu.yearOfPassing).getFullYear()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="theme-section">
          <h2>Skills</h2>
          <div className="theme-card">
            <div className="skills-badge-list">
              {portfolio.skills?.map((skill, idx) => (
                <div key={idx} className="skill-badge">
                  <span>{skill.name}</span>
                  <span className="skill-level-indicator">({skill.level})</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Professional History (Timeline) */}
        <section id="experience" className="theme-section">
          <h2>Work Experience</h2>
          <div className="timeline-wrapper">
            {portfolio.professionalHistory?.map((job, idx) => (
              <div key={idx} className="timeline-node">
                <div className="theme-card">
                  <div className="theme-card-header">
                    <div>
                      <h3 className="theme-card-title">{job.companyName}</h3>
                      <h4 className="theme-card-subtitle" style={{ margin: '4px 0 0', opacity: 0.8 }}>{job.position}</h4>
                    </div>
                    <span className="theme-card-meta" style={{ whiteSpace: 'nowrap' }}>
                      {new Date(job.yearOfJoining).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} -{' '}
                      {job.isCurrentEmployee
                        ? 'Present'
                        : job.yearOfLeaving
                        ? new Date(job.yearOfLeaving).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                        : ''}
                    </span>
                  </div>
                  <div>
                    {job.responsibility.split('\n').map((line, lidx) => (
                      <p key={lidx} className="theme-list-item">{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="theme-section">
          <h2>Projects</h2>
          <div className="grid-2col">
            {portfolio.projects?.map((proj, idx) => (
              <div key={idx} className="theme-card">
                <h3 className="theme-card-title">{proj.title}</h3>
                <p style={{ margin: '12px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>{proj.description}</p>
                {proj.link && (
                  <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontWeight: 600 }}>
                    View Project Github/Live →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Download CV */}
        {portfolio.pdf && (
          <section className="theme-section" style={{ textAlign: 'center' }}>
            <a href={`${baseUrl}/api/portfolio/download/${portfolio._id}`} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: 'linear-gradient(90deg, #f43f5e, #3b82f6)' }}>
              <FaDownload /> Download Resume CV
            </a>
          </section>
        )}

        {/* Contact Form */}
        <section id="contact" className="theme-section">
          <h2>Get In Touch</h2>
          <div className="theme-contact-form-card">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={contactForm.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" value={contactForm.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={contactForm.phone} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Reason of Contact</label>
                <textarea name="reason" value={contactForm.reason} onChange={handleInputChange} rows={4} required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                <FaEnvelope /> Send Message
              </button>
            </form>
          </div>
        </section>
        
      </div>
    </div>
  );
};
