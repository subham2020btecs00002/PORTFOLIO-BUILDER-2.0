import React, { useState } from 'react';
import type {
  PortfolioFormData,
  Project,
  Education,
  ProfessionalHistory,
  Skill,
} from '../types';

// ---------------------------------------------------------------------------
// Error shapes
// ---------------------------------------------------------------------------

export interface ProjectErrors {
  title: string;
  description: string;
  link: string;
}

export interface EducationErrors {
  collegeName: string;
  degree: string;
  branch: string;
  cgpaOrPercentage: string;
  yearOfJoining: string;
  yearOfPassing: string;
}

export interface ProfessionalHistoryErrors {
  companyName: string;
  position: string;
  responsibility: string;
  yearOfJoining: string;
  yearOfLeaving: string;
}

export interface FormErrors {
  title: string;
  description: string;
  projects: ProjectErrors[];
  education: EducationErrors[];
  professionalHistory: ProfessionalHistoryErrors[];
  portfolioLinks: { github: string; leetcode: string; gfg: string; linkedin: string };
  skills: { name: string; level: string; category: string }[];
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const nameValidator = /^[a-zA-Z\s]*$/;
const pointWiseValidator = /^[A-Z][^.!?]*\.\s*(?:[A-Z][^.!?]*\.\s*)*$/;
const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;

export const validateTitle = (title: string): string => {
  if (title.trim() === '') return 'Title cannot be empty';
  if (title.length < 3) return 'Title must be at least 3 characters long';
  if (!nameValidator.test(title)) return 'Title cannot contain numbers';
  return '';
};

export const validateDescription = (description: string): string => {
  if (description.trim() === '') return 'Description cannot be empty';
  if (!pointWiseValidator.test(description)) {
    return 'Description must start with a capital letter and end with a period.';
  }
  return '';
};

export const validateLink = (link: string): string => {
  if (!link) return '';
  if (!urlPattern.test(link)) return 'Invalid URL format';
  return '';
};

export const validateEducationField = (name: string, value: string): string => {
  switch (name) {
    case 'collegeName':
      return value.trim() ? '' : 'College Name is required.';
    case 'degree':
      return value ? '' : 'Degree is required.';
    case 'branch':
      return value ? '' : 'Branch is required.';
    case 'cgpaOrPercentage':
      return value.trim() ? '' : 'CGPA or Percentage is required.';
    case 'yearOfJoining':
      return value === '' ? 'Year of Joining is required.' : '';
    case 'yearOfPassing':
      return value.trim() ? '' : 'Year of Passing is required.';
    default:
      return '';
  }
};

export const validateProfessionalHistoryField = (
  name: string,
  value: string,
  history: ProfessionalHistory,
): string => {
  switch (name) {
    case 'companyName':
      return value.trim() ? '' : 'Company name is required';
    case 'position':
      return value.trim() ? '' : 'Position is required';
    case 'responsibility':
      if (!value.trim()) return 'Responsibility is required';
      if (!pointWiseValidator.test(value)) {
        return 'Responsibility must start with a capital letter and end with a period.';
      }
      return '';
    case 'yearOfJoining':
      if (value === '') return 'Year of joining is required';
      if (
        history.yearOfLeaving &&
        new Date(value) >= new Date(history.yearOfLeaving)
      ) {
        return 'Year of joining must be before Year of leaving';
      }
      return '';
    case 'yearOfLeaving':
      if (!history.isCurrentEmployee && value === '') return 'Year of leaving is required';
      if (
        !history.isCurrentEmployee &&
        new Date(value) <= new Date(history.yearOfJoining)
      ) {
        return 'Year of leaving must be after Year of joining';
      }
      return '';
    default:
      return '';
  }
};

// ---------------------------------------------------------------------------
// Default factory helpers
// ---------------------------------------------------------------------------

export const emptyProject = (): Project => ({ title: '', description: '', link: '' });
export const emptyProjectErrors = (): ProjectErrors => ({ title: '', description: '', link: '' });

export const emptyEducation = (): Education => ({
  collegeName: '',
  degree: '',
  branch: '',
  cgpaOrPercentage: '',
  yearOfJoining: '',
  yearOfPassing: '',
});
export const emptyEducationErrors = (): EducationErrors => ({
  collegeName: '',
  degree: '',
  branch: '',
  cgpaOrPercentage: '',
  yearOfJoining: '',
  yearOfPassing: '',
});

export const emptyHistory = (): ProfessionalHistory => ({
  companyName: '',
  position: '',
  responsibility: '',
  yearOfJoining: '',
  yearOfLeaving: '',
  isCurrentEmployee: false,
});
export const emptyHistoryErrors = (): ProfessionalHistoryErrors => ({
  companyName: '',
  position: '',
  responsibility: '',
  yearOfJoining: '',
  yearOfLeaving: '',
});

export const emptySkill = (): Skill => ({
  name: '',
  level: 'Intermediate',
  category: '',
});

// ---------------------------------------------------------------------------
// Custom hook definition
// ---------------------------------------------------------------------------

export const usePortfolioForm = (initialFormValues?: PortfolioFormData) => {
  const defaultForm: PortfolioFormData = {
    title: '',
    description: '',
    projects: [emptyProject()],
    education: [emptyEducation()],
    professionalHistory: [emptyHistory()],
    portfolioLinks: { github: '', leetcode: '', gfg: '', linkedin: '' },
    skills: [emptySkill()],
    templateId: 'classic-green',
    pdf: null,
  };

  const defaultErrors: FormErrors = {
    title: '',
    description: '',
    projects: [emptyProjectErrors()],
    education: [emptyEducationErrors()],
    professionalHistory: [emptyHistoryErrors()],
    portfolioLinks: { github: '', leetcode: '', gfg: '', linkedin: '' },
    skills: [{ name: '', level: '', category: '' }],
  };

  const [formData, setFormData] = useState<PortfolioFormData>(initialFormValues || defaultForm);
  const [errors, setErrors] = useState<FormErrors>(defaultErrors);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 7; // Basic Info, Skills, Projects, Education, Professional History, Links & File, Template Picker

  // Handle setting loaded form data (e.g. from api in Edit mode)
  const setFormValues = (values: PortfolioFormData) => {
    setFormData(values);
    setErrors({
      title: '',
      description: '',
      projects: values.projects.map(() => emptyProjectErrors()),
      education: values.education.map(() => emptyEducationErrors()),
      professionalHistory: values.professionalHistory.map(() => emptyHistoryErrors()),
      portfolioLinks: { github: '', leetcode: '', gfg: '', linkedin: '' },
      skills: values.skills.map(() => ({ name: '', level: '', category: '' })),
    });
  };

  // Top level fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'title') {
      setErrors((prev) => ({ ...prev, title: validateTitle(value) }));
    } else if (name === 'description') {
      setErrors((prev) => ({ ...prev, description: validateDescription(value) }));
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setFormData((prev) => ({ ...prev, templateId }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, pdf: file }));
  };

  // Projects logic
  const handleProjectChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.map((p, i) => (i === index ? { ...p, [name]: value } : p)),
    }));

    let err = '';
    if (name === 'title') err = validateTitle(value);
    else if (name === 'description') err = validateDescription(value);
    else if (name === 'link') err = validateLink(value);

    setErrors((prev) => ({
      ...prev,
      projects: prev.projects.map((pe, i) => (i === index ? { ...pe, [name]: err } : pe)),
    }));
  };

  const addProject = () => {
    setFormData((prev) => ({ ...prev, projects: [...prev.projects, emptyProject()] }));
    setErrors((prev) => ({ ...prev, projects: [...prev.projects, emptyProjectErrors()] }));
  };

  const removeProject = (index: number) => {
    setFormData((prev) => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
    setErrors((prev) => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
  };

  // Education logic
  const handleEducationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) => (i === index ? { ...edu, [name]: value } : edu)),
    }));

    setErrors((prev) => {
      const updated = prev.education.map((ee, i) =>
        i === index ? { ...ee, [name]: validateEducationField(name, value) } : ee,
      );

      // Cross-field date validation
      if (name === 'yearOfJoining' || name === 'yearOfPassing') {
        const edu = formData.education[index];
        const joiningVal = name === 'yearOfJoining' ? value : edu.yearOfJoining;
        const passingVal = name === 'yearOfPassing' ? value : edu.yearOfPassing;
        if (passingVal && joiningVal && new Date(passingVal) <= new Date(joiningVal)) {
          updated[index] = {
            ...updated[index],
            yearOfPassing: 'Year of Passing must be after Year of Joining.',
          };
        } else {
          updated[index] = { ...updated[index], yearOfPassing: '' };
        }
      }
      return { ...prev, education: updated };
    });
  };

  const handleEducationBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
  ) => {
    const { name, value } = e.target;
    setErrors((prev) => ({
      ...prev,
      education: prev.education.map((ee, i) =>
        i === index ? { ...ee, [name]: validateEducationField(name, value) } : ee,
      ),
    }));
  };

  const addEducation = () => {
    setFormData((prev) => ({ ...prev, education: [...prev.education, emptyEducation()] }));
    setErrors((prev) => ({ ...prev, education: [...prev.education, emptyEducationErrors()] }));
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
    setErrors((prev) => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
  };

  // Professional History logic
  const handleProfessionalHistoryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      professionalHistory: prev.professionalHistory.map((h, i) =>
        i === index ? { ...h, [name]: fieldValue } : h,
      ),
    }));

    const currentHistory = formData.professionalHistory[index];
    // Need to use temporary updated history object to validate correctly
    const updatedHistory = { ...currentHistory, [name]: fieldValue };
    const err = validateProfessionalHistoryField(name, String(fieldValue), updatedHistory);

    setErrors((prev) => ({
      ...prev,
      professionalHistory: prev.professionalHistory.map((he, i) =>
        i === index ? { ...he, [name]: err } : he,
      ),
    }));
  };

  const addProfessionalHistory = () => {
    setFormData((prev) => ({
      ...prev,
      professionalHistory: [...prev.professionalHistory, emptyHistory()],
    }));
    setErrors((prev) => ({
      ...prev,
      professionalHistory: [...prev.professionalHistory, emptyHistoryErrors()],
    }));
  };

  const removeProfessionalHistory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      professionalHistory: prev.professionalHistory.filter((_, i) => i !== index),
    }));
    setErrors((prev) => ({
      ...prev,
      professionalHistory: prev.professionalHistory.filter((_, i) => i !== index),
    }));
  };

  // Skills logic
  const handleSkillChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((s, i) => (i === index ? { ...s, [name]: value } : s)),
    }));
  };

  const addSkill = () => {
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, emptySkill()] }));
    setErrors((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: '', level: '', category: '' }],
    }));
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
    setErrors((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  // Links logic
  const handlePortfolioLinksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      portfolioLinks: { ...prev.portfolioLinks, [name]: value },
    }));

    setErrors((prev) => ({
      ...prev,
      portfolioLinks: { ...prev.portfolioLinks, [name]: validateLink(value) },
    }));
  };

  // Wizard navigation
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const isFormValid = () => {
    const hasBasicErrors = !!errors.title || !!errors.description;
    const hasProjectErrors = errors.projects.some((pe) => !!pe.title || !!pe.description || !!pe.link);
    const hasEducationErrors = errors.education.some((ee) => Object.values(ee).some(Boolean));
    const hasHistoryErrors = errors.professionalHistory.some((he) => Object.values(he).some(Boolean));
    const hasLinkErrors = Object.values(errors.portfolioLinks).some(Boolean);

    return !hasBasicErrors && !hasProjectErrors && !hasEducationErrors && !hasHistoryErrors && !hasLinkErrors;
  };

  return {
    formData,
    errors,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    setStep: setCurrentStep,
    setFormValues,
    isFormValid,
    handlers: {
      handleChange,
      handleFileChange,
      handleTemplateChange,
      handleProjectChange,
      addProject,
      removeProject,
      handleEducationChange,
      handleEducationBlur,
      addEducation,
      removeEducation,
      handleProfessionalHistoryChange,
      addProfessionalHistory,
      removeProfessionalHistory,
      handleSkillChange,
      addSkill,
      removeSkill,
      handlePortfolioLinksChange,
    },
  };
};
