import React, { useState, useRef, useEffect, MouseEvent, TouchEvent } from 'react';
import { FaTimes, FaSearchPlus, FaSearchMinus, FaCrop } from 'react-icons/fa';

interface ImageCropperModalProps {
  imageSrc: string;
  fileName: string;
  onCrop: (croppedFile: File) => void;
  onClose: () => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageSrc,
  fileName,
  onCrop,
  onClose,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset positioning when imageSrc changes
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [imageSrc]);

  const handleStartDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { x: clientX - offset.x, y: clientY - offset.y };
  };

  const handleDrag = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setOffset({
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y,
    });
  };

  const handleStopDrag = () => {
    setIsDragging(false);
  };

  // Mouse Handlers
  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    handleStartDrag(e.clientX, e.clientY);
  };

  const onMouseMove = (e: MouseEvent) => {
    handleDrag(e.clientX, e.clientY);
  };

  // Touch Handlers (for mobile/tablet support)
  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      handleDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleCrop = () => {
    if (!imageRef.current || !containerRef.current) return;

    const canvas = document.createElement('canvas');
    const size = 300; // Output cropped image resolution: 300x300
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Fill with transparent or white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const img = imageRef.current;
    const container = containerRef.current;
    
    // Calculate display dimensions of the image inside the editor container
    const containerSize = container.clientWidth;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    
    // Calculate aspect ratio fit dimensions
    const ratio = Math.max(containerSize / imgWidth, containerSize / imgHeight);
    const fitWidth = imgWidth * ratio;
    const fitHeight = imgHeight * ratio;

    // Apply zoom and offset calculations
    const zoomedWidth = fitWidth * zoom;
    const zoomedHeight = fitHeight * zoom;

    // Center the image relative to offset
    const dx = (containerSize - zoomedWidth) / 2 + offset.x;
    const dy = (containerSize - zoomedHeight) / 2 + offset.y;

    // Map screen container coordinates to raw image scale
    const scaleX = imgWidth / zoomedWidth;
    const scaleY = imgHeight / zoomedHeight;

    const sx = -dx * scaleX;
    const sy = -dy * scaleY;
    const sWidth = containerSize * scaleX;
    const sHeight = containerSize * scaleY;

    // Draw raw portion onto the canvas
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);

    // Convert canvas back to File object
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], fileName || 'avatar.png', {
          type: 'image/png',
          lastModified: Date.now(),
        });
        onCrop(croppedFile);
      }
    }, 'image/png');
  };

  return (
    <div className="crop-modal-overlay animated fade-in" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="crop-modal-card card-glass" style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
            Adjust Profile Photo
          </h3>
          <button 
            type="button" 
            onClick={onClose} 
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Cropper Container */}
        <div style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Interactive Frame */}
          <div 
            ref={containerRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={handleStopDrag}
            onMouseLeave={handleStopDrag}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={handleStopDrag}
            style={{
              width: '280px',
              height: '280px',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '8px',
              backgroundColor: '#0f172a',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              touchAction: 'none',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)'
            }}
          >
            {/* Image display */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="To Crop"
              onLoad={() => {
                setOffset({ x: 0, y: 0 });
              }}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out'
              }}
            />

            {/* Circular Mask Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              border: '40px solid rgba(15, 23, 42, 0.65)',
              borderRadius: '50%',
              boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)'
            }} />

            {/* Guide Circle Border */}
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              width: '200px',
              height: '200px',
              pointerEvents: 'none',
              border: '2px dashed var(--primary-color, #10b981)',
              borderRadius: '50%',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)'
            }} />
          </div>

          <p style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            marginTop: '12px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Drag to reposition. Use the slider below to zoom.
          </p>

          {/* Zoom Slider Control */}
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#94a3b8',
            marginBottom: '16px'
          }}>
            <FaSearchMinus style={{ fontSize: '0.85rem' }} />
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{
                flex: 1,
                accentColor: 'var(--primary-color, #10b981)',
                cursor: 'pointer',
                height: '4px',
                borderRadius: '2px'
              }}
            />
            <FaSearchPlus style={{ fontSize: '0.85rem' }} />
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '16px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(15, 23, 42, 0.2)'
        }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleCrop}
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FaCrop /> Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};
