import React from 'react';
import { FaTrash, FaPlus, FaTimes } from 'react-icons/fa';

interface Step3ProjectsProps {
  projects: Array<{
    title: string;
    description: string;
    link?: string;
    technologies?: string[];
  }>;
  handlers: {
    handleProjectChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      index: number,
    ) => void;
    handleProjectCustomChange: (
      field: string,
      value: any,
      index: number,
    ) => void;
    addProject: () => void;
    removeProject: (index: number) => void;
  };
  errors: {
    projects: Array<{ title?: string; description?: string; link?: string }>;
  };
}

export const Step3Projects: React.FC<Step3ProjectsProps> = ({
  projects,
  handlers,
  errors,
}) => {
  return (
    <div className="wizard-step-section animated fade-in">
      <h2>Personal Projects</h2>
      <p className="step-subtitle">
        Feature your best code projects and case studies.
      </p>

      <div className="dynamic-items-list">
        {projects.map((proj, index) => (
          <div key={index} className="wizard-item-card glass-card">
            <div className="wizard-item-header">
              <h4>Project #{index + 1}</h4>
              {projects.length > 1 && (
                <button
                  type="button"
                  onClick={() => handlers.removeProject(index)}
                  className="btn-icon btn-remove"
                >
                  <FaTrash />
                </button>
              )}
            </div>
            <div className="wizard-card-grid">
              <div className="form-group select-span-2">
                <label>Project Title *</label>
                <input
                  type="text"
                  name="title"
                  value={proj.title}
                  onChange={(e) => handlers.handleProjectChange(e, index)}
                  placeholder="e.g. Portfolio Builder Website"
                  required
                />
                {errors.projects[index]?.title && (
                  <span className="field-error-msg">
                    {errors.projects[index].title}
                  </span>
                )}
              </div>
              <div className="form-group select-span-2">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={proj.description}
                  onChange={(e) => handlers.handleProjectChange(e, index)}
                  placeholder="Detail your roles, tech stack, and achievements. Each sentence/point must start with capital letter and end with a period."
                  rows={3}
                  required
                />
                {errors.projects[index]?.description && (
                  <span className="field-error-msg">
                    {errors.projects[index].description}
                  </span>
                )}
              </div>
              <div className="form-group select-span-2">
                <label>GitHub / Live Deployment URL</label>
                <input
                  type="text"
                  name="link"
                  value={proj.link}
                  onChange={(e) => handlers.handleProjectChange(e, index)}
                  placeholder="e.g. https://github.com/..."
                />
                {errors.projects[index]?.link && (
                  <span className="field-error-msg">
                    {errors.projects[index].link}
                  </span>
                )}
              </div>
              <div className="form-group select-span-2">
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 600,
                  }}
                >
                  Technologies Used
                </label>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    borderRadius: '8px',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(proj.technologies || []).map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'var(--primary-color, #10b981)',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                        }}
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => {
                            const updatedTech = (
                              proj.technologies || []
                            ).filter((_, idx) => idx !== tIdx);
                            handlers.handleProjectCustomChange(
                              'technologies',
                              updatedTech,
                              index,
                            );
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <FaTimes />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Type technology name (e.g. React) and press Enter..."
                    style={{
                      border: 'none',
                      background: 'none',
                      outline: 'none',
                      padding: '4px',
                      width: '100%',
                      fontSize: '0.85rem',
                      color: 'inherit',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val) {
                          const currentTech = proj.technologies || [];
                          if (!currentTech.includes(val)) {
                            handlers.handleProjectCustomChange(
                              'technologies',
                              [...currentTech, val],
                              index,
                            );
                          }
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    display: 'block',
                    marginTop: '4px',
                  }}
                >
                  Press Enter after typing each technology.
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handlers.addProject}
        className="btn-add-item"
      >
        <FaPlus /> Add Project
      </button>
    </div>
  );
};
