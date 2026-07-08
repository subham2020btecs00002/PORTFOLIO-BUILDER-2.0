import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaArrowRight, FaPlus, FaTrash, FaCheck, FaSpinner, FaBars, FaPalette, FaFont, FaShapes, FaTshirt, FaTimes, FaDownload } from 'react-icons/fa';
import api from '../api';
import { usePortfolioForm } from '../../hooks/usePortfolioForm';
import { useAuth } from '../context/AuthContext';
import { ImageCropperModal } from '../common/ImageCropperModal';
import type { Portfolio } from '../../types';
import ComboBox from '../common/ComboBox';
import { baseUrl } from '../url';
import {
  HEADLINE_SUGGESTIONS,
  SKILL_SUGGESTIONS,
  SKILL_CATEGORY_SUGGESTIONS,
  DEGREE_SUGGESTIONS,
  BRANCH_SUGGESTIONS,
  POSITION_SUGGESTIONS,
} from '../../data/formSuggestions';
import './PortfolioForm.css';

// Import templates
import { ClassicGreen } from './templates/ClassicGreen';
import { DarkPro } from './templates/DarkPro';
import { Creative } from './templates/Creative';
import { Minimalist } from './templates/Minimalist';
import { Cyberpunk } from './templates/Cyberpunk';
import { Neobrutalism } from './templates/Neobrutalism';
import { DevTerminal } from './templates/DevTerminal';
import { BentoGrid } from './templates/BentoGrid';
import { AcademicLaTeX } from './templates/AcademicLaTeX';
import { GamifiedRPG } from './templates/GamifiedRPG';
import './templates/templates.css';

interface PortfolioFormShellProps {
  mode: 'create' | 'edit';
  initialData?: any;
}

const PortfolioFormShell: React.FC<PortfolioFormShellProps> = ({ mode, initialData }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [nextBtnShake, setNextBtnShake] = useState(false);
  const [saveBtnShake, setSaveBtnShake] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [fetchingRecommendations, setFetchingRecommendations] = useState(false);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file.');
      return;
    }

    setParsingResume(true);
    const toastId = toast.loading('Parsing resume PDF and auto-filling portfolio form...');
    
    const filePayload = new FormData();
    filePayload.append('file', file);

    try {
      const { data } = await api.post('/api/portfolio/ai/parse-resume', filePayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update form values with AI-parsed structure
      setFormValues({
        ...formData,
        title: data.title || formData.title,
        description: data.description || formData.description,
        skills: data.skills && data.skills.length ? data.skills : formData.skills,
        projects: data.projects && data.projects.length ? data.projects : formData.projects,
        education: data.education && data.education.length ? data.education : formData.education,
        professionalHistory: data.professionalHistory && data.professionalHistory.length ? data.professionalHistory : formData.professionalHistory,
        portfolioLinks: {
          github: data.portfolioLinks?.github || formData.portfolioLinks?.github || '',
          leetcode: data.portfolioLinks?.leetcode || formData.portfolioLinks?.leetcode || '',
          gfg: data.portfolioLinks?.gfg || formData.portfolioLinks?.gfg || '',
          linkedin: data.portfolioLinks?.linkedin || formData.portfolioLinks?.linkedin || '',
        },
      });

      toast.update(toastId, {
        render: 'Resume imported and form auto-filled successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 5000
      });
    } catch (err) {
      console.error('Failed to import resume:', err);
      toast.update(toastId, {
        render: 'Failed to parse resume. Please check format or try again.',
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      setParsingResume(false);
      e.target.value = ''; // clear file input
    }
  };

  const enhanceBioWithAi = async () => {
    if (!formData.description) return;
    setEnhancing(true);
    try {
      const { data } = await api.post('/api/portfolio/ai/enhance', { text: formData.description });
      if (data && data.enhanced) {
        setFormValues({
          ...formData,
          description: data.enhanced,
        });
        toast.success('Bio enhanced by AI successfully!');
      }
    } catch (err) {
      console.error('AI enhancement failed:', err);
      toast.error('AI enhancement failed. Please try again.');
    } finally {
      setEnhancing(false);
    }
  };

  const applyAiSuggestions = async () => {
    if (!aiSuggestion) return;
    setFormValues({
      ...formData,
      templateId: aiSuggestion.templateId ? aiSuggestion.templateId.toLowerCase() : formData.templateId,
      themeColor: aiSuggestion.themeColor || formData.themeColor,
      fontFamily: aiSuggestion.fontFamily || formData.fontFamily,
      borderRadius: aiSuggestion.borderRadius || formData.borderRadius,
      sectionOrder: aiSuggestion.sectionOrder || formData.sectionOrder,
      description: aiSuggestion.enhancedDescription || formData.description,
    });
    setAiSuggestion(null);
    toast.success('Applied AI theme recommendations! Review them and click Save.');

    try {
      await api.delete('/api/portfolio/ai/recommendations');
    } catch (err) {
      console.error('Failed to clear recommendations:', err);
    }
  };

  const discardAiSuggestions = async () => {
    setAiSuggestion(null);
    toast.info('Discarded AI recommendations.');

    try {
      await api.delete('/api/portfolio/ai/recommendations');
    } catch (err) {
      console.error('Failed to clear recommendations:', err);
    }
  };

  useEffect(() => {
    if (initialData && initialData.aiRecommendations) {
      setAiSuggestion(initialData.aiRecommendations);
    }
  }, [initialData]);

  const getAiRecommendations = async () => {
    setFetchingRecommendations(true);
    const toastId = toast.loading('Consulting AI design models for theme & layout recommendations...');
    try {
      const { data } = await api.post('/api/portfolio/ai/recommendations');
      if (data && data.recommendations) {
        setAiSuggestion(data.recommendations);
        toast.update(toastId, {
          render: '✨ AI has generated custom layout recommendations for you!',
          type: 'success',
          isLoading: false,
          autoClose: 6000
        });
      } else {
        toast.update(toastId, {
          render: 'AI did not return any recommendations. Please try again.',
          type: 'info',
          isLoading: false,
          autoClose: 5000
        });
      }
    } catch (err) {
      console.error('Failed to get AI recommendations:', err);
      toast.update(toastId, {
        render: 'Failed to fetch AI design suggestions. Make sure backend & ML service are active.',
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      setFetchingRecommendations(false);
    }
  };
  
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

  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [cropperSrc, setCropperSrc] = useState<string>('');
  const [cropperFileName, setCropperFileName] = useState<string>('');
  const [avatarSizeError, setAvatarSizeError] = useState<string>('');
  const [pdfSizeError, setPdfSizeError] = useState<string>('');
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(
    localStorage.getItem('portfolio_disable_animations') !== 'true'
  );

  useEffect(() => {
    let url = '';
    if (formData.avatar && (formData.avatar instanceof File || formData.avatar instanceof Blob)) {
      url = URL.createObjectURL(formData.avatar);
      setAvatarPreview(url);
    } else {
      setAvatarPreview('');
    }
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [formData.avatar]);

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 2MB
    const limit = 2 * 1024 * 1024;
    if (file.size > limit) {
      setAvatarSizeError('Image size exceeds 2MB limit. Please upload a smaller image.');
      toast.error('Image size exceeds 2MB limit. Please upload a smaller image.');
      e.target.value = '';
      return;
    }

    setAvatarSizeError('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCropperSrc(reader.result);
        setCropperFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 2MB
    const limit = 2 * 1024 * 1024;
    if (file.size > limit) {
      setPdfSizeError('PDF file size exceeds 2MB limit. Please upload a smaller resume.');
      toast.error('PDF file size exceeds 2MB limit. Please upload a smaller resume.');
      e.target.value = '';
      handlers.handleFileChange(e);
      return;
    }

    setPdfSizeError('');
    handlers.handleFileChange(e);
  };

  useEffect(() => {
    if (initialData) {
      setFormValues(initialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Scroll back to top of form pane and window when the step changes
  useEffect(() => {
    const pane = document.querySelector('.builder-left-form-pane');
    if (pane) {
      pane.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Utility: scroll to the first field-error in the current step
  const scrollToFirstError = () => {
    setTimeout(() => {
      const firstError = document.querySelector('.field-error-msg');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  // Utility: trigger shake on a button
  const triggerShake = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(true);
    setTimeout(() => setter(false), 600);
  };

  const STEP_NAMES = ['Details', 'Skills', 'Projects', 'Education', 'Experience', 'Links & PDF', 'Theme & Layout'];

  // Drag and Drop Section Reordering State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const sections = [...formData.sectionOrder];
    const draggedItem = sections[draggedIndex];
    sections.splice(draggedIndex, 1);
    sections.splice(index, 0, draggedItem);
    
    handlers.handleSectionOrderChange(sections);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { valid, firstFailingStep } = isFormValid();
    if (!valid) {
      triggerShake(setSaveBtnShake);
      const stepName = STEP_NAMES[firstFailingStep - 1] || 'a previous step';
      toast.error(`Please fix the errors in step ${firstFailingStep}: "${stepName}" before saving.`);
      // Navigate back to the first failing step so the user sees the errors
      setStep(firstFailingStep);
      scrollToFirstError();
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('templateId', formData.templateId);
      payload.append('themeColor', formData.themeColor);
      payload.append('fontFamily', formData.fontFamily);
      payload.append('borderRadius', formData.borderRadius);
      
      formData.sectionOrder.forEach((section, index) => {
        payload.append(`sectionOrder[${index}]`, section);
      });

      if (formData.pdf) {
        payload.append('pdf', formData.pdf);
      }

      if (formData.avatar && (formData.avatar instanceof File || formData.avatar instanceof Blob)) {
        payload.append('avatar', formData.avatar);
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
          (project.technologies || []).forEach((tech, tIdx) => {
            payload.append(`projects[${index}][technologies][${tIdx}]`, tech);
          });
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
          (history.technologies || []).forEach((tech, tIdx) => {
            payload.append(`professionalHistory[${index}][technologies][${tIdx}]`, tech);
          });
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

  // Render Live Preview template inside mini browser
  const renderLivePreview = () => {
    const mockUser = {
      _id: 'preview-user-id',
      name: user?.name || 'Your Name',
      email: user?.email || 'name@example.com',
      username: user?.username || 'username',
    };

    const previewPortfolio: Portfolio = {
      _id: 'preview-id',
      user: mockUser,
      title: formData.title || 'Portfolio Title',
      description: formData.description || 'Fill out the details on the left, and watch your portfolio build in real-time!',
      projects: formData.projects.filter(p => p.title.trim()),
      education: formData.education.filter(e => e.collegeName.trim()),
      professionalHistory: formData.professionalHistory.filter(h => h.companyName.trim()),
      portfolioLinks: formData.portfolioLinks,
      skills: formData.skills.filter(s => s.name.trim()),
      templateId: formData.templateId,
      sectionOrder: formData.sectionOrder,
      themeColor: formData.themeColor,
      fontFamily: formData.fontFamily,
      borderRadius: formData.borderRadius,
      avatarUrl: avatarPreview || (formData.avatar && (formData.avatar as any).contentType && formData._id ? `${baseUrl}/api/portfolio/avatar/${formData._id}` : ''),
    };

    const contactProps = {
      portfolio: previewPortfolio,
      contactForm: { name: '', email: '', phone: '', reason: '' },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      handleInputChange: () => {},
      handleSubmit: (e: React.FormEvent) => e.preventDefault(),
      handleScrollTo: (sectionId: string) => {
        const element = document.getElementById(`preview-${sectionId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      },
      isPreview: true,
    };

    switch (formData.templateId) {
      case 'dark-pro':
        return <DarkPro {...contactProps} />;
      case 'creative':
        return <Creative {...contactProps} />;
      case 'minimalist':
        return <Minimalist {...contactProps} />;
      case 'cyberpunk':
        return <Cyberpunk {...contactProps} />;
      case 'neobrutalism':
        return <Neobrutalism {...contactProps} />;
      case 'cli':
        return <DevTerminal {...contactProps} />;
      case 'bento':
        return <BentoGrid {...contactProps} />;
      case 'latex':
        return <AcademicLaTeX {...contactProps} />;
      case 'rpg':
        return <GamifiedRPG {...contactProps} />;
      case 'classic-green':
      default:
        return <ClassicGreen {...contactProps} />;
    }
  };

  // Step Indicators
  const renderStepIndicator = () => {
    const steps = ['Details', 'Skills', 'Projects', 'Education', 'Experience', 'Links & PDF', 'Theme & Layout'];

    // Determine which steps have active errors (so we can mark them red)
    const stepHasAnyError = (stepNum: number): boolean => {
      switch (stepNum) {
        case 1: return !!errors.title || !!errors.description;
        case 2: return errors.skills.some(s => !!s.name);
        case 3: return errors.projects.some(p => !!p.title || !!p.description || !!p.link);
        case 4: return errors.education.some(e => Object.values(e).some(Boolean));
        case 5: return errors.professionalHistory.some(h => Object.values(h).some(Boolean));
        case 6: return Object.values(errors.portfolioLinks).some(Boolean);
        default: return false;
      }
    };

    return (
      <div className="step-indicator-container">
        {steps.map((stepName, index) => {
          const stepNum = index + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;
          const hasError = !isActive && stepHasAnyError(stepNum);
          return (
            <div key={stepNum} className={`step-dot-wrapper ${isActive ? 'active' : ''} ${isCompleted && !hasError ? 'completed' : ''} ${hasError ? 'has-error' : ''}`}>
              <div className="step-dot" onClick={() => setStep(stepNum)}>
                {isCompleted && !hasError ? <FaCheck size={12} /> : stepNum}
              </div>
              <span className="step-label">{stepName}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const sectionLabels: Record<string, string> = {
    about: 'About Me & Education',
    skills: 'Technical Skills',
    experience: 'Work Experience',
    projects: 'Personal Projects',
    contact: 'Contact Form & Email',
  };

  const colorOptions = [
    { value: 'default', label: 'Theme Default' },
    { value: 'cyberpink', label: 'Cyberpink' },
    { value: 'emerald', label: 'Emerald Green' },
    { value: 'indigo', label: 'Indigo Blue' },
    { value: 'amber', label: 'Amber Orange' },
    { value: 'slate', label: 'Slate Grey' },
  ];

  const fontOptions = [
    { value: 'default', label: 'Theme Default' },
    { value: 'sans', label: 'Modern Sans' },
    { value: 'serif', label: 'Elegant Serif' },
    { value: 'grotesk', label: 'Space Grotesk' },
    { value: 'mono', label: 'Terminal Mono' },
  ];

  const radiusOptions = [
    { value: 'default', label: 'Theme Default' },
    { value: 'sharp', label: 'Sharp Corners' },
    { value: 'rounded', label: 'Soft Rounded' },
    { value: 'pill', label: 'Pill Shape' },
  ];

  return (
    <div className="portfolio-builder-split-container">
      {/* LEFT COLUMN: BUILDER FORM */}
      <div className="builder-left-form-pane">
        <div className="portfolio-wizard-container">
          {renderStepIndicator()}
          
          <form onSubmit={handleSubmit} className="portfolio-wizard-form card-glass">
            
            {aiSuggestion && (
              <div 
                className="ai-suggestion-alert-card"
                style={{
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(168, 85, 247, 0.1))',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ✨ AI Style Recommendation Ready
                  </h4>
                  <button 
                    type="button" 
                    onClick={discardAiSuggestions}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                  Our AI analyzed your profile and generated an optimized layout recommendation:
                  <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
                    <li><strong>Layout:</strong> {aiSuggestion.templateId || aiSuggestion.template}</li>
                    <li><strong>Theme Color:</strong> {aiSuggestion.themeColor}</li>
                    <li><strong>Typography:</strong> {aiSuggestion.fontFamily}</li>
                    <li><strong>Borders:</strong> {aiSuggestion.borderRadius}</li>
                  </ul>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={applyAiSuggestions}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.8rem',
                      background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      boxShadow: '0 2px 4px rgba(124, 58, 237, 0.2)'
                    }}
                  >
                    Apply AI Styling
                  </button>
                  <button
                    type="button"
                    onClick={discardAiSuggestions}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.8rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#cbd5e1',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Discard Suggestions
                  </button>
                </div>
              </div>
            )}
            
            {/* STEP 1: BASIC INFO */}
            {currentStep === 1 && (
              <div className="wizard-step-section animated fade-in">
                <h2>Basic Portfolio Details</h2>
                <p className="step-subtitle">Introduce yourself with a professional title and summary.</p>

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
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                    Upload your existing resume PDF to instantly auto-fill all portfolio steps.
                  </p>
                  <label 
                    htmlFor="resume-importer-file" 
                    className="btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      background: 'var(--accent-gradient)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '6px',
                      fontWeight: 600,
                      pointerEvents: parsingResume ? 'none' : 'auto',
                      opacity: parsingResume ? 0.6 : 1
                    }}
                  >
                    {parsingResume ? <FaSpinner className="spin" /> : <FaDownload />} 
                    {parsingResume ? 'AI Parsing...' : 'Select Resume PDF'}
                  </label>
                  <input
                    id="resume-importer-file"
                    type="file"
                    accept="application/pdf"
                    onChange={handleResumeUpload}
                    disabled={parsingResume}
                    style={{ display: 'none' }}
                  />
                </div>

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
                
                <div className="form-group">
                  <label htmlFor="title">Headline Title *</label>
                  <ComboBox
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handlers.handleChange}
                    suggestions={HEADLINE_SUGGESTIONS}
                    placeholder="e.g. Full Stack Developer"
                    required
                  />
                  {errors.title && <span className="field-error-msg">{errors.title}</span>}
                </div>

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
            )}

            {/* STEP 2: SKILLS */}
            {currentStep === 2 && (
              <div className="wizard-step-section animated fade-in">
                <h2>Technical Skills</h2>
                <p className="step-subtitle">Add technical skills and group them in categories.</p>

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
                          <ComboBox
                            name="name"
                            value={skill.name}
                            onChange={(e) => handlers.handleSkillChange(e, index)}
                            suggestions={SKILL_SUGGESTIONS}
                            placeholder="e.g. React, Python, Docker…"
                            required
                          />
                          {errors.skills[index]?.name && <span className="field-error-msg">{errors.skills[index].name}</span>}
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
                <button type="button" onClick={handlers.addSkill} className="btn-add-item">
                  <FaPlus /> Add Skill
                </button>
              </div>
            )}

            {/* STEP 3: PROJECTS */}
            {currentStep === 3 && (
              <div className="wizard-step-section animated fade-in">
                <h2>Personal Projects</h2>
                <p className="step-subtitle">Feature your best code projects and case studies.</p>

                <div className="dynamic-items-list">
                  {formData.projects.map((proj, index) => (
                    <div key={index} className="wizard-item-card glass-card">
                      <div className="wizard-item-header">
                        <h4>Project #{index + 1}</h4>
                        {formData.projects.length > 1 && (
                          <button type="button" onClick={() => handlers.removeProject(index)} className="btn-icon btn-remove">
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
                          {errors.projects[index]?.title && <span className="field-error-msg">{errors.projects[index].title}</span>}
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
                          {errors.projects[index]?.description && <span className="field-error-msg">{errors.projects[index].description}</span>}
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
                          {errors.projects[index]?.link && <span className="field-error-msg">{errors.projects[index].link}</span>}
                        </div>
                        <div className="form-group select-span-2">
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Technologies Used</label>
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
                              {(proj.technologies || []).map((tech, tIdx) => (
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
                                      const updatedTech = (proj.technologies || []).filter((_, idx) => idx !== tIdx);
                                      handlers.handleProjectCustomChange('technologies', updatedTech, index);
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
                              placeholder="Type technology name (e.g. React) and press Enter..."
                              style={{ border: 'none', background: 'none', outline: 'none', padding: '4px', width: '100%', fontSize: '0.85rem', color: 'inherit' }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const val = e.currentTarget.value.trim();
                                  if (val) {
                                    const currentTech = proj.technologies || [];
                                    if (!currentTech.includes(val)) {
                                      handlers.handleProjectCustomChange('technologies', [...currentTech, val], index);
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
                <button type="button" onClick={handlers.addProject} className="btn-add-item">
                  <FaPlus /> Add Project
                </button>
              </div>
            )}

            {/* STEP 4: EDUCATION */}
            {currentStep === 4 && (
              <div className="wizard-step-section animated fade-in">
                <h2>Academic Credentials</h2>
                <p className="step-subtitle">Your college, high school, or bootcamp degrees.</p>

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
                            placeholder="e.g. Stanford University"
                            required
                          />
                          {errors.education[index]?.collegeName && <span className="field-error-msg">{errors.education[index].collegeName}</span>}
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
                          {errors.education[index]?.degree && <span className="field-error-msg">{errors.education[index].degree}</span>}
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
                          {errors.education[index]?.branch && <span className="field-error-msg">{errors.education[index].branch}</span>}
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
                          {errors.education[index]?.cgpaOrPercentage && <span className="field-error-msg">{errors.education[index].cgpaOrPercentage}</span>}
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
                          {errors.education[index]?.yearOfJoining && <span className="field-error-msg">{errors.education[index].yearOfJoining}</span>}
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
                          <ComboBox
                            name="position"
                            value={history.position}
                            onChange={(e) => handlers.handleProfessionalHistoryChange(e, index)}
                            suggestions={POSITION_SUGGESTIONS}
                            placeholder="e.g. Software Engineer, SDE-1…"
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
            )}

            {/* STEP 6: LINKS & PDF */}
            {currentStep === 6 && (
              <div className="wizard-step-section animated fade-in">
                <h2>Social Links & Resume File</h2>
                <p className="step-subtitle">Provide your public profile links and upload an optional resume PDF.</p>

                <div className="form-group">
                  <label htmlFor="github">GitHub Profile URL (Optional)</label>
                  <input
                    type="text"
                    id="github"
                    name="github"
                    value={formData.portfolioLinks.github}
                    onChange={handlers.handlePortfolioLinksChange}
                    onBlur={handlers.handlePortfolioLinksBlur}
                    placeholder="e.g. https://github.com/username"
                  />
                  {errors.portfolioLinks?.github && <span className="field-error-msg">{errors.portfolioLinks.github}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="leetcode">LeetCode Profile URL (Optional)</label>
                  <input
                    type="text"
                    id="leetcode"
                    name="leetcode"
                    value={formData.portfolioLinks.leetcode}
                    onChange={handlers.handlePortfolioLinksChange}
                    onBlur={handlers.handlePortfolioLinksBlur}
                    placeholder="e.g. https://leetcode.com/username"
                  />
                  {errors.portfolioLinks?.leetcode && <span className="field-error-msg">{errors.portfolioLinks.leetcode}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="gfg">GeeksforGeeks Profile URL (Optional)</label>
                  <input
                    type="text"
                    id="gfg"
                    name="gfg"
                    value={formData.portfolioLinks.gfg}
                    onChange={handlers.handlePortfolioLinksChange}
                    onBlur={handlers.handlePortfolioLinksBlur}
                    placeholder="e.g. https://geeksforgeeks.org/user/username"
                  />
                  {errors.portfolioLinks?.gfg && <span className="field-error-msg">{errors.portfolioLinks.gfg}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="linkedin">LinkedIn Profile URL (Optional)</label>
                  <input
                    type="text"
                    id="linkedin"
                    name="linkedin"
                    value={formData.portfolioLinks.linkedin || ''}
                    onChange={handlers.handlePortfolioLinksChange}
                    onBlur={handlers.handlePortfolioLinksBlur}
                    placeholder="e.g. https://linkedin.com/in/username"
                  />
                  {errors.portfolioLinks?.linkedin && <span className="field-error-msg">{errors.portfolioLinks.linkedin}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="pdf-upload">Upload Custom CV PDF (Optional, defaults to dynamic PDF generator)</label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="pdf-upload"
                      name="pdf"
                      onChange={handlePdfFileSelect}
                      accept="application/pdf"
                    />
                    <span className="file-input-info">
                      {formData.pdf ? `Selected: ${formData.pdf.name}` : 'Choose a PDF file...'}
                    </span>
                    {pdfSizeError && <span className="field-error-msg" style={{ display: 'block', marginTop: '4px', color: '#ef4444' }}>{pdfSizeError}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: THEME & LAYOUT CUSTOMIZER */}
            {currentStep === 7 && (
              <div className="wizard-step-section animated fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h2>Theme & Custom Layout Builder</h2>
                    <p className="step-subtitle" style={{ margin: 0 }}>Configure design styling presets and drag sections to reorder them.</p>
                  </div>
                  <button
                    type="button"
                    onClick={getAiRecommendations}
                    disabled={fetchingRecommendations}
                    className="ai-recommend-btn"
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid #3b82f6',
                      color: '#3b82f6',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {fetchingRecommendations ? (
                      <>
                        <FaSpinner className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> Fetching Suggestions...
                      </>
                    ) : (
                      <>
                        ✨ Ask AI for Layout Ideas
                      </>
                    )}
                  </button>
                </div>

                {/* TEMPLATE PICKER */}
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 600 }}><FaTshirt /> Select Base Template</h4>
                  <div className="template-picker-grid" style={{ marginTop: '12px' }}>
                    <div className={`template-select-card ${formData.templateId === 'classic-green' ? 'selected' : ''}`} onClick={() => handlers.handleTemplateChange('classic-green')}>
                      <div className="template-preview-bar classic-green-bar"></div>
                      <div className="template-info"><h3>Classic Green</h3><p>Original professional clean layout.</p></div>
                    </div>
                    <div className={`template-select-card ${formData.templateId === 'dark-pro' ? 'selected' : ''}`} onClick={() => handlers.handleTemplateChange('dark-pro')}>
                      <div className="template-preview-bar dark-pro-bar"></div>
                      <div className="template-info"><h3>Dark Pro</h3><p>Sleek dark design with neon cards.</p></div>
                    </div>
                    <div className={`template-select-card ${formData.templateId === 'creative' ? 'selected' : ''}`} onClick={() => handlers.handleTemplateChange('creative')}>
                      <div className="template-preview-bar creative-bar"></div>
                      <div className="template-info"><h3>Creative Gradient</h3><p>Vibrant colors and animations.</p></div>
                    </div>
                    <div className={`template-select-card ${formData.templateId === 'minimalist' ? 'selected' : ''}`} onClick={() => handlers.handleTemplateChange('minimalist')}>
                      <div className="template-preview-bar minimalist-bar"></div>
                      <div className="template-info"><h3>Minimalist</h3><p>Sleek, high whitespace, clean serif.</p></div>
                    </div>
                    <div className={`template-select-card ${formData.templateId === 'cyberpunk' ? 'selected' : ''}`} onClick={() => handlers.handleTemplateChange('cyberpunk')}>
                      <div className="template-preview-bar cyberpunk-bar"></div>
                      <div className="template-info"><h3>Cyberpunk</h3><p>Neon hacking terminal monospace.</p></div>
                    </div>
                    <div className={`template-select-card ${formData.templateId === 'neobrutalism' ? 'selected' : ''}`} onClick={() => handlers.handleTemplateChange('neobrutalism')}>
                      <div className="template-preview-bar neobrutalism-bar"></div>
                      <div className="template-info"><h3>Neobrutalism</h3><p>Bold outlines and retro flat shadows.</p></div>
                    </div>
                    <div className={`template-select-card ${formData.templateId === 'cli' ? 'selected' : ''}`} onClick={() => handlers.handleTemplateChange('cli')}>
                      <div className="template-preview-bar cli-bar" style={{ background: '#00ff66' }}></div>
                      <div className="template-info"><h3>Dev Terminal (CLI)</h3><p>Interactive hacker shell console theme.</p></div>
                    </div>
                    <div className={`template-select-card ${formData.templateId === 'bento' ? 'selected' : ''}`} onClick={() => handlers.handleTemplateChange('bento')}>
                      <div className="template-preview-bar bento-bar" style={{ background: '#3b82f6' }}></div>
                      <div className="template-info"><h3>Bento Box</h3><p>Modern modular grid with 3D tilts.</p></div>
                    </div>
                    <div className={`template-select-card ${formData.templateId === 'latex' ? 'selected' : ''}`} onClick={() => handlers.handleTemplateChange('latex')}>
                      <div className="template-preview-bar latex-bar" style={{ background: '#111827' }}></div>
                      <div className="template-info"><h3>LaTeX Academic</h3><p>Scholarly serif layout, optimized for printing.</p></div>
                    </div>
                    <div className={`template-select-card ${formData.templateId === 'rpg' ? 'selected' : ''}`} onClick={() => handlers.handleTemplateChange('rpg')}>
                      <div className="template-preview-bar rpg-bar" style={{ background: '#fde047' }}></div>
                      <div className="template-info"><h3>Gamified (RPG)</h3><p>Retro 8-bit characters and quest timelines.</p></div>
                    </div>
                  </div>
                </div>

                <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '30px 0' }} />

                {/* STYLE ACCENTS OVERRIDES */}
                <div className="style-customizer-section">
                  <div className="style-control-group">
                    <h4><FaPalette /> Color Accent</h4>
                    <div className="style-options-grid">
                      {colorOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`style-option-btn ${formData.themeColor === opt.value ? 'selected' : ''}`}
                          onClick={() => handlers.handleStyleChange('themeColor', opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="style-control-group">
                    <h4><FaFont /> Typography Style</h4>
                    <div className="style-options-grid">
                      {fontOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`style-option-btn ${formData.fontFamily === opt.value ? 'selected' : ''}`}
                          onClick={() => handlers.handleStyleChange('fontFamily', opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="style-control-group">
                    <h4><FaShapes /> Accent Corners</h4>
                    <div className="style-options-grid">
                      {radiusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`style-option-btn ${formData.borderRadius === opt.value ? 'selected' : ''}`}
                          onClick={() => handlers.handleStyleChange('borderRadius', opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="style-control-group" style={{ marginTop: '20px' }}>
                    <h4>🎨 Animation Settings</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        id="toggle-animations-btn"
                        checked={animationsEnabled}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          localStorage.setItem('portfolio_disable_animations', enabled ? 'false' : 'true');
                          setAnimationsEnabled(enabled);
                          // Dispatch event to trigger direct visual react update in hooks
                          window.dispatchEvent(new Event('animations_toggle_changed'));
                        }}
                        style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                      />
                      <label htmlFor="toggle-animations-btn" style={{ cursor: 'pointer', fontSize: '0.9rem', userSelect: 'none' }}>
                        Enable interactive 3D Tilts & scroll reveals (reloads preview)
                      </label>
                    </div>
                  </div>
                </div>

                <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '30px 0' }} />

                {/* DRAG AND DROP REORDER LIST */}
                <div className="style-control-group">
                  <h4><FaBars /> Reorder Layout Sections</h4>
                  <p className="step-subtitle">Drag and drop sections to rearrange the layout order of your public portfolio page.</p>
                  
                  <div className="reorder-list-container">
                    {formData.sectionOrder.map((sectionId, idx) => (
                      <div
                        key={sectionId}
                        className={`reorder-item-card ${draggedIndex === idx ? 'dragging' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="reorder-item-content">
                          <FaBars className="reorder-handle" />
                          <span>{sectionLabels[sectionId] || sectionId}</span>
                        </div>
                      </div>
                    ))}
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
                <button
                  type="button"
                  className={`btn-primary select-right${nextBtnShake ? ' btn-shake' : ''}`}
                  onClick={() => {
                    const advanced = nextStep();
                    if (!advanced) {
                      triggerShake(setNextBtnShake);
                      const stepName = STEP_NAMES[currentStep - 1] || 'this step';
                      toast.warn(`⚠️ Fix errors in "${stepName}" before proceeding.`);
                      scrollToFirstError();
                    }
                  }}
                >
                  Next <FaArrowRight />
                </button>
              ) : (
                <button
                  type="submit"
                  className={`btn-primary submit-btn select-right${saveBtnShake ? ' btn-shake' : ''}`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="spinner-icon animate-spin" /> Saving...
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
      </div>

      {/* RIGHT COLUMN: RESPONSIVE BROWSER PREVIEW */}
      <div className="builder-right-preview-pane">
        <div className="preview-browser-mockup">
          <div className="browser-header">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
            <div className="browser-address">localhost:3000/portfolio/preview</div>
          </div>
          <div className="browser-content preview-mode">
            {renderLivePreview()}
          </div>
        </div>
      </div>
      {cropperSrc && (
        <ImageCropperModal
          imageSrc={cropperSrc}
          fileName={cropperFileName}
          onCrop={(croppedFile) => {
            handlers.handleAvatarChange(croppedFile);
            setCropperSrc('');
          }}
          onClose={() => setCropperSrc('')}
        />
      )}
    </div>
  );
};

export default PortfolioFormShell;
