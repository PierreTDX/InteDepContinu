/**
 * @file ConfirmModal.jsx
 * Reusable modal component for confirming critical actions.
 */

import React from 'react';
import './ConfirmModal.css';

/**
 * ConfirmModal Component
 *
 * A reusable modal component to ask for user confirmation before executing a critical action.
 *
 * @module ConfirmModal
 * @component
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Determines if the modal is visible.
 * @param {function} props.onClose - Function to call when the user cancels or closes the modal.
 * @param {function} props.onConfirm - Function to call when the user confirms the action.
 * @param {string} props.title - The title displayed at the top of the modal.
 * @param {React.ReactNode} props.children - The content displayed inside the modal body.
 *
 * @returns {JSX.Element|null} The modal element or null if not open.
 */
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