"use client";

import React from 'react';
import { MdWarning } from 'react-icons/md';
import OvalLoader from '@/(common)/OvalLoader';

type ReusableModalProps = {
  isOpen: boolean;
  message: string;
  id?: string;
  isLoading?: boolean;
  onConfirm: (id?: string) => void;
  onCancel: () => void;
};

const ReusableModal: React.FC<ReusableModalProps> = ({
  isOpen,
  message,
  id,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={isLoading ? undefined : onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      
        <div className="modal-icon">
          <MdWarning />
        </div>

        <p className="modal-message">{message}</p>

        <div className="modal-actions">
          <button 
            className="modal-btn modal-btn-cancel" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="modal-btn modal-btn-confirm" 
            onClick={() => onConfirm(id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span>Processing...</span>
                <OvalLoader height="18" width="18" color="#ffffff" ariaLabel="oval-loading" />
              </span>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReusableModal;