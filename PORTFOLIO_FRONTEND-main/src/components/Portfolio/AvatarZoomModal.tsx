import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface AvatarZoomModalProps {
  avatarUrl: string;
  userName: string;
  onClose: () => void;
}

export const AvatarZoomModal: React.FC<AvatarZoomModalProps> = ({ avatarUrl, userName, onClose }) => {
  return (
    <div 
      className="crop-modal-overlay animated fade-in" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(15px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }} 
      onClick={onClose}
    >
      {/* Close button in absolute positioning */}
      <button 
        type="button" 
        onClick={onClose} 
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#f8fafc',
          cursor: 'pointer',
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          transition: 'all 0.25s ease-in-out',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 10000
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
        }}
      >
        <FaTimes />
      </button>

      {/* Image Container Card */}
      <div 
        style={{
          position: 'relative',
          maxWidth: '480px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'avatarZoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onClick={(e) => e.stopPropagation()} // Prevent close on clicking the container
      >
        <div style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '100%', // 1:1 Aspect Ratio
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.8)',
          border: '4px solid rgba(255, 255, 255, 0.15)'
        }}>
          <img
            src={avatarUrl}
            alt={userName}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
        
        {/* User metadata label */}
        <span style={{
          marginTop: '18px',
          fontSize: '1rem',
          fontWeight: 600,
          color: '#f8fafc',
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          padding: '6px 18px',
          borderRadius: '50px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}>
          {userName}
        </span>
      </div>
    </div>
  );
};
