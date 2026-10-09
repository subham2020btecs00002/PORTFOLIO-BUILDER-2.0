import React from 'react';
import { FaSpinner, FaTshirt, FaPalette, FaFont, FaShapes, FaBars } from 'react-icons/fa';

interface Step7ThemeAndLayoutProps {
  formData: {
    templateId: string;
    themeColor: string;
    fontFamily: string;
    borderRadius: string;
    sectionOrder: string[];
  };
  handlers: {
    handleTemplateChange: (templateId: string) => void;
    handleStyleChange: (property: 'themeColor' | 'fontFamily' | 'borderRadius', value: string) => void;
  };
  getAiRecommendations: () => void;
  fetchingRecommendations: boolean;
  colorOptions: Array<{ value: string; label: string }>;
  fontOptions: Array<{ value: string; label: string }>;
  radiusOptions: Array<{ value: string; label: string }>;
  animationsEnabled: boolean;
  setAnimationsEnabled: (val: boolean) => void;
  draggedIndex: number | null;
  handleDragStart: (idx: number) => void;
  handleDragOver: (e: React.DragEvent, idx: number) => void;
  handleDragEnd: () => void;
  sectionLabels: Record<string, string>;
}

export const Step7ThemeAndLayout: React.FC<Step7ThemeAndLayoutProps> = ({
  formData,
  handlers,
  getAiRecommendations,
  fetchingRecommendations,
  colorOptions,
  fontOptions,
  radiusOptions,
  animationsEnabled,
  setAnimationsEnabled,
  draggedIndex,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  sectionLabels,
}) => {
  return (
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
            background: fetchingRecommendations ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
            border: '1px solid #3b82f6',
            color: '#3b82f6',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: fetchingRecommendations ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            opacity: fetchingRecommendations ? 0.75 : 1
          }}
        >
          {fetchingRecommendations ? (
            <>
              <FaSpinner className="spinner-icon" />
              <span>Analyzing with AI...</span>
            </>
          ) : (
            <>✨ Ask AI for Layout Ideas</>
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
  );
};

export default Step7ThemeAndLayout;
