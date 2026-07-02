import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  fullPage = false,
  size = 'md',
}) => {
  const containerClass = fullPage
    ? 'spinner-container-fullpage'
    : 'spinner-container-relative';

  return (
    <div className={containerClass}>
      <div className={`spinner-wrapper size-${size}`}>
        <div className="spinner-ring">
          <div className="spinner-ring-inner"></div>
        </div>
        {message && <p className="spinner-message">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
