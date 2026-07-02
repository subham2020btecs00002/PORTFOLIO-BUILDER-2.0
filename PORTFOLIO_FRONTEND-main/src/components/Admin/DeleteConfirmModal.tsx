import React, { useState } from 'react';
import { FaExclamationTriangle, FaTimes, FaTrashAlt, FaSpinner } from 'react-icons/fa';
import './DeleteConfirmModal.css';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  targetType: 'user' | 'portfolio';
  targetName: string;
  targetEmail: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetType,
  targetName,
  targetEmail,
}) => {
  const [typedEmail, setTypedEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [btnShake, setBtnShake] = useState(false);

  if (!isOpen) return null;

  const isConfirmed = typedEmail.trim().toLowerCase() === targetEmail.trim().toLowerCase();

  const handleConfirmClick = async () => {
    if (!isConfirmed) {
      setBtnShake(true);
      setErrorMsg('The email you entered does not match the target email.');
      setTimeout(() => setBtnShake(false), 600);
      return;
    }

    setIsDeleting(true);
    setErrorMsg('');
    try {
      await onConfirm();
      setTypedEmail('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to complete deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop-blur">
      <div className="delete-modal-card card-glass animated slide-down">
        
        {/* Header */}
        <div className="delete-modal-header">
          <div className="header-title-wrapper text-danger">
            <FaExclamationTriangle className="warning-icon animate-pulse" />
            <h3>Delete {targetType === 'user' ? 'User Account' : 'User Portfolio'}</h3>
          </div>
          <button type="button" className="close-x-btn" onClick={onClose} disabled={isDeleting}>
            <FaTimes />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="delete-warning-banner">
          {targetType === 'user' ? (
            <p>
              <strong>CRITICAL WARNING:</strong> Deleting this user account will permanently remove all details, professional experiences, skills, projects, and custom layout themes. This action is <strong>irreversible</strong> and cascade-deletes their portfolio.
            </p>
          ) : (
            <p>
              <strong>WARNING:</strong> Deleting this portfolio will permanently erase the user's published website, themes, and uploaded documents. Their login credentials and profile account remain active.
            </p>
          )}
        </div>

        {/* Details Card */}
        <div className="delete-target-card">
          <div className="target-field">
            <span className="field-title">Account Holder</span>
            <span className="field-value">{targetName || 'N/A'}</span>
          </div>
          <div className="target-field">
            <span className="field-title">User Email</span>
            <span className="field-value highlight-email">{targetEmail}</span>
          </div>
        </div>

        {/* Action Prompt */}
        <div className="delete-modal-body">
          <label htmlFor="confirm-email-input">
            To proceed, type the user's email below to confirm:
          </label>
          <input
            id="confirm-email-input"
            type="text"
            className="delete-modal-input"
            placeholder={targetEmail}
            value={typedEmail}
            onChange={(e) => {
              setTypedEmail(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            disabled={isDeleting}
            autoComplete="off"
          />

          {errorMsg && <div className="modal-error-banner">{errorMsg}</div>}
        </div>

        {/* Footer Actions */}
        <div className="delete-modal-actions">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          
          <button
            type="button"
            className={`btn-modal-confirm ${isConfirmed ? 'active' : 'disabled'} ${btnShake ? 'modal-btn-shake' : ''}`}
            onClick={handleConfirmClick}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <FaSpinner className="spinner-icon animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <FaTrashAlt /> Confirm Permanent Deletion
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteConfirmModal;
