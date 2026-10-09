import React, { useState, useEffect } from 'react';
import {
  RESUME_PARSING_FACTS,
  PARSING_PHASES,
  ResumeParsingFact,
} from '../../data/resumeParsingFacts';
import './ResumeParsingLoader.css';

interface ResumeParsingLoaderProps {
  isOpen: boolean;
  message?: string;
}

const ResumeParsingLoader: React.FC<ResumeParsingLoaderProps> = ({
  isOpen,
  message = 'AI is analyzing your resume PDF and auto-generating portfolio sections...',
}) => {
  const [factIndex, setFactIndex] = useState<number>(0);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);

  // Cycle facts every 3.8 seconds with fade animation
  useEffect(() => {
    if (!isOpen) {
      setElapsed(0);
      setPhaseIndex(0);
      setFactIndex(0);
      return;
    }

    const factTimer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setFactIndex((prev) => (prev + 1) % RESUME_PARSING_FACTS.length);
        setIsFading(false);
      }, 300);
    }, 3800);

    // Elapsed seconds ticker
    const elapsedTimer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    // Advance simulated parsing phases
    const phaseTimer = setInterval(() => {
      setPhaseIndex((prev) => (prev < PARSING_PHASES.length - 1 ? prev + 1 : prev));
    }, 2800);

    return () => {
      clearInterval(factTimer);
      clearInterval(elapsedTimer);
      clearInterval(phaseTimer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentFact: ResumeParsingFact = RESUME_PARSING_FACTS[factIndex];

  return (
    <div className="resume-parsing-overlay" role="dialog" aria-modal="true" aria-label="Parsing Resume">
      <div className="resume-parsing-card card-glass">
        {/* Animated AI Neural Orb */}
        <div className="parsing-orb-container">
          <div className="parsing-orb-pulse" />
          <div className="parsing-orb-core">
            <span className="parsing-orb-sparkle">✨</span>
          </div>
        </div>

        {/* Header & Status */}
        <div className="parsing-header">
          <div className="parsing-badge">
            <span className="parsing-badge-dot" />
            <span>AI Neural Processing</span>
            <span className="parsing-elapsed-tag">{elapsed}s</span>
          </div>
          <h3 className="parsing-title">Analyzing Your Resume</h3>
          <p className="parsing-subtitle">{message}</p>
        </div>

        {/* Multi-Phase Progress Pipeline */}
        <div className="parsing-pipeline">
          {PARSING_PHASES.map((phase, idx) => {
            const isDone = idx < phaseIndex;
            const isCurrent = idx === phaseIndex;
            return (
              <div
                key={phase.step}
                className={`pipeline-step ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}
              >
                <div className="pipeline-dot">
                  {isDone ? '✓' : phase.icon}
                </div>
                <span className="pipeline-label">{phase.label}</span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Rotating Fact Box */}
        <div className="parsing-fact-card">
          <div className="fact-card-header">
            <span className="fact-category-pill">
              <span className="fact-icon">{currentFact.icon}</span>
              <span>{currentFact.tag}</span>
            </span>
            <span className="fact-counter">
              Fact {factIndex + 1} of {RESUME_PARSING_FACTS.length}
            </span>
          </div>

          <div className={`fact-text-wrapper ${isFading ? 'fade-out' : 'fade-in'}`}>
            <p className="fact-text">{currentFact.fact}</p>
          </div>

          {/* Fact carousel indicators */}
          <div className="fact-dots">
            {RESUME_PARSING_FACTS.map((_, i) => (
              <span
                key={i}
                className={`fact-dot ${i === factIndex ? 'active' : ''}`}
                onClick={() => setFactIndex(i)}
              />
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="parsing-footer">
          <span className="parsing-footer-hint">
            💡 Hang tight! We are populating your profile, projects, and skills automatically.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResumeParsingLoader;
