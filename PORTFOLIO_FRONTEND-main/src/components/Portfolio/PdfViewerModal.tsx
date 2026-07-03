import React from 'react';
import { FaTimes, FaFilePdf } from 'react-icons/fa';

interface PdfViewerModalProps {
  pdfUrl: string;
  fileName?: string;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ pdfUrl, fileName, onClose }) => {
  return (
    <div className="crop-modal-overlay animated fade-in" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }} onClick={onClose}>
      <div 
        className="pdf-viewer-card card-glass" 
        style={{
          width: '90%',
          maxWidth: '850px',
          height: '85vh',
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()} // Prevent close on container click
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaFilePdf style={{ color: '#ef4444', fontSize: '1.25rem' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              {fileName || 'Curriculum Vitae / Resume'}
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              transition: 'color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#f1f5f9')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <FaTimes />
          </button>
        </div>

        {/* PDF Frame wrapper */}
        <div style={{ flex: 1, position: 'relative', backgroundColor: '#334155' }}>
          <iframe
            src={pdfUrl}
            title="Resume PDF Viewer"
            width="100%"
            height="100%"
            style={{ border: 'none', display: 'block' }}
          />
        </div>
      </div>
    </div>
  );
};
