import React from 'react';
import { FaTrash, FaPlus } from 'react-icons/fa';
import ComboBox from '../../common/ComboBox';
import {
  DEGREE_SUGGESTIONS,
  BRANCH_SUGGESTIONS,
} from '../../../data/formSuggestions';

interface Step4EducationProps {
  education: Array<{
    collegeName: string;
    degree: string;
    branch: string;
    cgpaOrPercentage: string | number;
    yearOfJoining: string;
    yearOfPassing: string;
  }>;
  handlers: {
    handleEducationChange: (
      e: React.ChangeEvent<HTMLInputElement>,
      index: number,
    ) => void;
    handleEducationBlur: (
      e: React.FocusEvent<HTMLInputElement>,
      index: number,
    ) => void;
    addEducation: () => void;
    removeEducation: (index: number) => void;
  };
  errors: {
    education: Array<{
      collegeName?: string;
      degree?: string;
      branch?: string;
      cgpaOrPercentage?: string;
      yearOfJoining?: string;
      yearOfPassing?: string;
    }>;
  };
}

export const Step4Education: React.FC<Step4EducationProps> = ({
  education,
  handlers,
  errors,
}) => {
  return (
    <div className="wizard-step-section animated fade-in">
      <h2>Academic Credentials</h2>
      <p className="step-subtitle">
        Your college, high school, or bootcamp degrees.
      </p>

      <div className="dynamic-items-list">
        {education.map((edu, index) => (
          <div key={index} className="wizard-item-card glass-card">
            <div className="wizard-item-header">
              <h4>Education #{index + 1}</h4>
              {education.length > 1 && (
                <button
                  type="button"
                  onClick={() => handlers.removeEducation(index)}
                  className="btn-icon btn-remove"
                >
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
                  placeholder="e.g. Stanford University"
                  required
                />
                {errors.education[index]?.collegeName && (
                  <span className="field-error-msg">
                    {errors.education[index].collegeName}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label>Degree *</label>
                <ComboBox
                  name="degree"
                  value={edu.degree}
                  onChange={(e) => handlers.handleEducationChange(e, index)}
                  onBlur={(e) => handlers.handleEducationBlur(e, index)}
                  suggestions={DEGREE_SUGGESTIONS}
                  placeholder="e.g. B.Tech, M.Sc, MBA…"
                  required
                />
                {errors.education[index]?.degree && (
                  <span className="field-error-msg">
                    {errors.education[index].degree}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label>Branch / Major *</label>
                <ComboBox
                  name="branch"
                  value={edu.branch}
                  onChange={(e) => handlers.handleEducationChange(e, index)}
                  onBlur={(e) => handlers.handleEducationBlur(e, index)}
                  suggestions={BRANCH_SUGGESTIONS}
                  placeholder="e.g. Computer Science & Engineering…"
                  required
                />
                {errors.education[index]?.branch && (
                  <span className="field-error-msg">
                    {errors.education[index].branch}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label>CGPA or Percentage *</label>
                <input
                  type="text"
                  name="cgpaOrPercentage"
                  value={edu.cgpaOrPercentage}
                  onChange={(e) => handlers.handleEducationChange(e, index)}
                  placeholder="e.g. 8.5 or 85%"
                  required
                />
                {errors.education[index]?.cgpaOrPercentage && (
                  <span className="field-error-msg">
                    {errors.education[index].cgpaOrPercentage}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label>Year of Joining *</label>
                <input
                  type="date"
                  name="yearOfJoining"
                  value={edu.yearOfJoining}
                  onChange={(e) => handlers.handleEducationChange(e, index)}
                  required
                />
                {errors.education[index]?.yearOfJoining && (
                  <span className="field-error-msg">
                    {errors.education[index].yearOfJoining}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label>Year of Passing *</label>
                <input
                  type="date"
                  name="yearOfPassing"
                  value={edu.yearOfPassing}
                  onChange={(e) => handlers.handleEducationChange(e, index)}
                  required
                />
                {errors.education[index]?.yearOfPassing && (
                  <span className="field-error-msg">
                    {errors.education[index].yearOfPassing}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handlers.addEducation}
        className="btn-add-item"
      >
        <FaPlus /> Add Another Education
      </button>
    </div>
  );
};
