import React, { useState, useEffect, useRef } from 'react';
import { FaTerminal, FaSpinner } from 'react-icons/fa';
import { getSortedHistory, getSortedEducation } from '../../../utils/portfolioUtils';
import type { TemplateProps } from './common/types';
import { useTemplateModals } from './common/useTemplateModals';
import { TemplateModals } from './common/TemplateModals';
import { baseUrl } from '../../url';

interface HistoryItem {
  command: string;
  output: React.ReactNode;
  timestamp: string;
}

export const DevTerminal: React.FC<TemplateProps> = ({
  portfolio,
  contactForm,
  handleInputChange,
  handleSubmit,
  isPreview = false,
  theme,
  toggleTheme,
  isSendingEmail = false,
}) => {
  const modals = useTemplateModals();
  const hasAvatar = Boolean(portfolio.avatarUrl || (portfolio.avatar && portfolio.avatar.contentType));
  const avatarUrl = portfolio.avatarUrl || `${baseUrl}/api/portfolio/avatar/${portfolio._id}`;

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveName = portfolio.fullName || portfolio.user?.name || 'Developer';
  const userName = effectiveName.toLowerCase().replace(/\s+/g, '-');
  const promptUser = `guest@${userName}`;

  useEffect(() => {
    // Welcome message
    const welcomeOutput = (
      <div className="terminal-history-item">
        <pre className="terminal-ascii-art">{`
██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗ 
██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗
██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║
██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║
██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝
╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ 
        `}</pre>
        <p className="terminal-output-info">System: PortfolioOS v2.0 (Active)</p>
        {isPreview && <p className="terminal-output-accent">[PREVIEW MODE ACTIVE]</p>}
        <p className="terminal-output-success">Welcome to {effectiveName}'s interactive developer shell.</p>
        {hasAvatar && (
          <div 
            className="cli-welcome-avatar-card"
            onClick={(e) => {
              e.stopPropagation();
              modals.setZoomAvatar(true);
            }}
            title="Click to zoom operator avatar"
          >
            <img src={avatarUrl} alt={effectiveName} className="cli-welcome-avatar-img" />
            <div className="cli-welcome-avatar-info">
              <span className="cli-tag">[IDENTITY_NODE // VERIFIED]</span>
              <span className="cli-name">{effectiveName} &bull; {portfolio.title || 'Developer'}</span>
              <span className="cli-hint">&gt; Click to inspect identity record</span>
            </div>
          </div>
        )}
        <p className="terminal-output-accent">Type 'help' to see the list of available commands, or click the buttons above to run them.</p>
        <p style={{ margin: '15px 0 0 0', opacity: 0.6 }}>---------------------------------------------------------</p>
      </div>
    );
    setHistory([{ command: 'system --init', output: welcomeOutput, timestamp: new Date().toLocaleTimeString() }]);
  }, [effectiveName, portfolio.title, hasAvatar, avatarUrl, isPreview]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Run initial focus and focus on click anywhere in container
  useEffect(() => {
    focusInput();
  }, []);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const command = inputValue.trim();
    if (!command) return;

    executeCommand(command);
    setInputValue('');
  };

  const executeCommand = (cmd: string) => {
    const parts = cmd.toLowerCase().split(' ');
    const baseCmd = parts[0];
    const timestamp = new Date().toLocaleTimeString();
    let output: React.ReactNode = null;

    setCommandHistory((prev) => [cmd, ...prev]);
    setHistoryIndex(-1);

    switch (baseCmd) {
      case 'help':
        output = (
          <div className="terminal-output">
            <p className="terminal-output-accent">Available Commands:</p>
            <p>  <strong className="terminal-output-success">whoami</strong>       - Display operator identity and credentials</p>
            <p>  <strong className="terminal-output-success">about</strong>        - Print biographical details and background info</p>
            <p>  <strong className="terminal-output-success">skills</strong>       - Print technical skills and proficiency levels</p>
            <p>  <strong className="terminal-output-success">experience</strong>   - List professional employment history</p>
            <p>  <strong className="terminal-output-success">projects</strong>     - Display notable projects and code links</p>
            <p>  <strong className="terminal-output-success">contact</strong>      - Render details on how to get in touch</p>
            <p>  <strong className="terminal-output-success">clear</strong>        - Clear the terminal screen</p>
            <p>  <strong className="terminal-output-success">socials</strong>      - Show links to GitHub, LinkedIn, etc.</p>
          </div>
        );
        break;

      case 'whoami':
      case 'about':
        output = (
          <div className="terminal-output">
            {hasAvatar && (
              <div 
                className="cli-about-avatar-row"
                onClick={(e) => {
                  e.stopPropagation();
                  modals.setZoomAvatar(true);
                }}
                title="Click to zoom operator avatar"
              >
                <div className="cli-about-avatar-wrapper">
                  <img src={avatarUrl} alt={portfolio.user?.name || 'Operator'} className="cli-about-avatar-img" />
                  <span className="cli-about-badge">ID_01</span>
                </div>
                <div className="cli-about-avatar-details">
                  <div className="terminal-output-success" style={{ fontWeight: 'bold' }}>{portfolio.user?.name}</div>
                  <div className="terminal-output-accent" style={{ fontSize: '0.85rem' }}>&gt; Role: {portfolio.title || 'Developer'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#00cc52', opacity: 0.7, marginTop: '2px' }}>[STATUS: ACTIVE // CLICK TO EXPAND]</div>
                </div>
              </div>
            )}
            <h3 className="terminal-output-info">{"//"} PROFILE SUMMARY</h3>
            <p>{portfolio.description || 'No bio description provided.'}</p>
            
            <h3 className="terminal-output-info" style={{ marginTop: '15px' }}>{"//"} EDUCATION</h3>
            {portfolio.education && portfolio.education.length > 0 ? (
              getSortedEducation(portfolio.education).map((edu, idx) => (
                <div key={idx} style={{ marginTop: '10px' }}>
                  <p>🎓 <strong className="terminal-output-accent">{edu.collegeName}</strong> - {edu.degree} in {edu.branch}</p>
                  <p style={{ opacity: 0.8, fontSize: '0.85rem' }}>
                    Period: {edu.yearOfJoining ? new Date(edu.yearOfJoining).getFullYear() : 'N/A'} - {edu.isCurrentStudent ? 'Present' : (edu.yearOfPassing ? new Date(edu.yearOfPassing).getFullYear() : 'N/A')}
                  </p>
                  <p style={{ opacity: 0.8, fontSize: '0.85rem' }}>CGPA/Percentage: {edu.cgpaOrPercentage}</p>
                </div>
              ))
            ) : (
              <p>No education entries.</p>
            )}
          </div>
        );
        break;

      case 'skills':
        output = (
          <div className="terminal-output">
            <h3 className="terminal-output-info">{"//"} TECHNICAL COMPETENCIES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              {portfolio.skills && portfolio.skills.length > 0 ? (
                portfolio.skills.map((skill, idx) => {
                  const level = skill.level || 'Intermediate';
                  let bar = '[==========          ]';
                  let percent = '50%';
                  if (level === 'Expert') {
                    bar = '[====================]';
                    percent = '100%';
                  } else if (level === 'Intermediate') {
                    bar = '[==============      ]';
                    percent = '70%';
                  } else {
                    bar = '[=======             ]';
                    percent = '35%';
                  }

                  return (
                    <div key={idx} style={{ fontFamily: 'monospace' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '320px' }}>
                        <span>{skill.name}</span>
                        <span className="terminal-output-success">{level}</span>
                      </div>
                      <div style={{ color: '#00ff66', opacity: 0.85 }}>
                        {bar} {percent}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No skills specified.</p>
              )}
            </div>
          </div>
        );
        break;

      case 'experience':
        const sortedJobs = getSortedHistory(portfolio.professionalHistory);
        output = (
          <div className="terminal-output">
            <h3 className="terminal-output-info">{"//"} EMPLOYMENT HISTORY</h3>
            {sortedJobs.length > 0 ? (
              sortedJobs.map((job, idx) => (
                <div key={idx} style={{ marginBottom: '20px', borderBottom: '1px dashed rgba(0, 255, 102, 0.1)', paddingBottom: '12px' }}>
                  <p>💼 <strong className="terminal-output-accent">{job.companyName}</strong> - {job.position}</p>
                  <p style={{ opacity: 0.7, fontSize: '0.85rem' }}>
                    Dates: {job.yearOfJoining ? new Date(job.yearOfJoining).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'N/A'} -{' '}
                    {job.isCurrentEmployee ? 'Present' : job.yearOfLeaving ? new Date(job.yearOfLeaving).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'N/A'}
                  </p>
                  <ul style={{ margin: '8px 0 8px 15px', listStyleType: 'square' }}>
                    {job.responsibility.split('\n').map((line, lidx) => (
                      <li key={lidx}>{line}</li>
                    ))}
                  </ul>
                  {job.technologies && job.technologies.length > 0 && (
                    <p style={{ fontSize: '0.85rem' }}>
                      Technologies: <span style={{ color: '#00cc52' }}>{job.technologies.join(', ')}</span>
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p>No employment history found.</p>
            )}
          </div>
        );
        break;

      case 'projects':
        output = (
          <div className="terminal-output">
            <h3 className="terminal-output-info">{"//"} NOTABLE PROJECTS</h3>
            {portfolio.projects && portfolio.projects.length > 0 ? (
              portfolio.projects.map((proj, idx) => (
                <div key={idx} style={{ marginBottom: '20px', borderBottom: '1px dashed rgba(0, 255, 102, 0.1)', paddingBottom: '12px' }}>
                  <p>🚀 <strong className="terminal-output-accent">{proj.title}</strong></p>
                  <p style={{ margin: '5px 0' }}>{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p style={{ fontSize: '0.85rem' }}>
                      Stack: <span style={{ color: '#00cc52' }}>{proj.technologies.join(', ')}</span>
                    </p>
                  )}
                  {proj.link && (
                    <p style={{ fontSize: '0.85rem', marginTop: '5px' }}>
                      Link: <a href={proj.link} target="_blank" rel="noreferrer" style={{ color: '#00ccff', textDecoration: 'underline' }}>{proj.link}</a>
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p>No projects found.</p>
            )}
          </div>
        );
        break;

      case 'contact':
        output = (
          <div className="terminal-output">
            <h3 className="terminal-output-info">{"//"} CONTACT OPTIONS</h3>
            <p>Email: <strong className="terminal-output-accent">{portfolio.user?.email || 'N/A'}</strong></p>
            <p style={{ marginTop: '10px' }}>Fill out the message form below or submit using standard console commands.</p>
            
            <form onSubmit={handleSubmit} style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', color: '#00cc52', fontSize: '0.85rem' }}>Name:</label>
                <input 
                  type="text" 
                  name="name" 
                  value={contactForm.name} 
                  onChange={handleInputChange} 
                  style={{ width: '100%', background: '#0a0e14', border: '1px solid #003314', color: '#00ff66', padding: '6px', fontFamily: 'monospace', outline: 'none' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#00cc52', fontSize: '0.85rem' }}>Email:</label>
                <input 
                  type="email" 
                  name="email" 
                  value={contactForm.email} 
                  onChange={handleInputChange} 
                  style={{ width: '100%', background: '#0a0e14', border: '1px solid #003314', color: '#00ff66', padding: '6px', fontFamily: 'monospace', outline: 'none' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#00cc52', fontSize: '0.85rem' }}>Phone:</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={contactForm.phone} 
                  onChange={handleInputChange} 
                  style={{ width: '100%', background: '#0a0e14', border: '1px solid #003314', color: '#00ff66', padding: '6px', fontFamily: 'monospace', outline: 'none' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#00cc52', fontSize: '0.85rem' }}>Reason of Contact:</label>
                <textarea 
                  name="reason" 
                  value={contactForm.reason} 
                  onChange={handleInputChange} 
                  rows={4}
                  style={{ width: '100%', background: '#0a0e14', border: '1px solid #003314', color: '#00ff66', padding: '6px', fontFamily: 'monospace', outline: 'none', resize: 'vertical' }}
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isSendingEmail}
                style={{
                  background: 'rgba(0, 255, 102, 0.1)',
                  border: '1px solid #00ff66',
                  color: '#00ff66',
                  padding: '8px 12px',
                  cursor: isSendingEmail ? 'not-allowed' : 'pointer',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isSendingEmail ? 0.7 : 1,
                }}
              >
                {isSendingEmail ? (
                  <>
                    <FaSpinner className="spinner-icon" /> Sending Message...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        );
        break;

      case 'socials':
        output = (
          <div className="terminal-output">
            <h3 className="terminal-output-info">{"//"} CONNECT</h3>
            <div style={{ display: 'flex', gap: '15px', flexDirection: 'column', marginTop: '10px' }}>
              {portfolio.portfolioLinks?.github && (
                <p>🐱 GitHub: <a href={portfolio.portfolioLinks.github} target="_blank" rel="noreferrer" style={{ color: '#00ccff' }}>{portfolio.portfolioLinks.github}</a></p>
              )}
              {portfolio.portfolioLinks?.linkedin && (
                <p>🔗 LinkedIn: <a href={portfolio.portfolioLinks.linkedin} target="_blank" rel="noreferrer" style={{ color: '#00ccff' }}>{portfolio.portfolioLinks.linkedin}</a></p>
              )}
            </div>
          </div>
        );
        break;

      case 'clear':
        setHistory([]);
        return;

      default:
        output = (
          <p className="terminal-output-error">
            Command not recognized: '{baseCmd}'. Type 'help' to see the list of available commands.
          </p>
        );
    }

    setHistory((prev) => [...prev, { command: cmd, output, timestamp }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      
      const newIndex = historyIndex + 1;
      if (newIndex < commandHistory.length) {
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = historyIndex - 1;
      if (newIndex >= 0) {
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInputValue('');
      }
    }
  };

  const handleTabClick = (cmd: string) => {
    setInputValue(cmd);
    executeCommand(cmd);
  };

  return (
    <div className="cli-theme cli-container" onClick={focusInput}>
      <header className="terminal-header">
        <div className="terminal-header-top">
          <div className="terminal-header-brand">
            {hasAvatar && (
              <div 
                className="cli-avatar-badge" 
                onClick={(e) => {
                  e.stopPropagation();
                  modals.setZoomAvatar(true);
                }}
                title="Identity Node: Click to zoom avatar"
              >
                <div className="cli-avatar-frame">
                  <img 
                    src={avatarUrl} 
                    alt={portfolio.user?.name || 'Operator'} 
                    className="cli-avatar-img"
                  />
                  <span className="cli-avatar-status-dot" />
                </div>
                <div className="cli-avatar-meta">
                  <span className="cli-avatar-id">SYS_USER // AUTH</span>
                  <span className="cli-avatar-inspect">[ZOOM_ID]</span>
                </div>
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '1.5rem', color: '#00ff66', margin: 0 }}>
                <FaTerminal style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                {portfolio.user?.name ? portfolio.user.name.toUpperCase() : 'PORTFOLIO'}_SHELL
              </h1>
              <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: '2px 0 0 0' }}>
                Connected as Guest Node &bull; Host: {portfolio.user?.name || 'Host'}
              </p>
            </div>
          </div>
          {toggleTheme && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              style={{
                background: 'transparent',
                border: '1px solid #003314',
                color: '#00cc52',
                cursor: 'pointer',
                fontFamily: 'monospace',
                padding: '6px 12px',
                fontSize: '0.8rem'
              }}
            >
              Toggle Global Theme (currently {theme || 'default'})
            </button>
          )}
        </div>

        {/* Console Command Shortcuts */}
        <nav style={{ marginTop: '20px' }}>
          <ul className="terminal-nav">
            <li className="terminal-nav-item" onClick={() => handleTabClick('whoami')}>[whoami]</li>
            <li className="terminal-nav-item" onClick={() => handleTabClick('about')}>[about]</li>
            <li className="terminal-nav-item" onClick={() => handleTabClick('skills')}>[skills]</li>
            <li className="terminal-nav-item" onClick={() => handleTabClick('experience')}>[experience]</li>
            <li className="terminal-nav-item" onClick={() => handleTabClick('projects')}>[projects]</li>
            <li className="terminal-nav-item" onClick={() => handleTabClick('contact')}>[contact]</li>
            <li className="terminal-nav-item" onClick={() => handleTabClick('socials')}>[socials]</li>
            <li className="terminal-nav-item" onClick={() => handleTabClick('help')}>[help]</li>
            <li className="terminal-nav-item" onClick={() => handleTabClick('clear')}>[clear]</li>
          </ul>
        </nav>
      </header>

      <main style={{ minHeight: '60vh', overflowY: 'auto' }}>
        <div className="terminal-history">
          {history.map((item, idx) => (
            <div key={idx} className="terminal-history-item">
              <div style={{ display: 'flex', gap: '8px', opacity: 0.85, fontSize: '0.9rem' }}>
                <span className="terminal-prompt-prefix">&lt;</span>
                <span className="terminal-prompt-user">{promptUser}</span>
                <span className="terminal-prompt-prefix">/&gt;</span>
                <span className="terminal-prompt-dir">~</span>
                <span style={{ color: '#ffffff' }}>$</span>
                <span className="terminal-output-success" style={{ fontWeight: 'bold' }}>{item.command}</span>
                <span style={{ marginLeft: 'auto', opacity: 0.5, fontSize: '0.75rem' }}>{item.timestamp}</span>
              </div>
              {item.output}
            </div>
          ))}
        </div>

        {/* Input prompt line */}
        <form onSubmit={handleCommandSubmit} className="terminal-input-line">
          <span className="terminal-prompt-prefix">&lt;</span>
          <span className="terminal-prompt-user">{promptUser}</span>
          <span className="terminal-prompt-prefix">/&gt;</span>
          <span className="terminal-prompt-dir">~</span>
          <span style={{ color: '#ffffff' }}>$</span>
          <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              className="terminal-command-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoFocus
            />
            {/* Visual cursor effect */}
            <span className="terminal-cursor-indicator" style={{
              position: 'absolute',
              left: `${inputValue.length * 9.6}px`, // approximate spacing per mono char
              pointerEvents: 'none'
            }} />
          </div>
        </form>
        <div ref={terminalEndRef} />
      </main>

      {/* Modals for Avatar Zoom, Project Spotlight, and PDF Viewer */}
      <TemplateModals portfolio={portfolio} {...modals} />
    </div>
  );
};
