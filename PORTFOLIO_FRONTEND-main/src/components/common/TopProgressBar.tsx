import React, { useEffect, useState } from 'react';
import './TopProgressBar.css';

export const TopProgressBar: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if the lazy chunk takes >40ms to avoid any sub-frame flash on warm cache hits
    const timer = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="top-progress-bar-container" role="progressbar" aria-label="Loading page">
      <div className="top-progress-bar-shimmer" />
    </div>
  );
};

export default TopProgressBar;
