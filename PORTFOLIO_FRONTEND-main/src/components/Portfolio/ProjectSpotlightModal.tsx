import React from 'react';
import { FaTimes, FaGithub, FaExternalLinkAlt, FaCode } from 'react-icons/fa';
import type { Project } from '../../types';

interface ProjectSpotlightModalProps {
  project: Project;
  onClose: () => void;
}

export const ProjectSpotlightModal: React.FC<ProjectSpotlightModalProps> = ({ project, onClose }) => {
  return (
    <div className="crop-modal-overlay animated fade-in" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }} onClick={onClose}>
      <div 
        className="project-spotlight-card card-glass" 
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()} // Prevent close on card click
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaCode style={{ color: 'var(--primary-color, #10b981)', fontSize: '1.25rem' }} />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Project Spotlight
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              transition: 'color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#f1f5f9')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <FaTimes />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 30px', maxHeight: '70vh', overflowY: 'auto' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 16px 0', color: '#ffffff', letterSpacing: '-0.025em' }}>
            {project.title}
          </h2>

          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            borderRadius: '12px',
            padding: '18px',
            marginBottom: '20px',
            color: '#cbd5e1',
            fontSize: '0.975rem',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap'
          }}>
            {project.description}
          </div>

          {/* Visual tech tags */}
          {project.technologies && project.technologies.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '10px', fontWeight: 600 }}>
                Technologies Used
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {project.technologies.map((tag) => (
                  <span key={tag} style={{
                    fontSize: '0.75rem',
                    padding: '5px 12px',
                    borderRadius: '30px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'var(--primary-color, #10b981)',
                    fontWeight: 600
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(15, 23, 42, 0.2)'
        }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            Close Detail
          </button>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{
                padding: '8px 18px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none'
              }}
            >
              {project.link.includes('github.com') ? <FaGithub /> : <FaExternalLinkAlt />}
              Visit Repository
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
