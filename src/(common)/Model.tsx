"use client";

import React from 'react';
import { MdWarning } from 'react-icons/md';

type ReusableModalProps = {
  isOpen: boolean;
  message: string;
  id?: string;
  onConfirm: (id?: string) => void;
  onCancel: () => void;
};

const ReusableModal: React.FC<ReusableModalProps> = ({
  isOpen,
  message,
  id,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      
        <div className="modal-icon">
          <MdWarning />
        </div>

        <p className="modal-message">{message}</p>

        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="modal-btn modal-btn-confirm" onClick={() => onConfirm(id)}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReusableModal;