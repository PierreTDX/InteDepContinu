import React from 'react';
import './ConfirmModal.css';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{title}</h2>
                <div className="modal-body">
                    {children}
                </div>
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Annuler</button>
                    <button className="btn-confirm" onClick={onConfirm}>Confirmer</button>
                </div>
            </div>
        </div>
    );
}