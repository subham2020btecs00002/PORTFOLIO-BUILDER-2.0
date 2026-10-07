import React from 'react';
import { FaTrash, FaPlus } from 'react-icons/fa';
import ComboBox from '../../common/ComboBox';
import {
  SKILL_SUGGESTIONS,
  SKILL_CATEGORY_SUGGESTIONS,
} from '../../../data/formSuggestions';

interface Step2SkillsProps {
  skills: Array<{ name: string; level: string; category: string }>;
  handlers: {
    handleSkillChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      index: number,
    ) => void;
    addSkill: () => void;
    removeSkill: (index: number) => void;
  };
  errors: {
    skills: Array<{ name?: string; category?: string; level?: string }>;
  };
}

export const Step2Skills: React.FC<Step2SkillsProps> = ({
  skills,
  handlers,
  errors,
}) => {
  return (
    <div className="wizard-step-section animated fade-in">
      <h2>Technical Skills</h2>
      <p className="step-subtitle">
        Add technical skills and group them in categories.
      </p>

      <div className="dynamic-items-list">
        {skills.map((skill, index) => (
          <div key={index} className="wizard-item-card glass-card">
            <div className="wizard-item-header">
              <h4>Skill #{index + 1}</h4>
              {skills.length > 1 && (
                <button
                  type="button"
                  onClick={() => handlers.removeSkill(index)}
                  className="btn-icon btn-remove"
                >
                  <FaTrash />
                </button>
              )}
            </div>
            <div className="wizard-card-grid">
              <div className="form-group">
                <label>Skill Name *</label>
                <ComboBox
                  name="name"
                  value={skill.name}
                  onChange={(e) => handlers.handleSkillChange(e, index)}
                  suggestions={SKILL_SUGGESTIONS}
                  placeholder="e.g. React, Python, Docker…"
                  required
                />
                {errors.skills[index]?.name && (
                  <span className="field-error-msg">
                    {errors.skills[index].name}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label>Skill Category</label>
                <ComboBox
                  name="category"
                  value={skill.category}
                  onChange={(e) => handlers.handleSkillChange(e, index)}
                  suggestions={SKILL_CATEGORY_SUGGESTIONS}
                  placeholder="e.g. Frontend, DevOps…"
                />
              </div>
              <div className="form-group select-span-2">
                <label>Expertise Level</label>
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
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handlers.addSkill}
        className="btn-add-item"
      >
        <FaPlus /> Add Skill
      </button>
    </div>
  );
};
