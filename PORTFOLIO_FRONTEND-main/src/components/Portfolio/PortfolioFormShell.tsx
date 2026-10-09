import React, { useState, useEffect, useDeferredValue } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaArrowRight, FaCheck, FaSpinner, FaTimes } from 'react-icons/fa';
import api from '../api';
import { usePortfolioForm } from '../../hooks/usePortfolioForm';
import { useAuth } from '../context/AuthContext';
import { ImageCropperModal } from '../common/ImageCropperModal';
import type { Portfolio } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import { baseUrl } from '../url';
import { HEADLINE_SUGGESTIONS } from '../../data/formSuggestions';
import './PortfolioForm.css';

import TemplateRenderer from './templates/TemplateRenderer';
import './templates/templates.css';

// Modular Step Components
import { Step1BasicInfo } from './steps/Step1BasicInfo';
import { Step2Skills } from './steps/Step2Skills';
import { Step3Projects } from './steps/Step3Projects';
import { Step4Education } from './steps/Step4Education';
import { Step5Experience } from './steps/Step5Experience';
import { Step6LinksAndPdf } from './steps/Step6LinksAndPdf';
import { Step7ThemeAndLayout } from './steps/Step7ThemeAndLayout';

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
  const [aiQuota, setAiQuota] = useState<{
    used: number;
    remaining: number | string;
    limit: number;
    isAdmin: boolean;
  } | null>(null);
  const [parsedSummary, setParsedSummary] = useState<{
    skillsCount: number;
    projectsCount: number;
    historyCount: number;
    educationCount: number;
  } | null>(null);

  const fetchAiQuota = async () => {
    try {
      const { data } = await api.get('/api/portfolio/ai/usage');
      setAiQuota(data);
    } catch (err) {
      // Non-blocking fallback
    }
  };

  useEffect(() => {
    fetchAiQuota();
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file.');
      return;
    }

    if (
      aiQuota &&
      !aiQuota.isAdmin &&
      typeof aiQuota.remaining === 'number' &&
      aiQuota.remaining <= 0
    ) {
      toast.error(
        'Daily AI resume import limit reached (4/4). Your free quota resets at 00:00 UTC.',
      );
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
        fullName: data.fullName || formData.fullName || '',
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

      const skillsCount = (data.skills && data.skills.length) || 0;
      const projectsCount = (data.projects && data.projects.length) || 0;
      const historyCount = (data.professionalHistory && data.professionalHistory.length) || 0;
      const educationCount = (data.education && data.education.length) || 0;

      setParsedSummary({
        skillsCount,
        projectsCount,
        historyCount,
        educationCount,
      });

      void fetchAiQuota();

      toast.update(toastId, {
        render: '🎉 Resume imported and form auto-filled successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 5000
      });
    } catch (err: any) {
      console.error('Failed to import resume:', err);
      const errMsg =
        err.response?.data?.message ||
        'Failed to parse resume. Please check format or try again.';
      toast.update(toastId, {
        render: errMsg,
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

  const deferredFormData = useDeferredValue(formData);

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
      if (formData.fullName) {
        payload.append('fullName', formData.fullName);
      }
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
            edu.isCurrentStudent
              ? ''
              : edu.yearOfPassing
              ? new Date(edu.yearOfPassing).toISOString()
              : '',
          );
          payload.append(
            `education[${index}][isCurrentStudent]`,
            String(Boolean(edu.isCurrentStudent)),
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
      name: deferredFormData.fullName || user?.name || 'Your Name',
      email: user?.email || 'name@example.com',
      username: user?.username || 'username',
    };

    const previewPortfolio: Portfolio = {
      _id: 'preview-id',
      user: mockUser,
      fullName: deferredFormData.fullName,
      title: deferredFormData.title || 'Portfolio Title',
      description: deferredFormData.description || 'Fill out the details on the left, and watch your portfolio build in real-time!',
      projects: deferredFormData.projects.filter(p => p.title.trim()),
      education: deferredFormData.education.filter(e => e.collegeName.trim()),
      professionalHistory: deferredFormData.professionalHistory.filter(h => h.companyName.trim()),
      portfolioLinks: deferredFormData.portfolioLinks,
      skills: deferredFormData.skills.filter(s => s.name.trim()),
      templateId: deferredFormData.templateId,
      sectionOrder: deferredFormData.sectionOrder,
      themeColor: deferredFormData.themeColor,
      fontFamily: deferredFormData.fontFamily,
      borderRadius: deferredFormData.borderRadius,
      avatarUrl: avatarPreview || (deferredFormData.avatar && (deferredFormData.avatar as any).contentType && deferredFormData._id ? `${baseUrl}/api/portfolio/avatar/${deferredFormData._id}` : ''),
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

    return (
      <TemplateRenderer
        {...contactProps}
        templateId={deferredFormData.templateId}
      />
    );
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
      {/* Full-Page AI Processing Overlays */}
      {parsingResume && (
        <LoadingSpinner
          fullPage={true}
          size="lg"
          message="✨ AI is parsing your resume PDF and auto-filling your portfolio sections..."
        />
      )}
      {fetchingRecommendations && (
        <LoadingSpinner
          fullPage={true}
          size="lg"
          message="✨ Consulting AI design models for theme and layout recommendations..."
        />
      )}

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
              <Step1BasicInfo
                formData={formData}
                handlers={handlers}
                errors={errors}
                aiQuota={aiQuota}
                parsingResume={parsingResume}
                handleResumeUpload={handleResumeUpload}
                parsedSummary={parsedSummary}
                setParsedSummary={setParsedSummary}
                avatarPreview={avatarPreview}
                avatarSizeError={avatarSizeError}
                handleAvatarFileSelect={handleAvatarFileSelect}
                enhanceBioWithAi={enhanceBioWithAi}
                enhancing={enhancing}
                headlineSuggestions={HEADLINE_SUGGESTIONS}
              />
            )}

            {/* STEP 2: SKILLS */}
            {currentStep === 2 && (
              <Step2Skills
                skills={formData.skills}
                handlers={handlers}
                errors={errors}
              />
            )}

            {/* STEP 3: PROJECTS */}
            {currentStep === 3 && (
              <Step3Projects
                projects={formData.projects}
                handlers={handlers}
                errors={errors}
              />
            )}

            {/* STEP 4: EDUCATION */}
            {currentStep === 4 && (
              <Step4Education
                education={formData.education}
                handlers={handlers}
                errors={errors}
              />
            )}

            {/* STEP 5: EXPERIENCE */}
            {currentStep === 5 && (
              <Step5Experience
                professionalHistory={formData.professionalHistory}
                handlers={handlers}
                errors={errors}
              />
            )}

            {/* STEP 6: LINKS & PDF */}
            {currentStep === 6 && (
              <Step6LinksAndPdf
                portfolioLinks={formData.portfolioLinks}
                handlers={handlers}
                errors={errors}
                pdf={formData.pdf || null}
                handlePdfFileSelect={handlePdfFileSelect}
                pdfSizeError={pdfSizeError}
              />
            )}

            {/* STEP 7: THEME & LAYOUT */}
            {currentStep === 7 && (
              <Step7ThemeAndLayout
                formData={formData}
                handlers={handlers}
                getAiRecommendations={getAiRecommendations}
                fetchingRecommendations={fetchingRecommendations}
                colorOptions={colorOptions}
                fontOptions={fontOptions}
                radiusOptions={radiusOptions}
                animationsEnabled={animationsEnabled}
                setAnimationsEnabled={setAnimationsEnabled}
                draggedIndex={draggedIndex}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDragEnd={handleDragEnd}
                sectionLabels={sectionLabels}
              />
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
