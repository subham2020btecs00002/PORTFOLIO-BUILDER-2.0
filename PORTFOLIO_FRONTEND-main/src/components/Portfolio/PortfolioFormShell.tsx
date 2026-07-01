import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaArrowRight, FaPlus, FaTrash, FaCheck, FaSpinner } from 'react-icons/fa';
import api from '../api';
import { usePortfolioForm } from '../../hooks/usePortfolioForm';
import type { PortfolioFormData } from '../../types';
import './PortfolioForm.css';

interface PortfolioFormShellProps {
  mode: 'create' | 'edit';
  initialData?: PortfolioFormData;
}

const PortfolioFormShell: React.FC<PortfolioFormShellProps> = ({ mode, initialData }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    formData,
    errors,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    setStep,
    setFormValues,
    isFormValid,
    handlers,
  } = usePortfolioForm(initialData);

  useEffect(() => {
    if (initialData) {
      setFormValues(initialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error('Please fix errors in the form before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('templateId', formData.templateId);
      if (formData.pdf) {
        payload.append('pdf', formData.pdf);
      }

      formData.skills.forEach((skill, index) => {
        if (skill.name.trim()) {
          payload.append(`skills[${index}][name]`, skill.name);
          payload.append(`skills[${index}][level]`, skill.level);
          payload.append(`skills[${index}][category]`, skill.category || '');
        }
      });

      formData.projects.forEach((project, index) => {
        if (project.title.trim()) {
          payload.append(`projects[${index}][title]`, project.title);
          payload.append(`projects[${index}][description]`, project.description || '');
          payload.append(`projects[${index}][link]`, project.link ?? '');
        }
      });

      formData.education.forEach((edu, index) => {
        if (edu.collegeName.trim()) {
          payload.append(`education[${index}][collegeName]`, edu.collegeName);
          payload.append(`education[${index}][degree]`, edu.degree);
          payload.append(`education[${index}][branch]`, edu.branch);
          payload.append(`education[${index}][cgpaOrPercentage]`, String(edu.cgpaOrPercentage));
          payload.append(
            `education[${index}][yearOfJoining]`,
            edu.yearOfJoining ? new Date(edu.yearOfJoining).toISOString() : '',
          );
          payload.append(
            `education[${index}][yearOfPassing]`,
            edu.yearOfPassing ? new Date(edu.yearOfPassing).toISOString() : '',
          );
        }
      });

      formData.professionalHistory.forEach((history, index) => {
        if (history.companyName.trim()) {
          payload.append(`professionalHistory[${index}][companyName]`, history.companyName);
          payload.append(`professionalHistory[${index}][position]`, history.position || '');
          payload.append(`professionalHistory[${index}][responsibility]`, history.responsibility || '');
          payload.append(
            `professionalHistory[${index}][yearOfJoining]`,
            history.yearOfJoining ? new Date(history.yearOfJoining).toISOString() : '',
          );
          payload.append(
            `professionalHistory[${index}][yearOfLeaving]`,
            history.isCurrentEmployee
              ? '1970-01-01T00:00:00.000+00:00'
              : history.yearOfLeaving
              ? new Date(history.yearOfLeaving).toISOString()
              : '',
          );
          payload.append(
            `professionalHistory[${index}][isCurrentEmployee]`,
            String(history.isCurrentEmployee),
          );
        }
      });

      Object.keys(formData.portfolioLinks).forEach((key) => {
        const linkKey = key as keyof typeof formData.portfolioLinks;
        payload.append(`portfolioLinks[${linkKey}]`, formData.portfolioLinks[linkKey] || '');
      });

      if (mode === 'create') {
        await api.post('/api/portfolio', payload);
        toast.success('Portfolio created successfully!');
      } else {
        await api.put('/api/portfolio', payload);
        toast.success('Portfolio updated successfully!');
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || `Error ${mode === 'create' ? 'creating' : 'updating'} portfolio`);
    } finally {
      setSubmitting(false);
    }
  };

  // Render helpers
  const renderStepIndicator = () => {
    const steps = ['Details', 'Skills', 'Projects', 'Education', 'Experience', 'Links & PDF', 'Template'];
    return (
      <div className="step-indicator-container">
        {steps.map((stepName, index) => {
          const stepNum = index + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;
          return (
            <div key={stepNum} className={`step-dot-wrapper ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              <div className="step-dot" onClick={() => setStep(stepNum)}>
                {isCompleted ? <FaCheck size={12} /> : stepNum}
              </div>
              <span className="step-label">{stepName}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="portfolio-wizard-container">
      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="portfolio-wizard-form card-glass">
        {/* STEP 1: BASIC INFO */}
        {currentStep === 1 && (
          <div className="wizard-step-section animated fade-in">
            <h2>Basic Information</h2>
            <p className="step-subtitle">Introduce yourself in a few sentences. This will be the main highlight on your hero section.</p>
            
            <div className="form-group">
              <label htmlFor="title">Professional Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handlers.handleChange}
                placeholder="e.g. Senior Full Stack Developer"
                className={errors.title ? 'input-error' : ''}
                required
              />
              {errors.title && <span className="field-error-msg">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">About Me / Bio *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handlers.handleChange}
                placeholder="Write a brief professional bio. Each point must start with a capital letter and end with a period."
                className={errors.description ? 'input-error' : ''}
                rows={5}
                required
              />
              {errors.description && <span className="field-error-msg">{errors.description}</span>}
            </div>
          </div>
        )}

        {/* STEP 2: SKILLS */}
        {currentStep === 2 && (
          <div className="wizard-step-section animated fade-in">
            <h2>Skills & Technologies</h2>
            <p className="step-subtitle">Add technical skills, programming languages, libraries, and frameworks you know.</p>

            <div className="dynamic-items-list">
              {formData.skills.map((skill, index) => (
                <div key={index} className="wizard-item-card glass-card">
                  <div className="wizard-item-header">
                    <h4>Skill #{index + 1}</h4>
                    {formData.skills.length > 1 && (
                      <button type="button" onClick={() => handlers.removeSkill(index)} className="btn-icon btn-remove">
                        <FaTrash />
                      </button>
                    )}
                  </div>
                  <div className="wizard-card-grid">
                    <div className="form-group">
                      <label>Skill Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={skill.name}
                        onChange={(e) => handlers.handleSkillChange(e, index)}
                        placeholder="e.g. React"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Level</label>
                      <select
                        name="level"
                        value={skill.level}
                        onChange={(e) => handlers.handleSkillChange(e, index)}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                    <div className="form-group select-span-2">
                      <label>Category (Optional)</label>
                      <input
                        type="text"
                        name="category"
                        value={skill.category}
                        onChange={(e) => handlers.handleSkillChange(e, index)}
                        placeholder="e.g. Frontend, Database, Language"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={handlers.addSkill} className="btn-add-item">
              <FaPlus /> Add Another Skill
            </button>
          </div>
        )}

        {/* STEP 3: PROJECTS */}
        {currentStep === 3 && (
          <div className="wizard-step-section animated fade-in">
            <h2>Projects</h2>
            <p className="step-subtitle">Display your best personal or professional projects to show off your capabilities.</p>

            <div className="dynamic-items-list">
              {formData.projects.map((project, index) => (
                <div key={index} className="wizard-item-card glass-card">
                  <div className="wizard-item-header">
                    <h4>Project #{index + 1}</h4>
                    {formData.projects.length > 1 && (
                      <button type="button" onClick={() => handlers.removeProject(index)} className="btn-icon btn-remove">
                        <FaTrash />
                      </button>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Project Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={project.title}
                      onChange={(e) => handlers.handleProjectChange(e, index)}
                      placeholder="e.g. Portfolio Builder"
                      required
                    />
                    {errors.projects[index]?.title && <span className="field-error-msg">{errors.projects[index].title}</span>}
                  </div>
                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      name="description"
                      value={project.description}
                      onChange={(e) => handlers.handleProjectChange(e, index)}
                      placeholder="Explain what the project does and technologies used."
                      rows={3}
                      required
                    />
                    {errors.projects[index]?.description && <span className="field-error-msg">{errors.projects[index].description}</span>}
                  </div>
                  <div className="form-group">
                    <label>Project Live Link / GitHub Link (Optional)</label>
                    <input
                      type="text"
                      name="link"
                      value={project.link || ''}
                      onChange={(e) => handlers.handleProjectChange(e, index)}
                      placeholder="e.g. https://github.com/user/project"
                    />
                    {errors.projects[index]?.link && <span className="field-error-msg">{errors.projects[index].link}</span>}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={handlers.addProject} className="btn-add-item">
              <FaPlus /> Add Another Project
            </button>
          </div>
        )}

        {/* STEP 4: EDUCATION */}
        {currentStep === 4 && (
          <div className="wizard-step-section animated fade-in">
            <h2>Education Details</h2>
            <p className="step-subtitle">Your educational qualifications and credentials.</p>

            <div className="dynamic-items-list">
              {formData.education.map((edu, index) => (
                <div key={index} className="wizard-item-card glass-card">
                  <div className="wizard-item-header">
                    <h4>Education #{index + 1}</h4>
                    {formData.education.length > 1 && (
                      <button type="button" onClick={() => handlers.removeEducation(index)} className="btn-icon btn-remove">
                        <FaTrash />
                      </button>
                    )}
                  </div>
                  <div className="wizard-card-grid">
                    <div className="form-group select-span-2">
                      <label>College / School Name *</label>
                      <input
                        type="text"
                        name="collegeName"
                        value={edu.collegeName}
                        onChange={(e) => handlers.handleEducationChange(e, index)}
                        onBlur={(e) => handlers.handleEducationBlur(e, index)}
                        placeholder="e.g. Harvard University"
                        required
                      />
                      {errors.education[index]?.collegeName && <span className="field-error-msg">{errors.education[index].collegeName}</span>}
                    </div>
                    <div className="form-group">
                      <label>Degree *</label>
                      <select
                        name="degree"
                        value={edu.degree}
                        onChange={(e) => handlers.handleEducationChange(e, index)}
                        onBlur={(e) => handlers.handleEducationBlur(e, index)}
                        required
                      >
                        <option value="">Select Degree</option>
                        <option value="Btech">Btech</option>
                        <option value="Mtech">Mtech</option>
                        <option value="Diploma">Diploma</option>
                        <option value="B.Sc">B.Sc</option>
                        <option value="M.Sc">M.Sc</option>
                        <option value="BCA">BCA</option>
                        <option value="MCA">MCA</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.education[index]?.degree && <span className="field-error-msg">{errors.education[index].degree}</span>}
                    </div>
                    <div className="form-group">
                      <label>Branch / Major *</label>
                      <select
                        name="branch"
                        value={edu.branch}
                        onChange={(e) => handlers.handleEducationChange(e, index)}
                        onBlur={(e) => handlers.handleEducationBlur(e, index)}
                        required
                      >
                        <option value="">Select Branch</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Electronics Engineering">Electronics Engineering</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Science">Science</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Arts">Arts</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.education[index]?.branch && <span className="field-error-msg">{errors.education[index].branch}</span>}
                    </div>
                    <div className="form-group">
                      <label>CGPA / Percentage *</label>
                      <input
                        type="text"
                        name="cgpaOrPercentage"
                        value={edu.cgpaOrPercentage}
                        onChange={(e) => handlers.handleEducationChange(e, index)}
                        onBlur={(e) => handlers.handleEducationBlur(e, index)}
                        placeholder="e.g. 8.5 or 85%"
                        required
                      />
                      {errors.education[index]?.cgpaOrPercentage && <span className="field-error-msg">{errors.education[index].cgpaOrPercentage}</span>}
                    </div>
                    <div className="form-group">
                      <label>Year of Joining *</label>
                      <input
                        type="date"
                        name="yearOfJoining"
                        value={edu.yearOfJoining}
                        onChange={(e) => handlers.handleEducationChange(e, index)}
                        onBlur={(e) => handlers.handleEducationBlur(e, index)}
                        required
                      />
                      {errors.education[index]?.yearOfJoining && <span className="field-error-msg">{errors.education[index].yearOfJoining}</span>}
                    </div>
                    <div className="form-group">
                      <label>Year of Passing *</label>
                      <input
                        type="date"
                        name="yearOfPassing"
                        value={edu.yearOfPassing}
                        onChange={(e) => handlers.handleEducationChange(e, index)}
                        onBlur={(e) => handlers.handleEducationBlur(e, index)}
                        required
                      />
                      {errors.education[index]?.yearOfPassing && <span className="field-error-msg">{errors.education[index].yearOfPassing}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={handlers.addEducation} className="btn-add-item">
              <FaPlus /> Add Another Education
            </button>
          </div>
        )}

        {/* STEP 5: EXPERIENCE */}
        {currentStep === 5 && (
          <div className="wizard-step-section animated fade-in">
            <h2>Professional Experience</h2>
            <p className="step-subtitle">Your job history, internships, and work details.</p>

            <div className="dynamic-items-list">
              {formData.professionalHistory.map((history, index) => (
                <div key={index} className="wizard-item-card glass-card">
                  <div className="wizard-item-header">
                    <h4>Work Experience #{index + 1}</h4>
                    {formData.professionalHistory.length > 1 && (
                      <button type="button" onClick={() => handlers.removeProfessionalHistory(index)} className="btn-icon btn-remove">
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
                      {errors.professionalHistory[index]?.companyName && <span className="field-error-msg">{errors.professionalHistory[index].companyName}</span>}
                    </div>
                    <div className="form-group">
                      <label>Position / Role *</label>
                      <input
                        type="text"
                        name="position"
                        value={history.position}
                        onChange={(e) => handlers.handleProfessionalHistoryChange(e, index)}
                        placeholder="e.g. Software Engineer Intern"
                        required
                      />
                      {errors.professionalHistory[index]?.position && <span className="field-error-msg">{errors.professionalHistory[index].position}</span>}
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
                      {errors.professionalHistory[index]?.responsibility && <span className="field-error-msg">{errors.professionalHistory[index].responsibility}</span>}
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
                      {errors.professionalHistory[index]?.yearOfJoining && <span className="field-error-msg">{errors.professionalHistory[index].yearOfJoining}</span>}
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
                      {errors.professionalHistory[index]?.yearOfLeaving && <span className="field-error-msg">{errors.professionalHistory[index].yearOfLeaving}</span>}
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
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={handlers.addProfessionalHistory} className="btn-add-item">
              <FaPlus /> Add Another Job Experience
            </button>
          </div>
        )}

        {/* STEP 6: LINKS & PDF */}
        {currentStep === 6 && (
          <div className="wizard-step-section animated fade-in">
            <h2>Social Links & Resume File</h2>
            <p className="step-subtitle">Provide your public profile links and upload a PDF copy of your resume.</p>

            <div className="form-group">
              <label htmlFor="github">GitHub Profile URL (Optional)</label>
              <input
                type="text"
                id="github"
                name="github"
                value={formData.portfolioLinks.github}
                onChange={handlers.handlePortfolioLinksChange}
                placeholder="e.g. https://github.com/username"
              />
              {errors.portfolioLinks.github && <span className="field-error-msg">{errors.portfolioLinks.github}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="leetcode">LeetCode Profile URL (Optional)</label>
              <input
                type="text"
                id="leetcode"
                name="leetcode"
                value={formData.portfolioLinks.leetcode}
                onChange={handlers.handlePortfolioLinksChange}
                placeholder="e.g. https://leetcode.com/username"
              />
              {errors.portfolioLinks.leetcode && <span className="field-error-msg">{errors.portfolioLinks.leetcode}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gfg">GeeksforGeeks Profile URL (Optional)</label>
              <input
                type="text"
                id="gfg"
                name="gfg"
                value={formData.portfolioLinks.gfg}
                onChange={handlers.handlePortfolioLinksChange}
                placeholder="e.g. https://geeksforgeeks.org/user/username"
              />
              {errors.portfolioLinks.gfg && <span className="field-error-msg">{errors.portfolioLinks.gfg}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="linkedin">LinkedIn Profile URL (Optional)</label>
              <input
                type="text"
                id="linkedin"
                name="linkedin"
                value={formData.portfolioLinks.linkedin || ''}
                onChange={handlers.handlePortfolioLinksChange}
                placeholder="e.g. https://linkedin.com/in/username"
              />
              {errors.portfolioLinks.linkedin && <span className="field-error-msg">{errors.portfolioLinks.linkedin}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="pdf-upload">Upload Resume PDF (Optional)</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="pdf-upload"
                  name="pdf"
                  onChange={handlers.handleFileChange}
                  accept="application/pdf"
                />
                <span className="file-input-info">
                  {formData.pdf ? `Selected: ${formData.pdf.name}` : 'Choose a PDF file...'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: CHOOSE TEMPLATE */}
        {currentStep === 7 && (
          <div className="wizard-step-section animated fade-in">
            <h2>Select Portfolio Theme Template</h2>
            <p className="step-subtitle">Select the design that matches your aesthetic preference. You can change this at any time.</p>

            <div className="template-picker-grid">
              {/* Classic Green */}
              <div
                className={`template-select-card ${formData.templateId === 'classic-green' ? 'selected' : ''}`}
                onClick={() => handlers.handleTemplateChange('classic-green')}
              >
                <div className="template-preview-bar classic-green-bar"></div>
                <div className="template-info">
                  <h3>Classic Green (Default)</h3>
                  <p>Your original professional clean design with rich green accents, ideal for standard engineering resumes.</p>
                </div>
              </div>

              {/* Dark Pro */}
              <div
                className={`template-select-card ${formData.templateId === 'dark-pro' ? 'selected' : ''}`}
                onClick={() => handlers.handleTemplateChange('dark-pro')}
              >
                <div className="template-preview-bar dark-pro-bar"></div>
                <div className="template-info">
                  <h3>Dark Pro</h3>
                  <p>Sleek modern dark layout with neon glassmorphism cards and premium developer look.</p>
                </div>
              </div>

              {/* Creative */}
              <div
                className={`template-select-card ${formData.templateId === 'creative' ? 'selected' : ''}`}
                onClick={() => handlers.handleTemplateChange('creative')}
              >
                <div className="template-preview-bar creative-bar"></div>
                <div className="template-info">
                  <h3>Creative Gradient</h3>
                  <p>Vibrant colors, stylish typography, bold card styling, and animated elements.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTROLS */}
        <div className="wizard-controls">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="btn-secondary" disabled={submitting}>
              <FaArrowLeft /> Back
            </button>
          )}

          {currentStep < totalSteps ? (
            <button type="button" onClick={nextStep} className="btn-primary select-right">
              Next <FaArrowRight />
            </button>
          ) : (
            <button type="submit" className="btn-primary submit-btn select-right" disabled={submitting}>
              {submitting ? (
                <>
                  <FaSpinner className="spinner-icon" /> Saving...
                </>
              ) : (
                <>
                  <FaCheck /> {mode === 'create' ? 'Create Portfolio' : 'Save Changes'}
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PortfolioFormShell;
