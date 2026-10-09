import React from 'react';
import { FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import ComboBox from '../../common/ComboBox';
import { POSITION_SUGGESTIONS } from '../../../data/formSuggestions';

interface Step5ExperienceProps {
  professionalHistory: Array<{
    companyName: string;
    position: string;
    responsibility: string;
    yearOfJoining: string;
    yearOfLeaving?: string;
    isCurrentEmployee?: boolean;
    technologies?: string[];
  }>;
  handlers: {
    handleProfessionalHistoryChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      index: number,
    ) => void;
    handleProfessionalHistoryCustomChange: (
      field: string,
      value: any,
      index: number,
    ) => void;
    addProfessionalHistory: () => void;
    removeProfessionalHistory: (index: number) => void;
  };
  errors: {
    professionalHistory: Array<{
      companyName?: string;
      position?: string;
      responsibility?: string;
      yearOfJoining?: string;
      yearOfLeaving?: string;
    }>;
  };
}

export const Step5Experience: React.FC<Step5ExperienceProps> = ({
  professionalHistory,
  handlers,
  errors,
}) => {
  return (
    <div className="wizard-step-section animated fade-in">
      <h2>Professional Experience</h2>
      <p className="step-subtitle">Your job history, internships, and work details.</p>

      <div className="dynamic-items-list">
        {professionalHistory.map((history, index) => (
          <div key={index} className="wizard-item-card glass-card">
            <div className="wizard-item-header">
              <h4>Work Experience #{index + 1}</h4>
              {professionalHistory.length > 1 && (
                <button
                  type="button"
                  onClick={() => handlers.removeProfessionalHistory(index)}
                  className="btn-icon btn-remove"
                >
                  <FaTrash />
                </button>
              )}
            </div>
            <div className="wizard-card-grid">
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={history.companyName}
                  onChange={(e) => handlers.handleProfessionalHistoryChange(e, index)}
                  placeholder="e.g. Google"
                  required
                />
                {errors.professionalHistory[index]?.companyName && (
                  <span className="field-error-msg">{errors.professionalHistory[index].companyName}</span>
                )}
              </div>
              <div className="form-group">
                <label>Position / Role *</label>
                <ComboBox
                  name="position"
                  value={history.position}
                  onChange={(e) => handlers.handleProfessionalHistoryChange(e, index)}
                  suggestions={POSITION_SUGGESTIONS}
                  placeholder="e.g. Software Engineer, SDE-1…"
                  required
                />
                {errors.professionalHistory[index]?.position && (
                  <span className="field-error-msg">{errors.professionalHistory[index].position}</span>
                )}
              </div>
              <div className="form-group select-span-2">
                <label>Responsibility *</label>
                <textarea
                  name="responsibility"
                  value={history.responsibility}
                  onChange={(e) => handlers.handleProfessionalHistoryChange(e, index)}
                  placeholder="Detail your roles/responsibilities. Each sentence/point must start with capital letter and end with a period."
                  rows={3}
                  required
                />
                {errors.professionalHistory[index]?.responsibility && (
                  <span className="field-error-msg">{errors.professionalHistory[index].responsibility}</span>
                )}
              </div>
              <div className="form-group">
                <label>Year of Joining *</label>
                <input
                  type="date"
                  name="yearOfJoining"
                  value={history.yearOfJoining}
                  onChange={(e) => handlers.handleProfessionalHistoryChange(e, index)}
                  required
                />
                {errors.professionalHistory[index]?.yearOfJoining && (
                  <span className="field-error-msg">{errors.professionalHistory[index].yearOfJoining}</span>
                )}
              </div>
              <div className="form-group">
                <label>Year of Leaving</label>
                <input
                  type="date"
                  name="yearOfLeaving"
                  value={history.isCurrentEmployee ? '' : (history.yearOfLeaving ?? '')}
                  onChange={(e) => handlers.handleProfessionalHistoryChange(e, index)}
                  disabled={history.isCurrentEmployee}
                  required={!history.isCurrentEmployee}
                />
                {errors.professionalHistory[index]?.yearOfLeaving && (
                  <span className="field-error-msg">{errors.professionalHistory[index].yearOfLeaving}</span>
                )}
              </div>
              <div className="form-group checkbox-group select-span-2">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isCurrentEmployee"
                    checked={history.isCurrentEmployee}
                    onChange={(e) => handlers.handleProfessionalHistoryChange(e, index)}
                  />
                  Presently working here?
                </label>
              </div>
              <div className="form-group select-span-2">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Technologies / Stack Used</label>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  borderRadius: '8px',
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.03)'
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(history.technologies || []).map((tech, tIdx) => (
                      <span key={tIdx} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--primary-color, #10b981)',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}>
                        {tech}
                        <button 
                          type="button" 
                          onClick={() => {
                            const updatedTech = (history.technologies || []).filter((_, idx) => idx !== tIdx);
                            handlers.handleProfessionalHistoryCustomChange('technologies', updatedTech, index);
                          }} 
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <FaTimes />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Type technology name (e.g. Node.js) and press Enter..."
                    style={{ border: 'none', background: 'none', outline: 'none', padding: '4px', width: '100%', fontSize: '0.85rem', color: 'inherit' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val) {
                          const currentTech = history.technologies || [];
                          if (!currentTech.includes(val)) {
                            handlers.handleProfessionalHistoryCustomChange('technologies', [...currentTech, val], index);
                          }
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                  Press Enter after typing each technology.
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={handlers.addProfessionalHistory} className="btn-add-item">
        <FaPlus /> Add Another Job Experience
      </button>
    </div>
  );
};

export default Step5Experience;
