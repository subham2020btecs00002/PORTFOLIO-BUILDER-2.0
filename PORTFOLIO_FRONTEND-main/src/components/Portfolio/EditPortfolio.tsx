import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import '../Portfolio/PortfolioForm.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import debounce from 'lodash.debounce';
import { baseUrl } from '../url';
import type {
  PortfolioFormData,
  Portfolio,
  Project,
  Education,
  ProfessionalHistory,
} from '../../types';

// ---------------------------------------------------------------------------
// Error shapes
// ---------------------------------------------------------------------------

interface ProjectErrors {
  title: string;
  description: string;
  link: string;
}

interface EducationErrors {
  collegeName: string;
  degree: string;
  branch: string;
  cgpaOrPercentage: string;
  yearOfJoining: string;
  yearOfPassing: string;
}

interface ProfessionalHistoryErrors {
  companyName: string;
  position: string;
  responsibility: string;
  yearOfJoining: string;
  yearOfLeaving: string;
}

interface FormErrors {
  title: string;
  description: string;
  projects: ProjectErrors[];
  education: EducationErrors[];
  professionalHistory: ProfessionalHistoryErrors[];
  portfolioLinks: { github: string; leetcode: string; gfg: string };
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const nameValidator = /^[a-zA-Z\s]*$/;
const pointWiseValidator = /^[A-Z][^.!?]*\.\s*(?:[A-Z][^.!?]*\.\s*)*$/;
const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;

const validateTitle = (title: string): string => {
  if (title.trim() === '') return 'Title cannot be empty';
  if (title.length < 3) return 'Title must be at least 3 characters long';
  if (!nameValidator.test(title)) return 'Title cannot contain numbers';
  return '';
};

const validateDescription = (description: string): string => {
  if (description.trim() === '') return 'Description cannot be empty';
  if (!pointWiseValidator.test(description)) {
    return 'Description must be in point-wise format, each point starting with a capital letter and ending with a period.';
  }
  return '';
};

const validateLink = (link: string): string => {
  if (!link) return 'Link is required';
  if (!urlPattern.test(link)) return 'Invalid URL format';
  return '';
};

const validateEducationField = (name: string, value: string): string => {
  switch (name) {
    case 'collegeName': return value.trim() ? '' : 'College Name is required.';
    case 'degree': return value ? '' : 'Degree is required.';
    case 'branch': return value ? '' : 'Branch is required.';
    case 'cgpaOrPercentage': return value.trim() ? '' : 'CGPA or Percentage is required.';
    case 'yearOfJoining': return value === '' ? 'Year of Joining is required.' : '';
    case 'yearOfPassing': return value.trim() ? '' : 'Year of Passing is required.';
    default: return '';
  }
};

const validateProfessionalHistoryField = (
  name: string,
  value: string,
  history: ProfessionalHistory,
): string => {
  switch (name) {
    case 'companyName': return value.trim() ? '' : 'Company name is required';
    case 'position': return value.trim() ? '' : 'Position is required';
    case 'responsibility':
      if (!value.trim()) return 'Responsibility is required';
      if (!pointWiseValidator.test(value)) {
        return 'Responsibility must start with a capital letter and end with a period.';
      }
      return '';
    case 'yearOfJoining':
      if (!value) return 'Year of joining is required';
      if (history.yearOfLeaving && new Date(value) >= new Date(history.yearOfLeaving)) {
        return 'Year of joining must be before Year of leaving';
      }
      return '';
    case 'yearOfLeaving':
      if (!history.isCurrentEmployee && !value) return 'Year of leaving is required';
      if (!history.isCurrentEmployee && history.yearOfJoining &&
          new Date(value) <= new Date(history.yearOfJoining)) {
        return 'Year of leaving must be after Year of joining';
      }
      return '';
    default: return '';
  }
};

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

const emptyProject = (): Project => ({ title: '', description: '', link: '' });
const emptyProjectErrors = (): ProjectErrors => ({ title: '', description: '', link: '' });

const emptyEducation = (): Education => ({
  collegeName: '', degree: '', branch: '',
  cgpaOrPercentage: '', yearOfJoining: '', yearOfPassing: '',
});
const emptyEducationErrors = (): EducationErrors => ({
  collegeName: '', degree: '', branch: '',
  cgpaOrPercentage: '', yearOfJoining: '', yearOfPassing: '',
});

const emptyHistory = (): ProfessionalHistory => ({
  companyName: '', position: '', responsibility: '',
  yearOfJoining: '', yearOfLeaving: '', isCurrentEmployee: false,
});
const emptyHistoryErrors = (): ProfessionalHistoryErrors => ({
  companyName: '', position: '', responsibility: '',
  yearOfJoining: '', yearOfLeaving: '',
});

// ---------------------------------------------------------------------------
// Sub-components (prop-typed for strong contracts)
// ---------------------------------------------------------------------------

interface ProjectInputProps {
  project: Project;
  index: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => void;
  onRemove: (index: number) => void;
  errors?: ProjectErrors;
}

const ProjectInput: React.FC<ProjectInputProps> = ({ project, index, onChange, onRemove, errors }) => (
  <div className="project-group">
    <div className="form-group">
      <label htmlFor={`project-title-${index}`}>Project Title</label>
      <input type="text" name="title" id={`project-title-${index}`}
        value={project.title} onChange={(e) => onChange(e, index)} required />
      {errors?.title && <span className="error-message">{errors.title}</span>}
    </div>
    <div className="form-group">
      <label htmlFor={`project-description-${index}`}>Project Description</label>
      <textarea name="description" id={`project-description-${index}`}
        value={project.description} onChange={(e) => onChange(e, index)} />
      {errors?.description && <span className="error-message">{errors.description}</span>}
    </div>
    <div className="form-group">
      <label htmlFor={`project-link-${index}`}>Project Link</label>
      <input type="text" name="link" id={`project-link-${index}`}
        value={project.link ?? ''} onChange={(e) => onChange(e, index)} />
      {errors?.link && <span className="error-message">{errors.link}</span>}
    </div>
    <button type="button" onClick={() => onRemove(index)} className="remove-btn">
      Remove Project
    </button>
  </div>
);

interface EducationInputProps {
  edu: Education;
  index: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, index: number) => void;
  onRemove: (index: number) => void;
  errors?: EducationErrors;
}

const EducationInput: React.FC<EducationInputProps> = ({ edu, index, onChange, onBlur, onRemove, errors }) => (
  <div className="education-group">
    <div className="form-group">
      <label htmlFor={`collegeName-${index}`}>College Name</label>
      <input type="text" name="collegeName" id={`collegeName-${index}`}
        value={edu.collegeName} onChange={(e) => onChange(e, index)}
        onBlur={(e) => onBlur(e, index)} required />
      {errors?.collegeName && <span className="error-message">{errors.collegeName}</span>}
    </div>
    <div className="form-group">
      <label htmlFor={`degree-${index}`}>Degree</label>
      <select name="degree" id={`degree-${index}`} value={edu.degree}
        onChange={(e) => onChange(e, index)} onBlur={(e) => onBlur(e, index)}>
        <option value="">Select Degree</option>
        <option value="Btech">Btech</option>
        <option value="Mtech">Mtech</option>
        <option value="Diploma">Diploma</option>
      </select>
      {errors?.degree && <span className="error-message">{errors.degree}</span>}
    </div>
    <div className="form-group">
      <label htmlFor={`branch-${index}`}>Branch</label>
      <select name="branch" id={`branch-${index}`} value={edu.branch}
        onChange={(e) => onChange(e, index)} onBlur={(e) => onBlur(e, index)}>
        <option value="">Select Branch</option>
        <option value="Computer Science">Computer Science</option>
        <option value="Information Technology">Information Technology</option>
        <option value="Mechanical Engineering">Mechanical Engineering</option>
        <option value="Electronics Engineering">Electronics Engineering</option>
        <option value="Electrical Engineering">Electrical Engineering</option>
      </select>
      {errors?.branch && <span className="error-message">{errors.branch}</span>}
    </div>
    <div className="form-group">
      <label htmlFor={`cgpaOrPercentage-${index}`}>CGPA/Percentage</label>
      <input type="text" name="cgpaOrPercentage" id={`cgpaOrPercentage-${index}`}
        value={edu.cgpaOrPercentage} onChange={(e) => onChange(e, index)}
        onBlur={(e) => onBlur(e, index)} />
      {errors?.cgpaOrPercentage && <span className="error-message">{errors.cgpaOrPercentage}</span>}
    </div>
    <div className="form-group">
      <label htmlFor={`edu-yearOfJoining-${index}`}>Year of Joining</label>
      <input type="date" name="yearOfJoining" id={`edu-yearOfJoining-${index}`}
        value={edu.yearOfJoining} onChange={(e) => onChange(e, index)}
        onBlur={(e) => onBlur(e, index)} required />
      {errors?.yearOfJoining && <span className="error-message">{errors.yearOfJoining}</span>}
    </div>
    <div className="form-group">
      <label htmlFor={`yearOfPassing-${index}`}>Year of Passing</label>
      <input type="date" name="yearOfPassing" id={`yearOfPassing-${index}`}
        value={edu.yearOfPassing} onChange={(e) => onChange(e, index)}
        onBlur={(e) => onBlur(e, index)} required />
      {errors?.yearOfPassing && <span className="error-message">{errors.yearOfPassing}</span>}
    </div>
    <button type="button" onClick={() => onRemove(index)} className="remove-btn">
      Remove Education
    </button>
  </div>
);

interface ProfessionalHistoryInputProps {
  hist: ProfessionalHistory;
  index: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => void;
  onRemove: (index: number) => void;
  errors?: ProfessionalHistoryErrors;
}

const ProfessionalHistoryInput: React.FC<ProfessionalHistoryInputProps> = ({ hist, index, onChange, onRemove, errors }) => (
  <div className="professional-history-group">
    <div className="form-group">
      <label htmlFor={`companyName-${index}`}>Company Name</label>
      <input type="text" name="companyName" id={`companyName-${index}`}
        value={hist.companyName} onChange={(e) => onChange(e, index)} required />
      {errors?.companyName && <span className="error-message">{errors.companyName}</span>}
    </div>
    <div className="form-group">
      <label htmlFor={`position-${index}`}>Position</label>
      <input type="text" name="position" id={`position-${index}`}
        value={hist.position} onChange={(e) => onChange(e, index)} />
      {errors?.position && <span className="error-message">{errors.position}</span>}
    </div>
    <div className="form-group">
      <label htmlFor={`responsibility-${index}`}>Responsibility</label>
      <textarea name="responsibility" id={`responsibility-${index}`}
        value={hist.responsibility} onChange={(e) => onChange(e, index)} />
      {errors?.responsibility && <span className="error-message">{errors.responsibility}</span>}
    </div>
    <div className="form-group">
      <label htmlFor={`hist-yearOfJoining-${index}`}>Year of Joining</label>
      <input type="date" name="yearOfJoining" id={`hist-yearOfJoining-${index}`}
        value={hist.yearOfJoining} onChange={(e) => onChange(e, index)} />
      {errors?.yearOfJoining && <span className="error-message">{errors.yearOfJoining}</span>}
    </div>
    <div className="form-group">
      <label htmlFor={`yearOfLeaving-${index}`}>Year of Leaving</label>
      <input type="date" name="yearOfLeaving" id={`yearOfLeaving-${index}`}
        value={hist.isCurrentEmployee ? '' : (hist.yearOfLeaving ?? '')}
        onChange={(e) => onChange(e, index)} disabled={hist.isCurrentEmployee} />
      {errors?.yearOfLeaving && <span className="error-message">{errors.yearOfLeaving}</span>}
    </div>
    <div className="form-group">
      <label htmlFor={`isCurrentEmployee-${index}`}>Presently working here?</label>
      <input type="checkbox" name="isCurrentEmployee" id={`isCurrentEmployee-${index}`}
        checked={hist.isCurrentEmployee} onChange={(e) => onChange(e, index)} />
    </div>
    <button type="button" onClick={() => onRemove(index)} className="remove-btn">
      Remove Professional History
    </button>
  </div>
);

// ---------------------------------------------------------------------------
// Main EditPortfolio component
// ---------------------------------------------------------------------------

/** Fetches the current user's portfolio and renders a pre-populated edit form. */
const EditPortfolio: React.FC = () => {
  // useAuth for future personalisation; destructure as needed
  useAuth();

  const [formData, setFormData] = useState<PortfolioFormData>({
    title: '', description: '',
    projects: [emptyProject()],
    education: [emptyEducation()],
    professionalHistory: [emptyHistory()],
    portfolioLinks: { github: '', leetcode: '', gfg: '' },
    pdf: null,
  });

  const [errors, setErrors] = useState<FormErrors>({
    title: '', description: '',
    projects: [emptyProjectErrors()],
    education: [emptyEducationErrors()],
    professionalHistory: [emptyHistoryErrors()],
    portfolioLinks: { github: '', leetcode: '', gfg: '' },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);

  // ------------------------------------------------------------------
  // Fetch existing portfolio on mount
  // ------------------------------------------------------------------

  useEffect(() => {
    const fetchPortfolio = debounce(async (): Promise<void> => {
      try {
        const { data } = await api.get<Portfolio>('/api/portfolio');

        const transformData = (portfolio: Portfolio): PortfolioFormData => ({
          ...portfolio,
          pdf: null,
          education: portfolio.education.map((edu) => ({
            ...edu,
            yearOfJoining: edu.yearOfJoining
              ? new Date(edu.yearOfJoining).toISOString().substring(0, 10)
              : '',
            yearOfPassing: edu.yearOfPassing
              ? new Date(edu.yearOfPassing).toISOString().substring(0, 10)
              : '',
          })),
          professionalHistory: portfolio.professionalHistory.map((hist) => ({
            ...hist,
            yearOfJoining: hist.yearOfJoining
              ? new Date(hist.yearOfJoining).toISOString().substring(0, 10)
              : '',
            yearOfLeaving: hist.yearOfLeaving
              ? new Date(hist.yearOfLeaving).toISOString().substring(0, 10)
              : '',
          })),
        });

        setFormData(transformData(data));
        setCurrentPdfUrl(`${baseUrl}/api/portfolio/download/${data._id}`);

        // Sync error arrays to match the fetched data length
        setErrors((prev) => ({
          ...prev,
          projects: data.projects.map(() => emptyProjectErrors()),
          education: data.education.map(() => emptyEducationErrors()),
          professionalHistory: data.professionalHistory.map(() => emptyHistoryErrors()),
        }));
      } catch (err: unknown) {
        if (err instanceof Error) console.error(err.message);
      }
    }, 300);

    void fetchPortfolio();
    return () => fetchPortfolio.cancel();
  }, []);

  // ------------------------------------------------------------------
  // Top-level field handlers
  // ------------------------------------------------------------------

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'title') setErrors((prev) => ({ ...prev, title: validateTitle(value) }));
    else if (name === 'description') setErrors((prev) => ({ ...prev, description: validateDescription(value) }));
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, pdf: file }));
  };

  // ------------------------------------------------------------------
  // Projects
  // ------------------------------------------------------------------

  const handleProjectChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.map((p, i) => i === index ? { ...p, [name]: value } : p),
    }));
    let error = '';
    if (name === 'title') error = validateTitle(value);
    else if (name === 'description') error = validateDescription(value);
    else if (name === 'link') error = validateLink(value);
    setErrors((prev) => ({
      ...prev,
      projects: prev.projects.map((pe, i) => i === index ? { ...pe, [name]: error } : pe),
    }));
  };

  const addProject = (): void => {
    setFormData((prev) => ({ ...prev, projects: [...prev.projects, emptyProject()] }));
    setErrors((prev) => ({ ...prev, projects: [...prev.projects, emptyProjectErrors()] }));
  };

  const removeProject = (index: number): void => {
    setFormData((prev) => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
    setErrors((prev) => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
  };

  // ------------------------------------------------------------------
  // Education
  // ------------------------------------------------------------------

  const handleEducationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) => i === index ? { ...edu, [name]: value } : edu),
    }));
    setErrors((prev) => {
      const updated = prev.education.map((ee, i) =>
        i === index ? { ...ee, [name]: validateEducationField(name, value) } : ee,
      );
      if (name === 'yearOfJoining' || name === 'yearOfPassing') {
        const edu = formData.education[index];
        const joiningVal = name === 'yearOfJoining' ? value : edu.yearOfJoining;
        const passingVal = name === 'yearOfPassing' ? value : edu.yearOfPassing;
        updated[index] = {
          ...updated[index],
          yearOfPassing: passingVal && joiningVal && new Date(passingVal) <= new Date(joiningVal)
            ? 'Year of Passing must be after Year of Joining.' : '',
        };
      }
      return { ...prev, education: updated };
    });
  };

  const handleEducationBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
  ): void => {
    const { name, value } = e.target;
    setErrors((prev) => ({
      ...prev,
      education: prev.education.map((ee, i) =>
        i === index ? { ...ee, [name]: validateEducationField(name, value) } : ee,
      ),
    }));
  };

  const addEducation = (): void => {
    setFormData((prev) => ({ ...prev, education: [...prev.education, emptyEducation()] }));
    setErrors((prev) => ({ ...prev, education: [...prev.education, emptyEducationErrors()] }));
  };

  const removeEducation = (index: number): void => {
    setFormData((prev) => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
    setErrors((prev) => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
  };

  // ------------------------------------------------------------------
  // Professional history
  // ------------------------------------------------------------------

  const handleProfessionalHistoryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
  ): void => {
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
    const error = validateProfessionalHistoryField(name, String(fieldValue), currentHistory);
    setErrors((prev) => ({
      ...prev,
      professionalHistory: prev.professionalHistory.map((he, i) =>
        i === index ? { ...he, [name]: error } : he,
      ),
    }));
  };

  const addProfessionalHistory = (): void => {
    setFormData((prev) => ({ ...prev, professionalHistory: [...prev.professionalHistory, emptyHistory()] }));
    setErrors((prev) => ({ ...prev, professionalHistory: [...prev.professionalHistory, emptyHistoryErrors()] }));
  };

  const removeProfessionalHistory = (index: number): void => {
    setFormData((prev) => ({ ...prev, professionalHistory: prev.professionalHistory.filter((_, i) => i !== index) }));
    setErrors((prev) => ({ ...prev, professionalHistory: prev.professionalHistory.filter((_, i) => i !== index) }));
  };

  // ------------------------------------------------------------------
  // Portfolio links
  // ------------------------------------------------------------------

  const handlePortfolioLinksChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, portfolioLinks: { ...prev.portfolioLinks, [name]: value } }));
    setErrors((prev) => ({ ...prev, portfolioLinks: { ...prev.portfolioLinks, [name]: validateLink(value) } }));
  };

  // ------------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------------

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isFormValid =
      !errors.title && !errors.description &&
      errors.projects.every((pe) => !pe.title && !pe.description && !pe.link) &&
      errors.education.every((ee) => !Object.values(ee).some(Boolean)) &&
      errors.professionalHistory.every((he) => !Object.values(he).some(Boolean)) &&
      !Object.values(errors.portfolioLinks).some(Boolean);

    if (!isFormValid) {
      toast.error('Please fix the errors in the form before submitting.');
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      if (formData.pdf) payload.append('pdf', formData.pdf);

      formData.projects.forEach((project, index) => {
        payload.append(`projects[${index}][title]`, project.title);
        payload.append(`projects[${index}][description]`, project.description);
        payload.append(`projects[${index}][link]`, project.link ?? '');
      });

      formData.education.forEach((edu, index) => {
        payload.append(`education[${index}][collegeName]`, edu.collegeName);
        payload.append(`education[${index}][degree]`, edu.degree);
        payload.append(`education[${index}][branch]`, edu.branch);
        payload.append(`education[${index}][cgpaOrPercentage]`, edu.cgpaOrPercentage);
        payload.append(`education[${index}][yearOfJoining]`,
          edu.yearOfJoining ? new Date(edu.yearOfJoining).toISOString() : '');
        payload.append(`education[${index}][yearOfPassing]`,
          edu.yearOfPassing ? new Date(edu.yearOfPassing).toISOString() : '');
      });

      formData.professionalHistory.forEach((history, index) => {
        payload.append(`professionalHistory[${index}][companyName]`, history.companyName);
        payload.append(`professionalHistory[${index}][position]`, history.position);
        payload.append(`professionalHistory[${index}][responsibility]`, history.responsibility);
        payload.append(`professionalHistory[${index}][yearOfJoining]`,
          history.yearOfJoining ? new Date(history.yearOfJoining).toISOString() : '');
        payload.append(`professionalHistory[${index}][yearOfLeaving]`,
          history.isCurrentEmployee
            ? '1970-01-01T00:00:00.000Z'
            : history.yearOfLeaving ? new Date(history.yearOfLeaving).toISOString() : '');
        payload.append(`professionalHistory[${index}][isCurrentEmployee]`, String(history.isCurrentEmployee));
      });

      (Object.keys(formData.portfolioLinks) as (keyof typeof formData.portfolioLinks)[]).forEach((key) => {
        payload.append(`portfolioLinks[${key}]`, formData.portfolioLinks[key]);
      });

      await api.put('/api/portfolio', payload);
      toast.success('Portfolio updated successfully!', { containerId: 'global' });
    } catch (err: unknown) {
      toast.error('Error updating portfolio', { containerId: 'global' });
      if (err instanceof Error) console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <form onSubmit={handleSubmit} className="portfolio-form">
      <h2>Edit Portfolio</h2>

      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input type="text" id="title" name="title" value={formData.title}
          onChange={handleChange} required />
        {errors.title && <p className="error-message">{errors.title}</p>}
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" value={formData.description}
          onChange={handleChange} />
        {errors.description && <p className="error-message">{errors.description}</p>}
      </div>

      <h3>Projects</h3>
      {formData.projects.map((project, index) => (
        <ProjectInput key={index} project={project} index={index}
          onChange={handleProjectChange} onRemove={removeProject}
          errors={errors.projects[index]} />
      ))}
      <button type="button" onClick={addProject} className="add-btn">Add Project</button>

      <h3>Education</h3>
      {formData.education.map((edu, index) => (
        <EducationInput key={index} edu={edu} index={index}
          onChange={handleEducationChange} onBlur={handleEducationBlur}
          onRemove={removeEducation} errors={errors.education[index]} />
      ))}
      <button type="button" onClick={addEducation} className="add-btn">Add Education</button>

      <h3>Professional History</h3>
      {formData.professionalHistory.map((hist, index) => (
        <ProfessionalHistoryInput key={index} hist={hist} index={index}
          onChange={handleProfessionalHistoryChange} onRemove={removeProfessionalHistory}
          errors={errors.professionalHistory[index]} />
      ))}
      <button type="button" onClick={addProfessionalHistory} className="add-btn">
        Add Professional History
      </button>

      <h3>Portfolio Links</h3>
      <div className="form-group">
        <label htmlFor="github">GitHub</label>
        <input type="text" name="github" id="github"
          value={formData.portfolioLinks.github} onChange={handlePortfolioLinksChange} />
        {errors.portfolioLinks.github && <span className="error-message">{errors.portfolioLinks.github}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="leetcode">LeetCode</label>
        <input type="text" name="leetcode" id="leetcode"
          value={formData.portfolioLinks.leetcode} onChange={handlePortfolioLinksChange} />
        {errors.portfolioLinks.leetcode && <span className="error-message">{errors.portfolioLinks.leetcode}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="gfg">GeeksforGeeks</label>
        <input type="text" name="gfg" id="gfg"
          value={formData.portfolioLinks.gfg} onChange={handlePortfolioLinksChange} />
        {errors.portfolioLinks.gfg && <span className="error-message">{errors.portfolioLinks.gfg}</span>}
      </div>

      <div className="form-group">
        <label>Upload PDF</label>
        <input type="file" name="pdf" id="pdf-upload"
          onChange={handleFileChange} accept="application/pdf" />
        {currentPdfUrl && (
          <div>
            <a href={currentPdfUrl} target="_blank" rel="noopener noreferrer">
              View current PDF
            </a>
          </div>
        )}
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? <span className="loading-spinner" /> : 'Update'}
      </button>
    </form>
  );
};

export default EditPortfolio;
