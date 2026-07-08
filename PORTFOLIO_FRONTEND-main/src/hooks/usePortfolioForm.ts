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
// Validation helpers — pragmatic, user-friendly rules
// ---------------------------------------------------------------------------

/** Loose URL: must start with http(s):// or be blank */
const urlPattern = /^https?:\/\/\S+\.\S+/;

/** CGPA: 0.0–10.0 or percentage: 0–100% or 0–100 */
const cgpaPattern = /^(?:10(?:\.0{1,2})?|[0-9](?:\.\d{1,2})?)$/;
const percentagePattern = /^(?:100(?:\.0{1,2})?|[0-9]{1,2}(?:\.\d{1,2})?)\s*%?$/;

// --- Title ---
export const validateTitle = (title: string): string => {
  const t = title.trim();
  if (!t) return 'Headline title is required.';
  if (t.length < 3) return 'Title must be at least 3 characters.';
  if (t.length > 120) return 'Title must be under 120 characters.';
  return '';
};

// --- Summary / Description ---
export const validateDescription = (description: string): string => {
  const d = description.trim();
  if (!d) return 'Professional summary is required.';
  if (d.length < 30) return 'Summary is too short — write at least 30 characters.';
  if (d.length > 2000) return 'Summary must be under 2000 characters.';
  return '';
};

// --- Project title ---
export const validateProjectTitle = (title: string): string => {
  const t = title.trim();
  if (!t) return 'Project title is required.';
  if (t.length < 2) return 'Project title must be at least 2 characters.';
  if (t.length > 150) return 'Project title must be under 150 characters.';
  return '';
};

// --- Project description ---
export const validateProjectDescription = (desc: string): string => {
  const d = desc.trim();
  if (!d) return 'Project description is required.';
  if (d.length < 20) return 'Description is too short — write at least 20 characters.';
  if (d.length > 1500) return 'Description must be under 1500 characters.';
  return '';
};

// --- URL ---
export const validateLink = (link: string): string => {
  if (!link || !link.trim()) return ''; // Optional
  if (!urlPattern.test(link.trim())) {
    return 'Please enter a valid URL starting with http:// or https://';
  }
  return '';
};

// --- Skill name ---
export const validateSkillName = (name: string): string => {
  const n = name.trim();
  if (!n) return 'Skill name is required.';
  if (n.length < 1) return 'Skill name cannot be empty.';
  if (n.length > 80) return 'Skill name must be under 80 characters.';
  return '';
};

// --- Education field-by-field ---
export const validateEducationField = (name: string, value: string, education?: Education): string => {
  switch (name) {
    case 'collegeName': {
      const v = value.trim();
      if (!v) return 'College or institution name is required.';
      if (v.length < 3) return 'Name is too short.';
      return '';
    }
    case 'degree': {
      const v = value.trim();
      if (!v) return 'Degree is required (e.g. B.Tech, B.Sc, Diploma).';
      return '';
    }
    case 'branch': {
      const v = value.trim();
      if (!v) return 'Branch or major is required (e.g. Computer Science).';
      return '';
    }
    case 'cgpaOrPercentage': {
      const v = value.trim();
      if (!v) return 'CGPA or percentage is required.';
      if (!cgpaPattern.test(v) && !percentagePattern.test(v)) {
        return 'Enter a valid CGPA (e.g. 8.5) or percentage (e.g. 85% or 85).';
      }
      return '';
    }
    case 'yearOfJoining': {
      if (!value) return 'Year of joining is required.';
      const date = new Date(value);
      const year = date.getFullYear();
      if (year < 1950 || year > new Date().getFullYear() + 1) {
        return 'Enter a realistic joining year.';
      }
      return '';
    }
    case 'yearOfPassing': {
      if (!value) return 'Year of passing is required.';
      if (education?.yearOfJoining && value) {
        if (new Date(value) <= new Date(education.yearOfJoining)) {
          return 'Year of passing must be after year of joining.';
        }
      }
      return '';
    }
    default:
      return '';
  }
};

// --- Professional history field-by-field ---
export const validateProfessionalHistoryField = (
  name: string,
  value: string,
  history: ProfessionalHistory,
): string => {
  switch (name) {
    case 'companyName': {
      const v = value.trim();
      if (!v) return 'Company name is required.';
      if (v.length < 2) return 'Company name is too short.';
      return '';
    }
    case 'position': {
      const v = value.trim();
      if (!v) return 'Position or role title is required.';
      if (v.length < 2) return 'Position is too short.';
      return '';
    }
    case 'responsibility': {
      const v = value.trim();
      if (!v) return 'Responsibilities are required.';
      if (v.length < 20) return 'Please describe your responsibilities in at least 20 characters.';
      return '';
    }
    case 'yearOfJoining': {
      if (!value) return 'Date of joining is required.';
      if (history.yearOfLeaving && !history.isCurrentEmployee) {
        if (new Date(value) >= new Date(history.yearOfLeaving)) {
          return 'Joining date must be before leaving date.';
        }
      }
      return '';
    }
    case 'yearOfLeaving': {
      if (!history.isCurrentEmployee) {
        if (!value) return 'Date of leaving is required (or check "Currently working here").';
        if (history.yearOfJoining && new Date(value) <= new Date(history.yearOfJoining)) {
          return 'Leaving date must be after joining date.';
        }
      }
      return '';
    }
    default:
      return '';
  }
};

// ---------------------------------------------------------------------------
// Step-level validation — checks all required fields in a step
// ---------------------------------------------------------------------------

const validateStep1 = (formData: PortfolioFormData): Partial<FormErrors> => {
  return {
    title: validateTitle(formData.title),
    description: validateDescription(formData.description),
  };
};

const validateStep2 = (formData: PortfolioFormData): Partial<FormErrors> => {
  const skillsErrors = formData.skills.map((skill) => {
    const isEmpty = !skill.name.trim();
    return {
      name: isEmpty ? '' : validateSkillName(skill.name),
      level: '',
      category: '',
    };
  });
  return { skills: skillsErrors };
};

const validateStep3 = (formData: PortfolioFormData): Partial<FormErrors> => {
  const projectErrors = formData.projects.map((proj) => {
    const isEmpty = !proj.title.trim() && !proj.description.trim() && !(proj.link ?? '').trim();
    return {
      title: isEmpty ? '' : validateProjectTitle(proj.title),
      description: isEmpty ? '' : validateProjectDescription(proj.description),
      link: isEmpty ? '' : validateLink(proj.link ?? ''),
    };
  });
  return { projects: projectErrors };
};

const validateStep4 = (formData: PortfolioFormData): Partial<FormErrors> => {
  const educationErrors = formData.education.map((edu) => {
    const isEmpty =
      !edu.collegeName.trim() &&
      !edu.degree.trim() &&
      !edu.branch.trim() &&
      !edu.cgpaOrPercentage.trim() &&
      !edu.yearOfJoining.trim() &&
      !edu.yearOfPassing.trim();
    return {
      collegeName: isEmpty ? '' : validateEducationField('collegeName', edu.collegeName),
      degree: isEmpty ? '' : validateEducationField('degree', edu.degree),
      branch: isEmpty ? '' : validateEducationField('branch', edu.branch),
      cgpaOrPercentage: isEmpty ? '' : validateEducationField('cgpaOrPercentage', edu.cgpaOrPercentage),
      yearOfJoining: isEmpty ? '' : validateEducationField('yearOfJoining', edu.yearOfJoining),
      yearOfPassing: isEmpty ? '' : validateEducationField('yearOfPassing', edu.yearOfPassing, edu),
    };
  });
  return { education: educationErrors };
};

const validateStep5 = (formData: PortfolioFormData): Partial<FormErrors> => {
  const historyErrors = formData.professionalHistory.map((hist) => {
    const isEmpty =
      !hist.companyName.trim() &&
      !hist.position.trim() &&
      !hist.responsibility.trim() &&
      !hist.yearOfJoining.trim() &&
      !(hist.yearOfLeaving ?? '').trim();
    return {
      companyName: isEmpty ? '' : validateProfessionalHistoryField('companyName', hist.companyName, hist),
      position: isEmpty ? '' : validateProfessionalHistoryField('position', hist.position, hist),
      responsibility: isEmpty ? '' : validateProfessionalHistoryField('responsibility', hist.responsibility, hist),
      yearOfJoining: isEmpty ? '' : validateProfessionalHistoryField('yearOfJoining', hist.yearOfJoining, hist),
      yearOfLeaving: isEmpty ? '' : validateProfessionalHistoryField('yearOfLeaving', hist.yearOfLeaving ?? '', hist),
    };
  });
  return { professionalHistory: historyErrors };
};

const validateStep6 = (formData: PortfolioFormData): Partial<FormErrors> => {
  return {
    portfolioLinks: {
      github: validateLink(formData.portfolioLinks.github ?? ''),
      leetcode: validateLink(formData.portfolioLinks.leetcode ?? ''),
      gfg: validateLink(formData.portfolioLinks.gfg ?? ''),
      linkedin: validateLink(formData.portfolioLinks.linkedin ?? ''),
    },
  };
};

const stepHasErrors = (errors: Partial<FormErrors>, step: number): boolean => {
  switch (step) {
    case 1:
      return !!errors.title || !!errors.description;
    case 2:
      return !!errors.skills?.some((s) => !!s.name);
    case 3:
      return !!errors.projects?.some((p) => !!p.title || !!p.description || !!p.link);
    case 4:
      return !!errors.education?.some((e) => Object.values(e).some(Boolean));
    case 5:
      return !!errors.professionalHistory?.some((h) => Object.values(h).some(Boolean));
    case 6:
      return !!Object.values(errors.portfolioLinks ?? {}).some(Boolean);
    default:
      return false;
  }
};

// ---------------------------------------------------------------------------
// Default factory helpers
// ---------------------------------------------------------------------------

export const emptyProject = (): Project => ({ title: '', description: '', link: '', technologies: [] });
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
  technologies: [],
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
    sectionOrder: ['about', 'skills', 'experience', 'projects', 'contact'],
    themeColor: 'default',
    fontFamily: 'default',
    borderRadius: 'default',
    pdf: null,
    avatar: null,
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
  const totalSteps = 7;



  // Handle setting loaded form data (e.g. from api in Edit mode)
  const setFormValues = (values: PortfolioFormData) => {
    setFormData({
      ...values,
      sectionOrder: values.sectionOrder || ['about', 'skills', 'experience', 'projects', 'contact'],
      themeColor: values.themeColor || 'default',
      fontFamily: values.fontFamily || 'default',
      borderRadius: values.borderRadius || 'default',
      projects: (values.projects || []).map((p) => ({ ...p, technologies: p.technologies || [] })),
      professionalHistory: (values.professionalHistory || []).map((h) => ({ ...h, technologies: h.technologies || [] })),
    });
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

  const handleAvatarChange = (fileOrEvent: File | null | React.ChangeEvent<HTMLInputElement>) => {
    let file: File | null = null;
    if (fileOrEvent && 'target' in fileOrEvent) {
      file = fileOrEvent.target.files?.[0] ?? null;
    } else {
      file = fileOrEvent;
    }
    setFormData((prev) => ({ ...prev, avatar: file }));
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
    if (name === 'title') err = validateProjectTitle(value);
    else if (name === 'description') err = validateProjectDescription(value);
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

  const handleProjectCustomChange = (name: string, value: any, index: number) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.map((p, i) => (i === index ? { ...p, [name]: value } : p)),
    }));
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
      const currentEdu = { ...formData.education[index], [name]: value };
      const updated = prev.education.map((ee, i) =>
        i === index ? { ...ee, [name]: validateEducationField(name, value, currentEdu) } : ee,
      );

      // Cross-field date validation
      if (name === 'yearOfJoining' || name === 'yearOfPassing') {
        const joiningVal = name === 'yearOfJoining' ? value : formData.education[index].yearOfJoining;
        const passingVal = name === 'yearOfPassing' ? value : formData.education[index].yearOfPassing;
        if (passingVal && joiningVal && new Date(passingVal) <= new Date(joiningVal)) {
          updated[index] = {
            ...updated[index],
            yearOfPassing: 'Year of passing must be after year of joining.',
          };
        } else if (passingVal && joiningVal) {
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
    const currentEdu = formData.education[index];
    setErrors((prev) => ({
      ...prev,
      education: prev.education.map((ee, i) =>
        i === index ? { ...ee, [name]: validateEducationField(name, value, currentEdu) } : ee,
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

  const handleProfessionalHistoryCustomChange = (name: string, value: any, index: number) => {
    setFormData((prev) => ({
      ...prev,
      professionalHistory: prev.professionalHistory.map((h, i) => (i === index ? { ...h, [name]: value } : h)),
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

    if (name === 'name') {
      setErrors((prev) => ({
        ...prev,
        skills: prev.skills.map((se, i) =>
          i === index ? { ...se, name: validateSkillName(value) } : se,
        ),
      }));
    }
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

  // Links logic — only validate on blur (not every keystroke)
  const handlePortfolioLinksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      portfolioLinks: { ...prev.portfolioLinks, [name]: value },
    }));
    // Clear error while user is typing, only validate on blur
    setErrors((prev) => ({
      ...prev,
      portfolioLinks: { ...prev.portfolioLinks, [name]: '' },
    }));
  };

  const handlePortfolioLinksBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrors((prev) => ({
      ...prev,
      portfolioLinks: { ...prev.portfolioLinks, [name]: validateLink(value) },
    }));
  };

  // Wizard navigation — validate current step before allowing next
  // Returns true if it advanced, false if blocked by errors
  const nextStep = (): boolean => {
    if (currentStep >= totalSteps) return false;

    // Run validation for the current step
    let stepErrors: Partial<FormErrors> = {};
    switch (currentStep) {
      case 1: stepErrors = validateStep1(formData); break;
      case 2: stepErrors = validateStep2(formData); break;
      case 3: stepErrors = validateStep3(formData); break;
      case 4: stepErrors = validateStep4(formData); break;
      case 5: stepErrors = validateStep5(formData); break;
      case 6: stepErrors = validateStep6(formData); break;
    }

    // Merge the step errors into global errors state
    setErrors((prev) => ({ ...prev, ...stepErrors }));

    // Only advance if this step has no errors
    if (!stepHasErrors(stepErrors, currentStep)) {
      setCurrentStep((prev) => prev + 1);
      return true;
    }
    return false;
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStyleChange = (name: 'themeColor' | 'fontFamily' | 'borderRadius', value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSectionOrderChange = (newOrder: string[]) => {
    setFormData((prev) => ({ ...prev, sectionOrder: newOrder }));
  };

  const isFormValid = (): { valid: boolean; firstFailingStep: number } => {
    // Run full validation on all steps
    const s1 = validateStep1(formData);
    const s2 = validateStep2(formData);
    const s3 = validateStep3(formData);
    const s4 = validateStep4(formData);
    const s5 = validateStep5(formData);
    const s6 = validateStep6(formData);

    // Merge all errors so they are visible
    setErrors((prev) => ({ ...prev, ...s1, ...s2, ...s3, ...s4, ...s5, ...s6 }));

    const allSteps = [s1, s2, s3, s4, s5, s6];
    for (let i = 0; i < allSteps.length; i++) {
      if (stepHasErrors(allSteps[i], i + 1)) {
        return { valid: false, firstFailingStep: i + 1 };
      }
    }
    return { valid: true, firstFailingStep: -1 };
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
      handleAvatarChange,
      handleTemplateChange,
      handleStyleChange,
      handleSectionOrderChange,
      handleProjectChange,
      handleProjectCustomChange,
      addProject,
      removeProject,
      handleEducationChange,
      handleEducationBlur,
      addEducation,
      removeEducation,
      handleProfessionalHistoryChange,
      handleProfessionalHistoryCustomChange,
      addProfessionalHistory,
      removeProfessionalHistory,
      handleSkillChange,
      addSkill,
      removeSkill,
      handlePortfolioLinksChange,
      handlePortfolioLinksBlur,
    },
  };
};
