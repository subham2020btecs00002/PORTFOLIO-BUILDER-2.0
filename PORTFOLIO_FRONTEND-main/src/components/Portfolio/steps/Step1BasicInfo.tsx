import React from 'react';
import { FaSpinner, FaDownload, FaCheck, FaTimes } from 'react-icons/fa';
import ComboBox from '../../common/ComboBox';
import { baseUrl } from '../../url';

interface Step1BasicInfoProps {
  formData: {
    _id?: string;
    fullName?: string;
    title: string;
    description: string;
    avatar?: any;
  };
  handlers: {
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  };
  errors: {
    title?: string;
    description?: string;
  };
  aiQuota: any;
  parsingResume: boolean;
  handleResumeUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  parsedSummary: any;
  setParsedSummary: (val: any) => void;
  avatarPreview: string | null;
  avatarSizeError: string | null;
  handleAvatarFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  enhanceBioWithAi: () => void;
  enhancing: boolean;
  headlineSuggestions: string[];
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  formData,
  handlers,
  errors,
  aiQuota,
  parsingResume,
  handleResumeUpload,
  parsedSummary,
  setParsedSummary,
  avatarPreview,
  avatarSizeError,
  handleAvatarFileSelect,
  enhanceBioWithAi,
  enhancing,
  headlineSuggestions,
}) => {
  return (
    <div className="wizard-step-section animated fade-in">
      <h2>Basic Portfolio Details</h2>
      <p className="step-subtitle">Introduce yourself with a professional title and summary.</p>

      {/* AI Resume Auto-Importer Banner */}
      <div 
        className="ai-importer-card" 
        style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(168, 85, 247, 0.05))',
          border: '1px dashed rgba(168, 85, 247, 0.4)',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <h4 style={{ margin: '0 0 4px 0', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          ✨ AI Resume Auto-Importer
        </h4>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#94a3b8' }}>
          Upload your existing resume PDF to instantly auto-fill all portfolio steps.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600, background: aiQuota?.isAdmin ? 'rgba(192, 132, 252, 0.15)' : (typeof aiQuota?.remaining === 'number' && aiQuota.remaining === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)'), color: aiQuota?.isAdmin ? '#c084fc' : (typeof aiQuota?.remaining === 'number' && aiQuota.remaining === 0 ? '#f87171' : '#a5b4fc'), border: `1px solid ${aiQuota?.isAdmin ? 'rgba(192, 132, 252, 0.3)' : (typeof aiQuota?.remaining === 'number' && aiQuota.remaining === 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)')}` }}>
            {aiQuota?.isAdmin ? (
              <span>⚡ Admin Account: Unlimited Imports</span>
            ) : (
              <span>
                Daily Quota: {aiQuota?.remaining ?? 4} / 4 remaining today
              </span>
            )}
          </div>
        </div>

        {aiQuota && !aiQuota.isAdmin && typeof aiQuota.remaining === 'number' && aiQuota.remaining <= 0 && (
          <div style={{ margin: '0 0 14px', color: '#f87171', fontSize: '0.82rem', fontWeight: 500 }}>
            ⚠️ Daily limit of 4 imports reached for today. Your quota refreshes at 00:00 UTC.
          </div>
        )}

        <label 
          htmlFor="resume-importer-file" 
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            cursor: (parsingResume || (aiQuota && !aiQuota.isAdmin && typeof aiQuota.remaining === 'number' && aiQuota.remaining <= 0)) ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            background: 'var(--accent-gradient)',
            border: 'none',
            color: '#fff',
            borderRadius: '6px',
            fontWeight: 600,
            pointerEvents: (parsingResume || (aiQuota && !aiQuota.isAdmin && typeof aiQuota.remaining === 'number' && aiQuota.remaining <= 0)) ? 'none' : 'auto',
            opacity: (parsingResume || (aiQuota && !aiQuota.isAdmin && typeof aiQuota.remaining === 'number' && aiQuota.remaining <= 0)) ? 0.6 : 1
          }}
        >
          {parsingResume ? (
            <>
              <FaSpinner className="spinner-icon" />
              <span>AI Parsing Resume...</span>
            </>
          ) : (
            <>
              <FaDownload />
              <span>Select Resume PDF</span>
            </>
          )}
        </label>
        {parsingResume && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#c084fc', fontSize: '0.82rem' }}>
            <FaSpinner className="spinner-icon" />
            <span>Extracting text & mapping skills, experience, and education...</span>
          </div>
        )}

        {parsedSummary && (
          <div className="animated fade-in" style={{ marginTop: '18px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '8px', padding: '14px 18px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ color: '#34d399', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCheck /> Resume Parsed Successfully!
              </strong>
              <button
                type="button"
                onClick={() => setParsedSummary(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}
                title="Dismiss notification"
              >
                <FaTimes />
              </button>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              Form fields auto-filled with <strong>{parsedSummary.skillsCount} skills</strong>, <strong>{parsedSummary.projectsCount} projects</strong>, <strong>{parsedSummary.historyCount} work history entries</strong>, and <strong>{parsedSummary.educationCount} education records</strong>. Review each step below and customize as desired!
            </p>
          </div>
        )}

        <input
          id="resume-importer-file"
          type="file"
          accept="application/pdf"
          onChange={handleResumeUpload}
          disabled={parsingResume || Boolean(aiQuota && !aiQuota.isAdmin && typeof aiQuota.remaining === 'number' && aiQuota.remaining <= 0)}
          style={{ display: 'none' }}
        />
      </div>

      {/* Avatar Upload */}
      <div className="form-group avatar-upload-group" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
        <div className="avatar-preview-circle" style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--primary-color)', flexShrink: 0 }}>
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (formData.avatar && (formData.avatar as any).contentType && formData._id) ? (
            <img src={`${baseUrl}/api/portfolio/avatar/${formData._id}`} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '0.75rem', color: '#475569', textAlign: 'center', fontWeight: 500 }}>No Image</span>
          )}
        </div>
        <div>
          <label htmlFor="avatar-file" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Profile Picture / Photo</label>
          <input
            id="avatar-file"
            type="file"
            accept="image/*"
            onChange={handleAvatarFileSelect}
            style={{ fontSize: '0.85rem' }}
          />
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '4px' }}>Recommended: Square JPG/PNG image (Max 2MB)</span>
          {avatarSizeError && <span className="field-error-msg" style={{ display: 'block', marginTop: '4px', color: '#ef4444' }}>{avatarSizeError}</span>}
        </div>
      </div>
      
      {/* Full Name Override */}
      <div className="form-group">
        <label htmlFor="fullName">Full Name (Display Name)</label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          value={formData.fullName || ''}
          onChange={handlers.handleChange}
          placeholder="e.g. First MiddleName LastName"
        />
        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
          Leave blank to use your registered account name, or specify your full professional name (First, Middle, Last).
        </span>
      </div>

      {/* Title */}
      <div className="form-group">
        <label htmlFor="title">Headline Title *</label>
        <ComboBox
          id="title"
          name="title"
          value={formData.title}
          onChange={handlers.handleChange}
          suggestions={headlineSuggestions}
          placeholder="e.g. Full Stack Developer"
          required
        />
        {errors.title && <span className="field-error-msg">{errors.title}</span>}
      </div>

      {/* Bio / Description */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label htmlFor="description" style={{ margin: 0 }}>Professional Summary *</label>
          {formData.description && formData.description.length > 5 && (
            <button
              type="button"
              onClick={enhanceBioWithAi}
              className="btn-ai-enhance"
              disabled={enhancing}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                border: 'none',
                color: '#fff',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
              }}
            >
              {enhancing ? <FaSpinner className="spin" size={10} /> : '✨ AI Polish'}
            </button>
          )}
        </div>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handlers.handleChange}
          placeholder="Write a concise paragraph detailing your domain expertise, passions, and achievements. Each sentence/point must start with capital letter and end with a period."
          rows={6}
          required
        />
        {errors.description && <span className="field-error-msg">{errors.description}</span>}
      </div>
    </div>
  );
};

export default Step1BasicInfo;
