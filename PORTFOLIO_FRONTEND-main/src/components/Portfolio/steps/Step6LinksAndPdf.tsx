import React from 'react';

interface Step6LinksAndPdfProps {
  portfolioLinks: {
    github: string;
    leetcode: string;
    gfg: string;
    linkedin: string;
  };
  handlers: {
    handlePortfolioLinksChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePortfolioLinksBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  };
  errors: {
    portfolioLinks?: {
      github?: string;
      leetcode?: string;
      gfg?: string;
      linkedin?: string;
    };
  };
  pdf: File | null;
  handlePdfFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pdfSizeError: string | null;
}

export const Step6LinksAndPdf: React.FC<Step6LinksAndPdfProps> = ({
  portfolioLinks,
  handlers,
  errors,
  pdf,
  handlePdfFileSelect,
  pdfSizeError,
}) => {
  return (
    <div className="wizard-step-section animated fade-in">
      <h2>Social Links & Resume File</h2>
      <p className="step-subtitle">Provide your public profile links and upload an optional resume PDF.</p>

      <div className="form-group">
        <label htmlFor="github">GitHub Profile URL (Optional)</label>
        <input
          type="text"
          id="github"
          name="github"
          value={portfolioLinks.github}
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
          value={portfolioLinks.leetcode}
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
          value={portfolioLinks.gfg}
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
          value={portfolioLinks.linkedin || ''}
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
            {pdf ? `Selected: ${pdf.name}` : 'Choose a PDF file...'}
          </span>
          {pdfSizeError && <span className="field-error-msg" style={{ display: 'block', marginTop: '4px', color: '#ef4444' }}>{pdfSizeError}</span>}
        </div>
      </div>
    </div>
  );
};

export default Step6LinksAndPdf;
