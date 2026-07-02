import React from 'react';
import type { Portfolio } from '../../../types';
import { getSortedHistory } from '../../../utils/portfolioUtils';

interface ResumePrintProps {
  portfolio: Portfolio;
}

export const ResumePrint: React.FC<ResumePrintProps> = ({ portfolio }) => {
  const currentJob = portfolio.professionalHistory?.find((job) => job.isCurrentEmployee);
  
  // Group skills by category
  const skillsByCategory: Record<string, string[]> = {};
  portfolio.skills?.forEach((skill) => {
    const category = skill.category.trim() || 'General';
    if (!skillsByCategory[category]) {
      skillsByCategory[category] = [];
    }
    skillsByCategory[category].push(`${skill.name} (${skill.level})`);
  });

  return (
    <div className="resume-print-wrapper" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', background: '#fff', color: '#000', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header */}
      <header className="resume-header" style={{ borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '26px', fontWeight: 'bold' }}>{portfolio.user.name.toUpperCase()}</h1>
        <div className="resume-contact-info" style={{ fontSize: '12px', color: '#333' }}>
          {currentJob ? `${currentJob.position} | ` : portfolio.title ? `${portfolio.title} | ` : ''}
          {portfolio.user.email}
          {portfolio.portfolioLinks?.linkedin && ` | LinkedIn: ${portfolio.portfolioLinks.linkedin}`}
          {portfolio.portfolioLinks?.github && ` | GitHub: ${portfolio.portfolioLinks.github}`}
        </div>
      </header>

      {/* Summary */}
      {portfolio.description && (
        <section className="resume-section" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '3px', margin: '0 0 8px 0' }}>Professional Summary</h2>
          <p style={{ margin: '0', fontSize: '12px', lineHeight: '1.4' }}>{portfolio.description}</p>
        </section>
      )}

      {/* Work Experience */}
      {portfolio.professionalHistory && portfolio.professionalHistory.length > 0 && (
        <section className="resume-section" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '3px', margin: '0 0 10px 0' }}>Experience</h2>
          {getSortedHistory(portfolio.professionalHistory).map((job, idx) => (
            <div key={idx} className="resume-item" style={{ marginBottom: '12px' }}>
              <div className="resume-item-header" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                <span>{job.companyName}</span>
                <span>
                  {job.yearOfJoining ? new Date(job.yearOfJoining).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''} -{' '}
                  {job.isCurrentEmployee
                    ? 'Present'
                    : job.yearOfLeaving
                    ? new Date(job.yearOfLeaving).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                    : ''}
                </span>
              </div>
              <div className="resume-item-subtitle" style={{ display: 'flex', justifyContent: 'space-between', fontStyle: 'italic', fontSize: '12px', color: '#444' }}>
                <span>{job.position}</span>
              </div>
              <div className="resume-item-description" style={{ fontSize: '12px', marginTop: '4px', paddingLeft: '15px' }}>
                {job.responsibility.split('\n').map((line, lidx) => (
                  <div key={lidx} style={{ position: 'relative', paddingLeft: '12px', margin: '3px 0' }}>
                    <span style={{ position: 'absolute', left: '0' }}>•</span>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {portfolio.projects && portfolio.projects.length > 0 && (
        <section className="resume-section" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '3px', margin: '0 0 10px 0' }}>Key Projects</h2>
          {portfolio.projects.map((proj, idx) => (
            <div key={idx} className="resume-item" style={{ marginBottom: '10px' }}>
              <div className="resume-item-header" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                <span>{proj.title}</span>
                {proj.link && <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#555' }}>{proj.link}</span>}
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', lineHeight: '1.4' }}>{proj.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {portfolio.skills && portfolio.skills.length > 0 && (
        <section className="resume-section" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '3px', margin: '0 0 10px 0' }}>Skills</h2>
          <div className="resume-skills-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
            {Object.keys(skillsByCategory).map((cat) => (
              <div key={cat} className="resume-skill-cat">
                <strong>{cat}: </strong>
                {skillsByCategory[cat].join(', ')}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {portfolio.education && portfolio.education.length > 0 && (
        <section className="resume-section" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '3px', margin: '0 0 10px 0' }}>Education</h2>
          {portfolio.education.map((edu, idx) => (
            <div key={idx} className="resume-item" style={{ marginBottom: '8px' }}>
              <div className="resume-item-header" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                <span>{edu.collegeName}</span>
                <span>
                  {edu.yearOfJoining ? new Date(edu.yearOfJoining).getFullYear() : ''} - {edu.yearOfPassing ? new Date(edu.yearOfPassing).getFullYear() : ''}
                </span>
              </div>
              <div className="resume-item-subtitle" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>{edu.degree} in {edu.branch}</span>
                <span>Score: {edu.cgpaOrPercentage}</span>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
